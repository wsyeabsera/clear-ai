# 📋 Planning System - Implementation Guide

## 📋 Overview

The Planning System is responsible for creating comprehensive execution plans based on user queries, reasoning results, and available tools. It transforms high-level goals into actionable steps with resource allocation, timelines, and fallback strategies.

## 🎯 Core Purpose

The Planning System handles:
- Goal extraction and decomposition
- Action planning and sequencing
- Resource allocation and optimization
- Timeline creation and management
- Fallback strategy generation
- Risk assessment and mitigation
- Success probability calculation

## 🏗️ Architecture

### **Service Dependencies**
```typescript
export class PlanningSystem {
  private toolRegistry: AgentToolRegistry
  private langchainService: SimpleLangChainService
  private memoryService: MemoryService
  private reasoningEngine: ReasoningEngine
}
```

### **Core Interfaces**
```typescript
interface ExecutionPlan {
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

interface Goal {
  id: string
  description: string
  priority: number
  successCriteria: string[]
  dependencies: string[]
  estimatedDuration: number
  requiredResources: Resource[]
}

interface Action {
  id: string
  description: string
  tool: string
  parameters: Record<string, any>
  estimatedDuration: number
  dependencies: string[]
  successCriteria: string[]
  errorHandling: ErrorHandling
  resourceRequirements: Resource[]
}

interface ResourceAllocation {
  estimatedCost: number
  requiredTools: string[]
  timeAllocation: TimeAllocation
  memoryRequirements: number
  priority: ResourcePriority
}

interface Timeline {
  totalDuration: number
  phases: Phase[]
  milestones: Milestone[]
  criticalPath: string[]
}

interface FallbackStrategy {
  condition: string
  action: string
  description: string
  successProbability: number
  resourceRequirements: Resource[]
}
```

## 🔧 Implementation Details

### **1. Core Methods**

#### **createExecutionPlan()**
```typescript
async createExecutionPlan(
  query: string,
  intent: QueryIntent,
  context: WorkingMemoryContext,
  reasoning: ReasoningResult
): Promise<ExecutionPlan> {
  try {
    // 1. Extract goals from query and context
    const goals = await this.extractGoals(query, context, reasoning)
    
    // 2. Decompose goals into subgoals
    const subgoals = await this.decomposeGoals(goals, context)
    
    // 3. Plan actions for each subgoal
    const actions = await this.planActions(subgoals, intent, context)
    
    // 4. Allocate resources
    const resourceAllocation = await this.allocateResources(actions, context)
    
    // 5. Create timeline
    const timeline = await this.createTimeline(actions, resourceAllocation)
    
    // 6. Generate fallback strategies
    const fallbackStrategies = await this.generateFallbackStrategies(actions, context)
    
    // 7. Assess risks
    const riskAssessment = await this.assessRisks(actions, context)
    
    // 8. Calculate success probability
    const successProbability = this.calculateSuccessProbability(actions, context, riskAssessment)
    
    return {
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
  } catch (error) {
    throw new Error(`Failed to create execution plan: ${error.message}`)
  }
}
```

### **2. Goal Extraction**

#### **extractGoals()**
```typescript
private async extractGoals(
  query: string,
  context: WorkingMemoryContext,
  reasoning: ReasoningResult
): Promise<Goal[]> {
  try {
    const prompt = `
    Extract goals from this query and context:
    
    Query: "${query}"
    Context: ${JSON.stringify(context, null, 2)}
    Reasoning: ${JSON.stringify(reasoning, null, 2)}
    
    Identify both explicit and implicit goals. For each goal, provide:
    - description: clear goal description
    - priority: priority level (1-10)
    - successCriteria: measurable success criteria
    - dependencies: other goals this depends on
    - estimatedDuration: estimated time in milliseconds
    - requiredResources: resources needed
    
    Format as JSON array of goals.
    `
    
    const response = await this.langchainService.complete(prompt, {
      model: 'openai',
      temperature: 0.3,
      maxTokens: 1000
    })
    
    const goals = JSON.parse(response.content)
    
    // Add unique IDs and validate goals
    return goals.map((goal: any, index: number) => ({
      id: `goal-${Date.now()}-${index}`,
      description: goal.description || '',
      priority: goal.priority || 5,
      successCriteria: goal.successCriteria || [],
      dependencies: goal.dependencies || [],
      estimatedDuration: goal.estimatedDuration || 60000,
      requiredResources: goal.requiredResources || []
    }))
  } catch (error) {
    console.warn('Failed to extract goals:', error.message)
    return []
  }
}
```

### **3. Goal Decomposition**

#### **decomposeGoals()**
```typescript
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
    
    return subgoals
  } catch (error) {
    console.warn('Failed to decompose goals:', error.message)
    return goals
  }
}

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
    Context: ${JSON.stringify(context, null, 2)}
    
    Break down into 3-5 subgoals that:
    - Are specific and actionable
    - Can be completed in 1-2 minutes each
    - Have clear success criteria
    - Are logically ordered
    
    Format as JSON array of subgoals.
    `
    
    const response = await this.langchainService.complete(prompt, {
      model: 'openai',
      temperature: 0.3,
      maxTokens: 800
    })
    
    const subgoals = JSON.parse(response.content)
    
    return subgoals.map((subgoal: any, index: number) => ({
      id: `subgoal-${goal.id}-${index}`,
      description: subgoal.description || '',
      priority: subgoal.priority || goal.priority,
      successCriteria: subgoal.successCriteria || [],
      dependencies: subgoal.dependencies || [],
      estimatedDuration: subgoal.estimatedDuration || 60000,
      requiredResources: subgoal.requiredResources || [],
      parentGoal: goal.id
    }))
  } catch (error) {
    console.warn('Failed to decompose single goal:', error.message)
    return [goal]
  }
}
```

### **4. Action Planning**

#### **planActions()**
```typescript
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
    return this.sortActionsByDependencies(actions)
  } catch (error) {
    console.warn('Failed to plan actions:', error.message)
    return []
  }
}

private async planActionsForSubgoal(
  subgoal: Goal,
  intent: QueryIntent,
  context: WorkingMemoryContext,
  availableTools: Tool[]
): Promise<Action[]> {
  try {
    const prompt = `
    Plan specific actions to achieve this subgoal:
    
    Subgoal: "${subgoal.description}"
    Success Criteria: ${JSON.stringify(subgoal.successCriteria)}
    Intent: ${JSON.stringify(intent, null, 2)}
    Available Tools: ${JSON.stringify(availableTools, null, 2)}
    Context: ${JSON.stringify(context, null, 2)}
    
    For each action, provide:
    - description: what the action does
    - tool: which tool to use
    - parameters: tool parameters
    - estimatedDuration: time in milliseconds
    - dependencies: other actions this depends on
    - successCriteria: how to know it succeeded
    - errorHandling: what to do if it fails
    - resourceRequirements: resources needed
    
    Format as JSON array of actions.
    `
    
    const response = await this.langchainService.complete(prompt, {
      model: 'openai',
      temperature: 0.2,
      maxTokens: 1200
    })
    
    const actions = JSON.parse(response.content)
    
    return actions.map((action: any, index: number) => ({
      id: `action-${subgoal.id}-${index}`,
      description: action.description || '',
      tool: action.tool || '',
      parameters: action.parameters || {},
      estimatedDuration: action.estimatedDuration || 30000,
      dependencies: action.dependencies || [],
      successCriteria: action.successCriteria || [],
      errorHandling: action.errorHandling || { strategy: 'retry', maxRetries: 3 },
      resourceRequirements: action.resourceRequirements || [],
      subgoalId: subgoal.id
    }))
  } catch (error) {
    console.warn('Failed to plan actions for subgoal:', error.message)
    return []
  }
}
```

### **5. Resource Allocation**

#### **allocateResources()**
```typescript
private async allocateResources(
  actions: Action[],
  context: WorkingMemoryContext
): Promise<ResourceAllocation> {
  try {
    // Calculate resource requirements
    const requiredTools = [...new Set(actions.map(a => a.tool))]
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
    console.warn('Failed to allocate resources:', error.message)
    return {
      estimatedCost: 0,
      requiredTools: [],
      timeAllocation: { total: 0, perAction: {} },
      memoryRequirements: 0,
      priority: 'medium'
    }
  }
}
```

### **6. Timeline Creation**

#### **createTimeline()**
```typescript
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
    console.warn('Failed to create timeline:', error.message)
    return {
      totalDuration: 0,
      phases: [],
      milestones: [],
      criticalPath: []
    }
  }
}

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
      processedActions.add(...remainingActions.map(a => a.id))
    } else {
      currentPhaseActions.push(...readyActions)
      processedActions.add(...readyActions.map(a => a.id))
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
```

### **7. Fallback Strategy Generation**

#### **generateFallbackStrategies()**
```typescript
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
    console.warn('Failed to generate fallback strategies:', error.message)
    return []
  }
}
```

### **8. Risk Assessment**

#### **assessRisks()**
```typescript
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
        impact: 'high',
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
        impact: 'medium',
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
        impact: 'medium',
        mitigation: 'Allocate additional resources'
      }))
    
    risks.push(...resourceRisks)
    
    return {
      risks,
      overallRisk: this.calculateOverallRisk(risks),
      mitigationStrategies: this.generateMitigationStrategies(risks)
    }
  } catch (error) {
    console.warn('Failed to assess risks:', error.message)
    return {
      risks: [],
      overallRisk: 'low',
      mitigationStrategies: []
    }
  }
}
```

## 🔄 Integration Points

### **With Reasoning Engine**
```typescript
// Planning System uses reasoning results for planning
const reasoning = await this.reasoningEngine.reason(query, context, availableTools)
const plan = await this.planningSystem.createExecutionPlan(
  query,
  reasoning.intent,
  context,
  reasoning
)
```

### **With Tool Execution Service**
```typescript
// Planning System provides actions for execution
const plan = await this.planningSystem.createExecutionPlan(query, intent, context, reasoning)
const executionResult = await this.toolExecutionService.executePlan(plan)
```

### **With Learning System**
```typescript
// Planning System provides planning patterns for learning
const plan = await this.planningSystem.createExecutionPlan(query, intent, context, reasoning)
await this.learningSystem.learnFromPlanning(plan, executionResult)
```

## 🧪 Testing Strategy

### **Unit Tests**
```typescript
describe('PlanningSystem', () => {
  describe('createExecutionPlan', () => {
    it('should create comprehensive execution plan', async () => {
      const plan = await planningSystem.createExecutionPlan(query, intent, context, reasoning)
      expect(plan).toHaveProperty('goals')
      expect(plan).toHaveProperty('actions')
      expect(plan).toHaveProperty('timeline')
      expect(plan).toHaveProperty('successProbability')
    })
    
    it('should handle complex queries', async () => {
      const complexQuery = 'Plan a comprehensive marketing campaign'
      const plan = await planningSystem.createExecutionPlan(complexQuery, intent, context, reasoning)
      expect(plan.goals.length).toBeGreaterThan(0)
      expect(plan.actions.length).toBeGreaterThan(0)
    })
  })
  
  describe('extractGoals', () => {
    it('should extract goals from query', async () => {
      const goals = await planningSystem.extractGoals('test query', context, reasoning)
      expect(goals).toBeInstanceOf(Array)
      expect(goals.every(g => g.id && g.description)).toBe(true)
    })
  })
})
```

### **Integration Tests**
```typescript
describe('PlanningSystem Integration', () => {
  it('should work with Reasoning Engine', async () => {
    const reasoning = await reasoningEngine.reason('test query', context, tools)
    const plan = await planningSystem.createExecutionPlan('test query', reasoning.intent, context, reasoning)
    expect(plan).toBeDefined()
  })
})
```

## 📊 Performance Considerations

### **Optimization Strategies**
1. **Parallel Planning**: Plan multiple subgoals in parallel
2. **Caching**: Cache planning results for similar queries
3. **Incremental Planning**: Update plans incrementally
4. **Resource Optimization**: Optimize resource allocation

### **Performance Metrics**
- **Planning Time**: < 1 second for complex plans
- **Plan Quality**: > 90% success rate for generated plans
- **Resource Efficiency**: > 85% resource utilization
- **Memory Usage**: < 50MB for planning operations

## 🚀 Deployment Considerations

### **Configuration**
```typescript
export const planningSystemConfig = {
  maxGoals: 10,
  maxSubgoals: 50,
  maxActions: 100,
  maxDuration: 3600000, // 1 hour
  enableFallbackStrategies: true,
  enableRiskAssessment: true,
  planningModel: 'openai',
  planningTemperature: 0.2
}
```

### **Monitoring**
- Track planning performance
- Monitor plan success rates
- Alert on planning failures
- Track resource utilization

## 🔧 Troubleshooting

### **Common Issues**
1. **Poor Plan Quality**: Adjust planning parameters and prompts
2. **Resource Conflicts**: Implement better resource allocation
3. **Timeline Issues**: Improve dependency resolution
4. **Performance Issues**: Add caching and parallel processing

### **Debug Tools**
```typescript
// Debug planning process
const debugInfo = await planningSystem.getDebugInfo(query, intent, context, reasoning)
console.log('Planning Debug:', debugInfo)
```

---

This implementation guide provides comprehensive details for building the Planning System, which transforms high-level goals into actionable execution plans with proper resource allocation and risk management.
