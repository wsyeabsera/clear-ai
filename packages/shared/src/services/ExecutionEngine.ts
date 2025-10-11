import { logger } from '../logger'
import { ExecutionPlan, Action, Goal } from './PlanningSystem'
import { ToolExecutionService, ToolExecutionResult } from './ToolExecutionService'
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService'

/**
 * Execution result for a single action
 */
export interface ActionExecutionResult {
  actionId: string
  success: boolean
  result?: any
  error?: string
  executionTime: number
  toolResults?: ToolExecutionResult[]
}

/**
 * Execution result for a goal
 */
export interface GoalExecutionResult {
  goalId: string
  success: boolean
  completedActions: string[]
  failedActions: string[]
  executionTime: number
  results: ActionExecutionResult[]
}

/**
 * Overall execution result
 */
export interface ExecutionResult {
  planId: string
  success: boolean
  completedGoals: string[]
  failedGoals: string[]
  totalExecutionTime: number
  goalResults: GoalExecutionResult[]
  summary: string
  errors: string[]
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  maxConcurrentActions?: number
  timeoutPerAction?: number
  stopOnFirstFailure?: boolean
  retryFailedActions?: boolean
  maxRetries?: number
  dryRun?: boolean
}

/**
 * Execution Engine - Executes planned actions
 */
export class ExecutionEngine {
  private toolExecutionService: ToolExecutionService
  private langchainService: SimpleLangChainService
  private config: ExecutionOptions

  constructor(
    toolExecutionService: ToolExecutionService,
    langchainConfig: CoreKeysAndModels,
    config: Partial<ExecutionOptions> = {}
  ) {
    this.toolExecutionService = toolExecutionService
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.config = {
      maxConcurrentActions: 3,
      timeoutPerAction: 30000, // 30 seconds
      stopOnFirstFailure: false,
      retryFailedActions: true,
      maxRetries: 2,
      dryRun: false,
      ...config
    }
  }

  /**
   * Execute a complete execution plan
   */
  async executePlan(
    plan: ExecutionPlan,
    options: Partial<ExecutionOptions> = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const executionOptions = { ...this.config, ...options }
    
    logger.info(`Starting execution of plan with ${plan.actions.length} actions`)
    
    if (executionOptions.dryRun) {
      return this.simulateExecution(plan, startTime)
    }

    try {
      // Group actions by goal for better organization
      const actionsByGoal = this.groupActionsByGoal(plan.actions, plan.goals)
      
      const goalResults: GoalExecutionResult[] = []
      const completedGoals: string[] = []
      const failedGoals: string[] = []
      const errors: string[] = []

      // Execute goals in priority order
      const sortedGoals = plan.goals.sort((a, b) => b.priority - a.priority)
      
      for (const goal of sortedGoals) {
        const goalActions = actionsByGoal[goal.id] || []
        
        if (goalActions.length === 0) {
          logger.warn(`No actions found for goal: ${goal.id}`)
          continue
        }

        logger.info(`Executing goal: ${goal.description} (${goalActions.length} actions)`)
        
        const goalResult = await this.executeGoal(goal, goalActions, executionOptions)
        goalResults.push(goalResult)
        
        if (goalResult.success) {
          completedGoals.push(goal.id)
        } else {
          failedGoals.push(goal.id)
          errors.push(`Goal ${goal.description} failed: ${goalResult.failedActions.join(', ')}`)
          
          if (executionOptions.stopOnFirstFailure) {
            logger.warn('Stopping execution due to first failure policy')
            break
          }
        }
      }

      const totalExecutionTime = Date.now() - startTime
      const success = failedGoals.length === 0

      // Generate summary
      const summary = await this.generateExecutionSummary(plan, goalResults, totalExecutionTime)

      const result: ExecutionResult = {
        planId: plan.originalQuery,
        success,
        completedGoals,
        failedGoals,
        totalExecutionTime,
        goalResults,
        summary,
        errors
      }

      logger.info(`Execution completed: ${success ? 'SUCCESS' : 'FAILED'} in ${totalExecutionTime}ms`)
      return result

    } catch (error) {
      logger.error('Execution failed:', error)
      return {
        planId: plan.originalQuery,
        success: false,
        completedGoals: [],
        failedGoals: plan.goals.map(g => g.id),
        totalExecutionTime: Date.now() - startTime,
        goalResults: [],
        summary: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Execute a single goal with its actions
   */
  private async executeGoal(
    goal: Goal,
    actions: Action[],
    options: ExecutionOptions
  ): Promise<GoalExecutionResult> {
    const startTime = Date.now()
    const results: ActionExecutionResult[] = []
    const completedActions: string[] = []
    const failedActions: string[] = []

    // Sort actions by dependencies
    const sortedActions = this.sortActionsByDependencies(actions)

    // Execute actions in batches to respect concurrency limits
    const batches = this.createActionBatches(sortedActions, options.maxConcurrentActions!)

    for (const batch of batches) {
      const batchPromises = batch.map(action => this.executeAction(action, options))
      const batchResults = await Promise.allSettled(batchPromises)
      
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i]
        const action = batch[i]
        
        if (result.status === 'fulfilled') {
          const actionResult = result.value
          results.push(actionResult)
          
          if (actionResult.success) {
            completedActions.push(action.id)
          } else {
            failedActions.push(action.id)
            
            // Retry if enabled
            if (options.retryFailedActions && actionResult.error) {
              const retryResult = await this.retryAction(action, options)
              if (retryResult.success) {
                completedActions.push(action.id)
                failedActions.splice(failedActions.indexOf(action.id), 1)
                results[results.length - 1] = retryResult
              }
            }
          }
        } else {
          const error = result.reason
          results.push({
            actionId: action.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: 0
          })
          failedActions.push(action.id)
        }
      }

      // Check if we should stop due to failures
      if (options.stopOnFirstFailure && failedActions.length > 0) {
        break
      }
    }

    const executionTime = Date.now() - startTime
    const success = failedActions.length === 0

    return {
      goalId: goal.id,
      success,
      completedActions,
      failedActions,
      executionTime,
      results
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: Action,
    options: ExecutionOptions
  ): Promise<ActionExecutionResult> {
    const startTime = Date.now()
    
    try {
      logger.info(`Executing action: ${action.description}`)
      
      // Check if action has a tool assigned
      if (!action.tool) {
        return {
          actionId: action.id,
          success: false,
          error: 'No tool assigned to action',
          executionTime: Date.now() - startTime
        }
      }

      // Execute the tool
      const toolResult = await this.toolExecutionService.executeTool(
        action.tool,
        action.parameters,
        {
          timeout: options.timeoutPerAction
        }
      )

      const executionTime = Date.now() - startTime
      
      if (toolResult.success) {
        logger.info(`Action ${action.id} completed successfully in ${executionTime}ms`)
        return {
          actionId: action.id,
          success: true,
          result: toolResult.result,
          executionTime,
          toolResults: [toolResult]
        }
      } else {
        logger.warn(`Action ${action.id} failed: ${toolResult.error}`)
        return {
          actionId: action.id,
          success: false,
          error: toolResult.error,
          executionTime,
          toolResults: [toolResult]
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      logger.error(`Action ${action.id} execution failed:`, error)
      
      return {
        actionId: action.id,
        success: false,
        error: errorMessage,
        executionTime
      }
    }
  }

  /**
   * Retry a failed action
   */
  private async retryAction(
    action: Action,
    options: ExecutionOptions
  ): Promise<ActionExecutionResult> {
    logger.info(`Retrying action: ${action.description}`)
    
    // Add a small delay before retry
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return this.executeAction(action, options)
  }

  /**
   * Group actions by their parent goal
   */
  private groupActionsByGoal(actions: Action[], goals: Goal[]): Record<string, Action[]> {
    const actionsByGoal: Record<string, Action[]> = {}
    
    // Initialize with empty arrays for all goals
    goals.forEach(goal => {
      actionsByGoal[goal.id] = []
    })
    
    // Group actions by their subgoal's parent goal
    actions.forEach(action => {
      if (action.subgoalId) {
        // Find the parent goal of this subgoal
        const subgoal = goals.find(g => g.id === action.subgoalId)
        if (subgoal && subgoal.parentGoal) {
          if (!actionsByGoal[subgoal.parentGoal]) {
            actionsByGoal[subgoal.parentGoal] = []
          }
          actionsByGoal[subgoal.parentGoal].push(action)
        } else if (subgoal) {
          // Direct goal action
          actionsByGoal[subgoal.id].push(action)
        }
      }
    })
    
    return actionsByGoal
  }

  /**
   * Sort actions by dependencies
   */
  private sortActionsByDependencies(actions: Action[]): Action[] {
    const sorted: Action[] = []
    const processed = new Set<string>()
    
    const processAction = (action: Action) => {
      if (processed.has(action.id)) return
      
      // Process dependencies first
      action.dependencies.forEach(depId => {
        const depAction = actions.find(a => a.id === depId)
        if (depAction) processAction(depAction)
      })
      
      sorted.push(action)
      processed.add(action.id)
    }
    
    actions.forEach(action => processAction(action))
    
    return sorted
  }

  /**
   * Create action batches for concurrent execution
   */
  private createActionBatches(actions: Action[], maxConcurrent: number): Action[][] {
    const batches: Action[][] = []
    const processed = new Set<string>()
    
    while (processed.size < actions.length) {
      const batch: Action[] = []
      
      // Find actions that can be executed (no unprocessed dependencies)
      const readyActions = actions.filter(action => 
        !processed.has(action.id) &&
        action.dependencies.every(dep => processed.has(dep))
      )
      
      // Take up to maxConcurrent actions
      const batchActions = readyActions.slice(0, maxConcurrent)
      batch.push(...batchActions)
      
      // Mark as processed
      batchActions.forEach(action => processed.add(action.id))
      
      if (batch.length > 0) {
        batches.push(batch)
      } else {
        // Handle circular dependencies or remaining actions
        const remainingActions = actions.filter(a => !processed.has(a.id))
        if (remainingActions.length > 0) {
          batches.push(remainingActions.slice(0, maxConcurrent))
          remainingActions.slice(0, maxConcurrent).forEach(action => processed.add(action.id))
        }
      }
    }
    
    return batches
  }

  /**
   * Simulate execution for dry run
   */
  private simulateExecution(plan: ExecutionPlan, startTime: number): ExecutionResult {
    const totalExecutionTime = Date.now() - startTime
    
    return {
      planId: plan.originalQuery,
      success: true,
      completedGoals: plan.goals.map(g => g.id),
      failedGoals: [],
      totalExecutionTime,
      goalResults: plan.goals.map(goal => ({
        goalId: goal.id,
        success: true,
        completedActions: plan.actions.filter(a => a.subgoalId === goal.id).map(a => a.id),
        failedActions: [],
        executionTime: 0,
        results: []
      })),
      summary: `Dry run simulation completed for ${plan.actions.length} actions across ${plan.goals.length} goals`,
      errors: []
    }
  }

  /**
   * Generate execution summary
   */
  private async generateExecutionSummary(
    plan: ExecutionPlan,
    goalResults: GoalExecutionResult[],
    totalExecutionTime: number
  ): Promise<string> {
    try {
      const totalActions = plan.actions.length
      const completedActions = goalResults.reduce((sum, gr) => sum + gr.completedActions.length, 0)
      const failedActions = goalResults.reduce((sum, gr) => sum + gr.failedActions.length, 0)
      const successRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

      const prompt = `
Generate a concise execution summary for the following plan execution:

Plan: ${plan.originalQuery}
Total Actions: ${totalActions}
Completed Actions: ${completedActions}
Failed Actions: ${failedActions}
Success Rate: ${successRate.toFixed(1)}%
Total Execution Time: ${totalExecutionTime}ms

Goal Results:
${goalResults.map(gr => `- ${gr.goalId}: ${gr.success ? 'SUCCESS' : 'FAILED'} (${gr.completedActions.length}/${gr.completedActions.length + gr.failedActions.length} actions)`).join('\n')}

Provide a brief, professional summary of the execution results.
`

      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        maxTokens: 300
      })

      return response.content

    } catch (error) {
      logger.warn('Failed to generate execution summary:', error)
      const totalActions = goalResults.reduce((sum, gr) => sum + gr.completedActions.length + gr.failedActions.length, 0)
      const completedActions = goalResults.reduce((sum, gr) => sum + gr.completedActions.length, 0)
      return `Execution completed: ${completedActions}/${totalActions} actions successful in ${totalExecutionTime}ms`
    }
  }
}
