import { logger } from '../logger'
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService'
import { MemoryContextService } from './MemoryContextService'
import { ReasoningEngine, ReasoningResult, WorkingMemoryContext } from './ReasoningEngine'
import { QueryIntent } from './IntentClassifierService'
import { parseLLMJsonResponse } from '../utils'

/**
 * Resource interface
 */
export interface Resource {
  type: string
  name: string
  quantity: number
  unit: string
  cost?: number
}

/**
 * Time allocation interface
 */
export interface TimeAllocation {
  total: number
  perAction: Record<string, number>
}

/**
 * Resource priority type
 */
export type ResourcePriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Resource allocation interface
 */
export interface ResourceAllocation {
  estimatedCost: number
  requiredTools: string[]
  timeAllocation: TimeAllocation
  memoryRequirements: number
  priority: ResourcePriority
}

/**
 * Goal interface
 */
export interface Goal {
  id: string
  description: string
  priority: number
  successCriteria: string[]
  dependencies: string[]
  estimatedDuration: number
  requiredResources: Resource[]
  parentGoal?: string
}

/**
 * Error handling interface
 */
export interface ErrorHandling {
  strategy: 'retry' | 'skip' | 'fallback' | 'abort'
  maxRetries?: number
  fallbackAction?: string
  timeout?: number
}

/**
 * Action interface
 */
export interface Action {
  id: string
  description: string
  tool: string
  parameters: Record<string, any>
  estimatedDuration: number
  dependencies: string[]
  successCriteria: string[]
  errorHandling: ErrorHandling
  resourceRequirements: Resource[]
  subgoalId?: string
}

/**
 * Phase interface
 */
export interface Phase {
  name: string
  duration: number
  actions: string[]
  description: string
}

/**
 * Milestone interface
 */
export interface Milestone {
  name: string
  timestamp: number
  description: string
  successCriteria: string[]
}

/**
 * Timeline interface
 */
export interface Timeline {
  totalDuration: number
  phases: Phase[]
  milestones: Milestone[]
  criticalPath: string[]
}

/**
 * Fallback strategy interface
 */
export interface FallbackStrategy {
  condition: string
  action: string
  description: string
  successProbability: number
  resourceRequirements: Resource[]
}

/**
 * Risk interface
 */
export interface Risk {
  type: string
  description: string
  probability: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

/**
 * Risk assessment interface
 */
export interface RiskAssessment {
  risks: Risk[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  mitigationStrategies: string[]
}

/**
 * Execution plan interface
 */
export interface ExecutionPlan {
  originalQuery: string
  intent: QueryIntent
  goals: Goal[]
  subgoals: Goal[]
  actions: Action[]
  resourceAllocation: ResourceAllocation
  timeline: Timeline
  fallbackStrategies: FallbackStrategy[]
  estimatedDuration: number
  successProbability: number
  riskAssessment: RiskAssessment
}

/**
 * Tool registry interface for planning
 */
export interface PlanningToolRegistry {
  getAllTools(): Array<{
    name: string
    description: string
    parameters?: Record<string, any>
  }>
  getToolNames(): string[]
  getToolSchema(name: string): any
}

/**
 * Planning system configuration
 */
export interface PlanningSystemConfig {
  maxGoals: number
  maxSubgoals: number
  maxActions: number
  maxDuration: number
  enableFallbackStrategies: boolean
  enableRiskAssessment: boolean
  planningModel: string
  planningTemperature: number
}

/**
 * Planning System - Creates comprehensive execution plans
 */
export class PlanningSystem {
  private toolRegistry: PlanningToolRegistry
  private langchainService: SimpleLangChainService
  private memoryService: MemoryContextService
  private reasoningEngine: ReasoningEngine
  private config: PlanningSystemConfig

  constructor(
    langchainConfig: CoreKeysAndModels,
    toolRegistry: PlanningToolRegistry,
    memoryService: MemoryContextService,
    reasoningEngine: ReasoningEngine,
    config: Partial<PlanningSystemConfig> = {}
  ) {
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.toolRegistry = toolRegistry
    this.memoryService = memoryService
    this.reasoningEngine = reasoningEngine
    this.config = {
      maxGoals: 10,
      maxSubgoals: 50,
      maxActions: 100,
      maxDuration: 3600000, // 1 hour
      enableFallbackStrategies: true,
      enableRiskAssessment: true,
      planningModel: 'ollama',
      planningTemperature: 0.2,
      ...config
    }
  }

  /**
   * Create comprehensive execution plan
   */
  async createExecutionPlan(
    query: string,
    intent: QueryIntent,
    context: WorkingMemoryContext,
    reasoning: ReasoningResult
  ): Promise<ExecutionPlan> {
    try {
      logger.info(`Creating execution plan for query: "${query}"`)

      // 1. Extract goals from query and context
      const goals = await this.extractGoals(query, context, reasoning)
      logger.info(`Extracted ${goals.length} goals`)

      // 2. Decompose goals into subgoals
      const subgoals = await this.decomposeGoals(goals, context)
      logger.info(`Decomposed into ${subgoals.length} subgoals`)

      // 3. Plan actions for each subgoal
      const actions = await this.planActions(subgoals, intent, context)
      logger.info(`Planned ${actions.length} actions`)

      // 4. Allocate resources
      const resourceAllocation = await this.allocateResources(actions, context)
      logger.info(`Allocated resources: ${resourceAllocation.requiredTools.length} tools`)

      // 5. Create timeline
      const timeline = await this.createTimeline(actions, resourceAllocation)
      logger.info(`Created timeline: ${timeline.totalDuration}ms total duration`)

      // 6. Generate fallback strategies
      const fallbackStrategies = this.config.enableFallbackStrategies
        ? await this.generateFallbackStrategies(actions, context)
        : []
      logger.info(`Generated ${fallbackStrategies.length} fallback strategies`)

      // 7. Assess risks
      const riskAssessment = this.config.enableRiskAssessment
        ? await this.assessRisks(actions, context)
        : this.getEmptyRiskAssessment()
      logger.info(`Assessed risks: ${riskAssessment.overallRisk} overall risk`)

      // 8. Calculate success probability
      const successProbability = this.calculateSuccessProbability(actions, context, riskAssessment)
      logger.info(`Success probability: ${successProbability}`)

      const plan: ExecutionPlan = {
        originalQuery: query,
        intent,
        goals,
        subgoals,
        actions,
        resourceAllocation,
        timeline,
        fallbackStrategies,
        estimatedDuration: timeline.totalDuration,
        successProbability,
        riskAssessment
      }

      logger.info(`Execution plan created successfully`)
      return plan

    } catch (error) {
      logger.error('Failed to create execution plan:', error)
      throw new Error(`Failed to create execution plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract goals from query and context
   */
  private async extractGoals(
    query: string,
    context: WorkingMemoryContext,
    reasoning: ReasoningResult
  ): Promise<Goal[]> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 3000)
      
      const prompt = `
Extract goals from this query and context:

Query: "${query}"
Context: ${JSON.stringify(truncatedContext, null, 2)}
Reasoning: ${JSON.stringify({
  intent: reasoning.intent,
  thoughtProcess: reasoning.thoughtProcess,
  logicalConclusions: reasoning.logicalConclusions.slice(0, 3) // Limit to first 3
}, null, 2)}

Identify both explicit and implicit goals. For each goal, provide:
- description: clear goal description
- priority: priority level (1-10)
- successCriteria: measurable success criteria
- dependencies: other goals this depends on
- estimatedDuration: estimated time in milliseconds
- requiredResources: resources needed

Format as JSON with:
- goals: array of goals
`

      const response = await this.langchainService.complete(prompt, {
        model: this.config.planningModel,
        temperature: this.config.planningTemperature,
        maxTokens: 1000
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      const goals = (result.data.goals || []).map((goal: any, index: number) => ({
        id: `goal-${Date.now()}-${index}`,
        description: goal.description || '',
        priority: Math.max(1, Math.min(10, goal.priority || 5)),
        successCriteria: goal.successCriteria || [],
        dependencies: goal.dependencies || [],
        estimatedDuration: Math.max(1000, goal.estimatedDuration || 60000),
        requiredResources: goal.requiredResources || []
      }))

      return goals.slice(0, this.config.maxGoals)

    } catch (error) {
      logger.warn('Failed to extract goals:', error)
      return []
    }
  }

  /**
   * Decompose goals into subgoals
   */
  private async decomposeGoals(
    goals: Goal[],
    context: WorkingMemoryContext
  ): Promise<Goal[]> {
    try {
      const subgoals: Goal[] = []
      
      for (const goal of goals) {
        // Check if goal needs decomposition
        if (goal.estimatedDuration > 300000) { // 5 minutes
          const decomposed = await this.decomposeSingleGoal(goal, context)
          subgoals.push(...decomposed)
        } else {
          subgoals.push(goal)
        }
      }
      
      return subgoals.slice(0, this.config.maxSubgoals)

    } catch (error) {
      logger.warn('Failed to decompose goals:', error)
      return goals
    }
  }

  /**
   * Decompose a single goal into subgoals
   */
  private async decomposeSingleGoal(
    goal: Goal,
    context: WorkingMemoryContext
  ): Promise<Goal[]> {
    try {
      const prompt = `
Decompose this goal into smaller, manageable subgoals:

Goal: "${goal.description}"
Priority: ${goal.priority}
Success Criteria: ${JSON.stringify(goal.successCriteria)}
Context: ${JSON.stringify(this.truncateContext(context, 2000), null, 2)}

Break down into 3-5 subgoals that:
- Are specific and actionable
- Can be completed in 1-2 minutes each
- Have clear success criteria
- Are logically ordered

Format as JSON with:
- subgoals: array of subgoals
`

      const response = await this.langchainService.complete(prompt, {
        model: this.config.planningModel,
        temperature: this.config.planningTemperature,
        maxTokens: 800
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return (result.data.subgoals || []).map((subgoal: any, index: number) => ({
        id: `subgoal-${goal.id}-${index}`,
        description: subgoal.description || '',
        priority: subgoal.priority || goal.priority,
        successCriteria: subgoal.successCriteria || [],
        dependencies: subgoal.dependencies || [],
        estimatedDuration: Math.max(1000, subgoal.estimatedDuration || 60000),
        requiredResources: subgoal.requiredResources || [],
        parentGoal: goal.id
      }))

    } catch (error) {
      logger.warn('Failed to decompose single goal:', error)
      return [goal]
    }
  }

  /**
   * Plan actions for subgoals
   */
  private async planActions(
    subgoals: Goal[],
    intent: QueryIntent,
    context: WorkingMemoryContext
  ): Promise<Action[]> {
    try {
      const availableTools = this.toolRegistry.getAllTools()
      const actions: Action[] = []
      
      for (const subgoal of subgoals) {
        const subgoalActions = await this.planActionsForSubgoal(
          subgoal,
          intent,
          context,
          availableTools
        )
        actions.push(...subgoalActions)
      }
      
      // Sort actions by dependencies and priority
      return this.sortActionsByDependencies(actions).slice(0, this.config.maxActions)

    } catch (error) {
      logger.warn('Failed to plan actions:', error)
      return []
    }
  }

  /**
   * Plan actions for a specific subgoal
   */
  private async planActionsForSubgoal(
    subgoal: Goal,
    intent: QueryIntent,
    context: WorkingMemoryContext,
    availableTools: Array<{ name: string; description: string; parameters?: Record<string, any> }>
  ): Promise<Action[]> {
    try {
      const prompt = `
Plan specific actions to achieve this subgoal using ONLY the available tools:

Subgoal: "${subgoal.description}"
Success Criteria: ${JSON.stringify(subgoal.successCriteria)}
Intent: ${JSON.stringify(intent, null, 2)}
Available Tools: ${JSON.stringify(availableTools.slice(0, 10), null, 2)}
Context: ${JSON.stringify(this.truncateContext(context, 2000), null, 2)}

IMPORTANT: You MUST use ONLY the tools listed above. Do NOT create fake APIs or non-existent tools.
Do NOT use intent types like 'memory_chat', 'tool_execution', 'conversation' as tools - these are intent classifications, not executable tools.

For each action, provide:
- description: what the action does
- tool: which tool to use (MUST be from available tools list)
- parameters: tool parameters (use realistic values for the actual tool)
- estimatedDuration: time in milliseconds
- dependencies: other actions this depends on
- successCriteria: how to know it succeeded
- errorHandling: what to do if it fails
- resourceRequirements: resources needed

Tool-specific guidance:
- api_call: Use real URLs like "https://jsonplaceholder.typicode.com/users/1"
- weather_api: Use real cities like "New York" or "London"
- json_reader: Use valid JSON strings and paths
- file_reader: Use actual file paths
- github_api: Use real GitHub repositories

Format as JSON with:
- actions: array of actions
`

      const response = await this.langchainService.complete(prompt, {
        model: this.config.planningModel,
        temperature: this.config.planningTemperature,
        maxTokens: 1200
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return (result.data.actions || []).map((action: any, index: number) => {
        // Validate that the tool exists in available tools
        const availableToolNames = availableTools.map(t => t.name);
        const toolName = action.tool || '';
        
        if (!availableToolNames.includes(toolName)) {
          logger.warn(`Invalid tool '${toolName}' in action, skipping. Available tools: ${availableToolNames.join(', ')}`);
          return null;
        }

        return {
          id: `action-${subgoal.id}-${index}`,
          description: action.description || '',
          tool: toolName,
          parameters: action.parameters || {},
          estimatedDuration: Math.max(1000, action.estimatedDuration || 30000),
          dependencies: action.dependencies || [],
          successCriteria: action.successCriteria || [],
          errorHandling: action.errorHandling || { strategy: 'retry', maxRetries: 3 },
          resourceRequirements: action.resourceRequirements || [],
          subgoalId: subgoal.id
        };
      }).filter((action: any) => action !== null) // Remove null actions

    } catch (error) {
      logger.warn('Failed to plan actions for subgoal:', error)
      return []
    }
  }

  /**
   * Allocate resources for actions
   */
  private async allocateResources(
    actions: Action[],
    context: WorkingMemoryContext
  ): Promise<ResourceAllocation> {
    try {
      // Calculate resource requirements
      const requiredTools = [...new Set(actions.map(a => a.tool).filter(Boolean))]
      const totalTime = actions.reduce((sum, a) => sum + a.estimatedDuration, 0)
      const memoryRequirements = this.calculateMemoryRequirements(actions)
      
      // Calculate cost (if applicable)
      const estimatedCost = this.calculateCost(actions, context)
      
      // Determine priority
      const priority = this.determineResourcePriority(actions, context)
      
      return {
        estimatedCost,
        requiredTools,
        timeAllocation: {
          total: totalTime,
          perAction: actions.reduce((acc, a) => {
            acc[a.id] = a.estimatedDuration
            return acc
          }, {} as Record<string, number>)
        },
        memoryRequirements,
        priority
      }

    } catch (error) {
      logger.warn('Failed to allocate resources:', error)
      return {
        estimatedCost: 0,
        requiredTools: [],
        timeAllocation: { total: 0, perAction: {} },
        memoryRequirements: 0,
        priority: 'medium'
      }
    }
  }

  /**
   * Create timeline for actions
   */
  private async createTimeline(
    actions: Action[],
    resourceAllocation: ResourceAllocation
  ): Promise<Timeline> {
    try {
      // Create phases based on action dependencies
      const phases = this.createPhases(actions)
      
      // Identify milestones
      const milestones = this.createMilestones(actions, phases)
      
      // Calculate critical path
      const criticalPath = this.calculateCriticalPath(actions)
      
      return {
        totalDuration: resourceAllocation.timeAllocation.total,
        phases,
        milestones,
        criticalPath
      }

    } catch (error) {
      logger.warn('Failed to create timeline:', error)
      return {
        totalDuration: 0,
        phases: [],
        milestones: [],
        criticalPath: []
      }
    }
  }

  /**
   * Create phases from actions
   */
  private createPhases(actions: Action[]): Phase[] {
    const phases: Phase[] = []
    const processedActions = new Set<string>()
    
    let phaseIndex = 0
    let currentPhaseActions: Action[] = []
    
    while (processedActions.size < actions.length) {
      // Find actions that can be executed (no unprocessed dependencies)
      const readyActions = actions.filter(action => 
        !processedActions.has(action.id) &&
        action.dependencies.every(dep => processedActions.has(dep))
      )
      
      if (readyActions.length === 0) {
        // Handle circular dependencies
        const remainingActions = actions.filter(a => !processedActions.has(a.id))
        currentPhaseActions.push(...remainingActions)
        remainingActions.forEach(a => processedActions.add(a.id))
      } else {
        currentPhaseActions.push(...readyActions)
        readyActions.forEach(a => processedActions.add(a.id))
      }
      
      if (currentPhaseActions.length > 0) {
        phases.push({
          name: `Phase ${phaseIndex + 1}`,
          duration: currentPhaseActions.reduce((sum, a) => sum + a.estimatedDuration, 0),
          actions: currentPhaseActions.map(a => a.id),
          description: `Execute ${currentPhaseActions.length} actions`
        })
        
        currentPhaseActions = []
        phaseIndex++
      }
    }
    
    return phases
  }

  /**
   * Create milestones from actions and phases
   */
  private createMilestones(actions: Action[], phases: Phase[]): Milestone[] {
    const milestones: Milestone[] = []
    
    phases.forEach((phase, index) => {
      milestones.push({
        name: `Complete ${phase.name}`,
        timestamp: phases.slice(0, index + 1).reduce((sum, p) => sum + p.duration, 0),
        description: phase.description,
        successCriteria: [`Complete all actions in ${phase.name}`]
      })
    })
    
    return milestones
  }

  /**
   * Calculate critical path through actions
   */
  private calculateCriticalPath(actions: Action[]): string[] {
    // Simple critical path calculation based on dependencies
    const criticalPath: string[] = []
    const processed = new Set<string>()
    
    const processAction = (actionId: string) => {
      if (processed.has(actionId)) return
      
      const action = actions.find(a => a.id === actionId)
      if (!action) return
      
      // Process dependencies first
      action.dependencies.forEach(dep => processAction(dep))
      
      criticalPath.push(actionId)
      processed.add(actionId)
    }
    
    // Process all actions
    actions.forEach(action => processAction(action.id))
    
    return criticalPath
  }

  /**
   * Generate fallback strategies
   */
  private async generateFallbackStrategies(
    actions: Action[],
    context: WorkingMemoryContext
  ): Promise<FallbackStrategy[]> {
    try {
      const strategies: FallbackStrategy[] = []
      
      // Generate fallback for tool failures
      const toolFailures = actions.filter(a => a.tool).map(a => a.tool)
      const uniqueTools = [...new Set(toolFailures)]
      
      for (const tool of uniqueTools) {
        strategies.push({
          condition: `${tool} tool failure`,
          action: 'use_alternative_tool',
          description: `Use alternative tool when ${tool} fails`,
          successProbability: 0.7,
          resourceRequirements: []
        })
      }
      
      // Generate fallback for timeout
      strategies.push({
        condition: 'action timeout',
        action: 'retry_with_shorter_timeout',
        description: 'Retry action with shorter timeout',
        successProbability: 0.6,
        resourceRequirements: []
      })
      
      // Generate fallback for resource constraints
      strategies.push({
        condition: 'insufficient resources',
        action: 'simplify_plan',
        description: 'Simplify plan to use fewer resources',
        successProbability: 0.8,
        resourceRequirements: []
      })
      
      return strategies

    } catch (error) {
      logger.warn('Failed to generate fallback strategies:', error)
      return []
    }
  }

  /**
   * Assess risks for actions
   */
  private async assessRisks(
    actions: Action[],
    context: WorkingMemoryContext
  ): Promise<RiskAssessment> {
    try {
      const risks: Risk[] = []
      
      // Tool availability risks
      const toolRisks = actions
        .filter(a => a.tool)
        .map(a => ({
          type: 'tool_unavailable',
          description: `${a.tool} tool may not be available`,
          probability: 0.1,
          impact: 'high' as const,
          mitigation: 'Use fallback tool'
        }))
      
      risks.push(...toolRisks)
      
      // Timeout risks
      const timeoutRisks = actions
        .filter(a => a.estimatedDuration > 60000)
        .map(a => ({
          type: 'timeout',
          description: `${a.description} may timeout`,
          probability: 0.2,
          impact: 'medium' as const,
          mitigation: 'Implement timeout handling'
        }))
      
      risks.push(...timeoutRisks)
      
      // Resource constraint risks
      const resourceRisks = actions
        .filter(a => a.resourceRequirements.length > 0)
        .map(a => ({
          type: 'resource_constraint',
          description: `Insufficient resources for ${a.description}`,
          probability: 0.15,
          impact: 'medium' as const,
          mitigation: 'Allocate additional resources'
        }))
      
      risks.push(...resourceRisks)
      
      return {
        risks,
        overallRisk: this.calculateOverallRisk(risks),
        mitigationStrategies: this.generateMitigationStrategies(risks)
      }

    } catch (error) {
      logger.warn('Failed to assess risks:', error)
      return this.getEmptyRiskAssessment()
    }
  }

  /**
   * Calculate success probability
   */
  private calculateSuccessProbability(
    actions: Action[],
    context: WorkingMemoryContext,
    riskAssessment: RiskAssessment
  ): number {
    try {
      // Base probability from action complexity
      const baseProbability = Math.max(0.1, 1 - (actions.length * 0.05))
      
      // Adjust for risk level
      const riskAdjustment = {
        low: 0.1,
        medium: 0.2,
        high: 0.4,
        critical: 0.6
      }[riskAssessment.overallRisk] || 0.2
      
      // Adjust for resource availability
      const resourceAdjustment = context.episodicMemories.length > 0 ? 0.05 : 0
      
      const finalProbability = Math.max(0.1, Math.min(0.95, 
        baseProbability - riskAdjustment + resourceAdjustment
      ))
      
      return Math.round(finalProbability * 100) / 100

    } catch (error) {
      logger.warn('Failed to calculate success probability:', error)
      return 0.5
    }
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
   * Calculate memory requirements
   */
  private calculateMemoryRequirements(actions: Action[]): number {
    // Simple calculation based on number of actions
    return actions.length * 1024 * 1024 // 1MB per action
  }

  /**
   * Calculate cost
   */
  private calculateCost(actions: Action[], context: WorkingMemoryContext): number {
    // Simple cost calculation
    return actions.length * 0.01 // $0.01 per action
  }

  /**
   * Determine resource priority
   */
  private determineResourcePriority(actions: Action[], context: WorkingMemoryContext): ResourcePriority {
    const avgDuration = actions.reduce((sum, a) => sum + a.estimatedDuration, 0) / actions.length
    
    if (avgDuration > 300000) return 'critical' // 5 minutes
    if (avgDuration > 120000) return 'high'     // 2 minutes
    if (avgDuration > 60000) return 'medium'    // 1 minute
    return 'low'
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(risks: Risk[]): 'low' | 'medium' | 'high' | 'critical' {
    if (risks.length === 0) return 'low'
    
    const criticalRisks = risks.filter(r => r.impact === 'critical').length
    const highRisks = risks.filter(r => r.impact === 'high').length
    
    if (criticalRisks > 0) return 'critical'
    if (highRisks > 2) return 'high'
    if (highRisks > 0 || risks.length > 5) return 'medium'
    return 'low'
  }

  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(risks: Risk[]): string[] {
    const strategies: string[] = []
    
    if (risks.some(r => r.type === 'tool_unavailable')) {
      strategies.push('Implement tool fallback mechanisms')
    }
    
    if (risks.some(r => r.type === 'timeout')) {
      strategies.push('Add timeout handling and retry logic')
    }
    
    if (risks.some(r => r.type === 'resource_constraint')) {
      strategies.push('Optimize resource allocation and usage')
    }
    
    return strategies
  }

  /**
   * Truncate context to fit within token limits
   */
  private truncateContext(context: WorkingMemoryContext, maxTokens: number = 3000): WorkingMemoryContext {
    const truncatedContext = { ...context }
    
    // Truncate episodic memories (keep most recent and important)
    if (truncatedContext.episodicMemories) {
      truncatedContext.episodicMemories = truncatedContext.episodicMemories
        .sort((a, b) => b.metadata.importance - a.metadata.importance)
        .slice(0, 5) // Keep only top 5 most important
    }
    
    // Truncate semantic memories (keep most relevant)
    if (truncatedContext.semanticMemories) {
      truncatedContext.semanticMemories = truncatedContext.semanticMemories
        .sort((a, b) => b.metadata.confidence - a.metadata.confidence)
        .slice(0, 10) // Keep only top 10 most confident
    }
    
    return truncatedContext
  }

  /**
   * Get empty risk assessment
   */
  private getEmptyRiskAssessment(): RiskAssessment {
    return {
      risks: [],
      overallRisk: 'low',
      mitigationStrategies: []
    }
  }
}
