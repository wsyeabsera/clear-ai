import { logger } from '../logger'
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService'
import { IntentClassifierService, QueryIntent } from './IntentClassifierService'
import { Neo4jMemoryService } from './Neo4jMemoryService'
import { parseLLMJsonResponse } from '../utils'

/**
 * Working memory context interface
 */
export interface WorkingMemoryContext {
  userId: string
  sessionId: string
  episodicMemories: Array<{
    id: string
    timestamp: Date
    content: string
    metadata: {
      source: string
      importance: number
      tags: string[]
    }
  }>
  semanticMemories: Array<{
    id: string
    concept: string
    description: string
    metadata: {
      category: string
      confidence: number
    }
  }>
  contextWindow: {
    startTime: Date
    endTime: Date
    relevanceScore: number
  }
  model?: string
  temperature?: number
}

/**
 * Tool interface for reasoning
 */
export interface ReasoningTool {
  name: string
  description: string
  parameters?: Record<string, any>
}

/**
 * Thought process result
 */
export interface ThoughtProcess {
  steps: string[]
  reasoningType: 'deductive' | 'inductive' | 'abductive' | 'analogical'
  confidence: number
  assumptions: string[]
  limitations: string[]
}

/**
 * Logical conclusion
 */
export interface LogicalConclusion {
  conclusion: string
  confidence: number
  evidence: string[]
  reasoning: string
  type: 'factual' | 'inferential' | 'hypothetical'
}

/**
 * Causal factor
 */
export interface CausalFactor {
  factor: string
  type: 'cause' | 'effect' | 'mediator' | 'moderator'
  confidence: number
  description: string
}

/**
 * Causal relationship
 */
export interface CausalRelationship {
  cause: string
  effect: string
  confidence: number
  strength: 'weak' | 'moderate' | 'strong'
  description: string
}

/**
 * Causal chain
 */
export interface CausalChain {
  chain: string[]
  confidence: number
  description: string
}

/**
 * Causal analysis result
 */
export interface CausalAnalysis {
  factors: CausalFactor[]
  relationships: CausalRelationship[]
  chains: CausalChain[]
  confidence: number
}

/**
 * Analogy mapping
 */
export interface AnalogyMapping {
  sourceElement: string
  targetElement: string
  similarity: number
  description: string
}

/**
 * Analogy result
 */
export interface Analogy {
  description: string
  relevance: number
  source: string
  target: string
  mapping: AnalogyMapping[]
}

/**
 * Tool reasoning result
 */
export interface ToolReasoning {
  selectedTools: Array<{
    tool: string
    relevance: number
    reasoning: string
    parameters?: Record<string, any>
    priority: number
  }>
  reasoning: string
  confidence: number
}

/**
 * Reasoning step
 */
export interface ReasoningStep {
  step: number
  type: 'thought' | 'conclusion' | 'causal' | 'analogy' | 'tool'
  description: string
  confidence: number
}

/**
 * Uncertainty factor
 */
export interface UncertaintyFactor {
  factor: string
  impact: 'low' | 'medium' | 'high'
  description: string
  mitigation?: string
}

/**
 * Main reasoning result
 */
export interface ReasoningResult {
  intent: QueryIntent
  thoughtProcess: ThoughtProcess
  logicalConclusions: LogicalConclusion[]
  causalAnalysis: CausalAnalysis
  analogies: Analogy[]
  toolReasoning: ToolReasoning
  confidence: number
  reasoningPath: ReasoningStep[]
  uncertaintyFactors: UncertaintyFactor[]
}

/**
 * Reasoning options
 */
export interface ReasoningOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  includeAnalogies?: boolean
  includeCausalAnalysis?: boolean
  includeToolReasoning?: boolean
}

/**
 * Tool registry interface for reasoning
 */
export interface ReasoningToolRegistry {
  getAllTools(): ReasoningTool[]
  getToolNames(): string[]
  getToolSchema(name: string): any
  getAllToolSchemas(): any[]
}

/**
 * Advanced reasoning engine that provides sophisticated reasoning capabilities
 */
export class ReasoningEngine {
  private intentClassifier: IntentClassifierService
  private langchainService: SimpleLangChainService
  private memoryService: Neo4jMemoryService
  private toolRegistry: ReasoningToolRegistry

  constructor(
    langchainConfig: CoreKeysAndModels,
    intentClassifier: IntentClassifierService,
    memoryService: Neo4jMemoryService,
    toolRegistry: ReasoningToolRegistry
  ) {
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.intentClassifier = intentClassifier
    this.memoryService = memoryService
    this.toolRegistry = toolRegistry
  }

  /**
   * Perform comprehensive reasoning on a query with context
   */
  async reason(
    query: string,
    context: WorkingMemoryContext,
    availableTools: ReasoningTool[],
    options: ReasoningOptions = {}
  ): Promise<ReasoningResult> {
    try {
      logger.info(`Performing reasoning for query: "${query}"`)

      // 1. Intent classification (existing)
      const intent = await this.intentClassifier.classifyQuery(query, {
        memoryContext: context,
        includeAvailableTools: true,
        model: options.model,
        temperature: options.temperature
      })

      // 2. Chain of thought reasoning
      const thoughtProcess = await this.chainOfThoughtReasoning(query, context, options)

      // 3. Logical inference
      const logicalConclusions = await this.logicalInference(query, context, thoughtProcess, options)

      // 4. Causal analysis (if enabled)
      const causalAnalysis = options.includeCausalAnalysis !== false 
        ? await this.causalReasoning(query, context, thoughtProcess, options)
        : this.getEmptyCausalAnalysis()

      // 5. Analogical reasoning (if enabled)
      const analogies = options.includeAnalogies !== false
        ? await this.analogicalReasoning(query, context, options)
        : []

      // 6. Tool reasoning (if enabled)
      const toolReasoning = options.includeToolReasoning !== false
        ? await this.toolReasoning(query, context, availableTools, options)
        : this.getEmptyToolReasoning()

      // 7. Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        intent,
        thoughtProcess,
        logicalConclusions,
        causalAnalysis,
        toolReasoning
      )

      // 8. Generate reasoning path
      const reasoningPath = this.generateReasoningPath(
        thoughtProcess,
        logicalConclusions,
        causalAnalysis
      )

      // 9. Identify uncertainty factors
      const uncertaintyFactors = this.identifyUncertaintyFactors(
        thoughtProcess,
        logicalConclusions,
        causalAnalysis
      )

      const result: ReasoningResult = {
        intent,
        thoughtProcess,
        logicalConclusions,
        causalAnalysis,
        analogies,
        toolReasoning,
        confidence,
        reasoningPath,
        uncertaintyFactors
      }

      logger.info(`Reasoning completed with confidence: ${confidence}`)
      return result

    } catch (error) {
      logger.error('Failed to perform reasoning:', error)
      throw new Error(`Failed to perform reasoning: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Truncate context to fit within token limits
   */
  private truncateContext(context: WorkingMemoryContext, maxTokens: number = 4000): WorkingMemoryContext {
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
   * Chain of thought reasoning
   */
  private async chainOfThoughtReasoning(
    query: string,
    context: WorkingMemoryContext,
    options: ReasoningOptions
  ): Promise<ThoughtProcess> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 4000)
      
      const prompt = `
Analyze this query step by step using chain-of-thought reasoning:

Query: "${query}"
Context: ${JSON.stringify(truncatedContext, null, 2)}

Provide a detailed step-by-step reasoning process:
1. What is the user asking for?
2. What information do I need to answer this?
3. What are the key considerations?
4. What are potential approaches?
5. What are the risks or limitations?
6. What assumptions am I making?
7. What additional information would be helpful?

Format as JSON with:
- steps: array of reasoning steps
- reasoningType: type of reasoning used (deductive, inductive, abductive, analogical)
- confidence: confidence in reasoning (0-1)
- assumptions: array of assumptions made
- limitations: array of limitations identified
`

      const response = await this.langchainService.complete(prompt, {
        model: options.model,
        temperature: options.temperature || 0.3,
        maxTokens: options.maxTokens || 1000
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return {
        steps: result.data.steps || [],
        reasoningType: result.data.reasoningType || 'deductive',
        confidence: Math.max(0, Math.min(1, result.data.confidence || 0.5)),
        assumptions: result.data.assumptions || [],
        limitations: result.data.limitations || []
      }
    } catch (error) {
      logger.warn('Failed to perform chain-of-thought reasoning:', error)
      return {
        steps: ['Basic reasoning step'],
        reasoningType: 'deductive',
        confidence: 0.3,
        assumptions: [],
        limitations: ['Reasoning failed']
      }
    }
  }

  /**
   * Logical inference
   */
  private async logicalInference(
    query: string,
    context: WorkingMemoryContext,
    thoughtProcess: ThoughtProcess,
    options: ReasoningOptions
  ): Promise<LogicalConclusion[]> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 3000)
      
      const prompt = `
Based on the query and thought process, draw logical conclusions:

Query: "${query}"
Thought Process: ${JSON.stringify(thoughtProcess, null, 2)}
Context: ${JSON.stringify(truncatedContext, null, 2)}

Provide logical conclusions with:
- conclusion: the logical conclusion
- confidence: confidence in conclusion (0-1)
- evidence: supporting evidence
- reasoning: logical reasoning
- type: factual, inferential, or hypothetical

Format as JSON with:
- conclusions: array of logical conclusions
`

      const response = await this.langchainService.complete(prompt, {
        model: options.model,
        temperature: options.temperature || 0.2,
        maxTokens: options.maxTokens || 800
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return (result.data.conclusions || []).map((c: any) => ({
        conclusion: c.conclusion || '',
        confidence: Math.max(0, Math.min(1, c.confidence || 0.5)),
        evidence: c.evidence || [],
        reasoning: c.reasoning || '',
        type: c.type || 'inferential'
      }))
    } catch (error) {
      logger.warn('Failed to perform logical inference:', error)
      return []
    }
  }

  /**
   * Causal reasoning
   */
  private async causalReasoning(
    query: string,
    context: WorkingMemoryContext,
    thoughtProcess: ThoughtProcess,
    options: ReasoningOptions
  ): Promise<CausalAnalysis> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 3000)
      
      const prompt = `
Analyze causal relationships in this query:

Query: "${query}"
Thought Process: ${JSON.stringify(thoughtProcess, null, 2)}
Context: ${JSON.stringify(truncatedContext, null, 2)}

Identify:
- factors: causal factors (cause, effect, mediator, moderator)
- relationships: cause-effect relationships
- chains: causal chains

Format as JSON with:
- factors: array of causal factors
- relationships: array of causal relationships
- chains: array of causal chains
- confidence: overall confidence (0-1)
`

      const response = await this.langchainService.complete(prompt, {
        model: options.model,
        temperature: options.temperature || 0.2,
        maxTokens: options.maxTokens || 800
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return {
        factors: (result.data.factors || []).map((f: any) => ({
          factor: f.factor || '',
          type: f.type || 'cause',
          confidence: Math.max(0, Math.min(1, f.confidence || 0.5)),
          description: f.description || ''
        })),
        relationships: (result.data.relationships || []).map((r: any) => ({
          cause: r.cause || '',
          effect: r.effect || '',
          confidence: Math.max(0, Math.min(1, r.confidence || 0.5)),
          strength: r.strength || 'moderate',
          description: r.description || ''
        })),
        chains: (result.data.chains || []).map((c: any) => ({
          chain: c.chain || [],
          confidence: Math.max(0, Math.min(1, c.confidence || 0.5)),
          description: c.description || ''
        })),
        confidence: Math.max(0, Math.min(1, result.data.confidence || 0.5))
      }
    } catch (error) {
      logger.warn('Failed to perform causal reasoning:', error)
      return this.getEmptyCausalAnalysis()
    }
  }

  /**
   * Analogical reasoning
   */
  private async analogicalReasoning(
    query: string,
    context: WorkingMemoryContext,
    options: ReasoningOptions
  ): Promise<Analogy[]> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 3000)
      
      const prompt = `
Find analogies for this query:

Query: "${query}"
Context: ${JSON.stringify(truncatedContext, null, 2)}

Look for analogies that could help understand or solve the query.
Format as JSON with:
- analogies: array of analogies with description, relevance, source, target, and mapping
`

      const response = await this.langchainService.complete(prompt, {
        model: options.model,
        temperature: options.temperature || 0.4,
        maxTokens: options.maxTokens || 600
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return (result.data.analogies || []).map((a: any) => ({
        description: a.description || '',
        relevance: Math.max(0, Math.min(1, a.relevance || 0.5)),
        source: a.source || '',
        target: a.target || '',
        mapping: (a.mapping || []).map((m: any) => ({
          sourceElement: m.sourceElement || '',
          targetElement: m.targetElement || '',
          similarity: Math.max(0, Math.min(1, m.similarity || 0.5)),
          description: m.description || ''
        }))
      }))
    } catch (error) {
      logger.warn('Failed to perform analogical reasoning:', error)
      return []
    }
  }

  /**
   * Tool reasoning
   */
  private async toolReasoning(
    query: string,
    context: WorkingMemoryContext,
    availableTools: ReasoningTool[],
    options: ReasoningOptions
  ): Promise<ToolReasoning> {
    try {
      // Truncate context to prevent token limit issues
      const truncatedContext = this.truncateContext(context, 3000)
      
      const prompt = `
Analyze which tools would be most useful for this query:

Query: "${query}"
Context: ${JSON.stringify(truncatedContext, null, 2)}
Available Tools: ${JSON.stringify(availableTools, null, 2)}

For each relevant tool, provide:
- tool: tool name
- relevance: relevance score (0-1)
- reasoning: why this tool is useful
- parameters: suggested parameters
- priority: priority order

Format as JSON with:
- selectedTools: array of selected tools
- reasoning: overall reasoning
- confidence: confidence in tool selection (0-1)
`

      const response = await this.langchainService.complete(prompt, {
        model: options.model,
        temperature: options.temperature || 0.2,
        maxTokens: options.maxTokens || 800
      })

      const result = parseLLMJsonResponse(response.content)

      if (!result.success) {
        throw new Error(`Failed to parse response: ${result.error}`)
      }

      return {
        selectedTools: (result.data.selectedTools || []).map((t: any) => ({
          tool: t.tool || '',
          relevance: Math.max(0, Math.min(1, t.relevance || 0.5)),
          reasoning: t.reasoning || '',
          parameters: t.parameters || {},
          priority: t.priority || 1
        })),
        reasoning: result.data.reasoning || '',
        confidence: Math.max(0, Math.min(1, result.data.confidence || 0.5))
      }
    } catch (error) {
      logger.warn('Failed to perform tool reasoning:', error)
      return this.getEmptyToolReasoning()
    }
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    intent: QueryIntent,
    thoughtProcess: ThoughtProcess,
    logicalConclusions: LogicalConclusion[],
    causalAnalysis: CausalAnalysis,
    toolReasoning: ToolReasoning
  ): number {
    try {
      // Weighted combination of confidence factors
      const weights = {
        intent: 0.3,
        thoughtProcess: 0.25,
        logicalConclusions: 0.2,
        causalAnalysis: 0.15,
        toolReasoning: 0.1
      }

      const intentConfidence = intent.confidence || 0.5
      const thoughtConfidence = thoughtProcess.confidence || 0.5
      const logicalConfidence = logicalConclusions.length > 0 
        ? logicalConclusions.reduce((sum, c) => sum + c.confidence, 0) / logicalConclusions.length
        : 0.5
      const causalConfidence = causalAnalysis.confidence || 0.5
      const toolConfidence = toolReasoning.confidence || 0.5

      const overallConfidence = 
        (intentConfidence * weights.intent) +
        (thoughtConfidence * weights.thoughtProcess) +
        (logicalConfidence * weights.logicalConclusions) +
        (causalConfidence * weights.causalAnalysis) +
        (toolConfidence * weights.toolReasoning)

      return Math.max(0, Math.min(1, overallConfidence))
    } catch (error) {
      logger.warn('Failed to calculate overall confidence:', error)
      return 0.5
    }
  }

  /**
   * Generate reasoning path
   */
  private generateReasoningPath(
    thoughtProcess: ThoughtProcess,
    logicalConclusions: LogicalConclusion[],
    causalAnalysis: CausalAnalysis
  ): ReasoningStep[] {
    try {
      const path: ReasoningStep[] = []

      // Add thought process steps
      thoughtProcess.steps.forEach((step, index) => {
        path.push({
          step: index + 1,
          type: 'thought',
          description: step,
          confidence: thoughtProcess.confidence
        })
      })

      // Add logical conclusions
      logicalConclusions.forEach((conclusion, index) => {
        path.push({
          step: path.length + 1,
          type: 'conclusion',
          description: conclusion.conclusion,
          confidence: conclusion.confidence
        })
      })

      // Add causal relationships
      causalAnalysis.relationships.forEach((relationship, index) => {
        path.push({
          step: path.length + 1,
          type: 'causal',
          description: `${relationship.cause} → ${relationship.effect}`,
          confidence: relationship.confidence
        })
      })

      return path
    } catch (error) {
      logger.warn('Failed to generate reasoning path:', error)
      return []
    }
  }

  /**
   * Identify uncertainty factors
   */
  private identifyUncertaintyFactors(
    thoughtProcess: ThoughtProcess,
    logicalConclusions: LogicalConclusion[],
    causalAnalysis: CausalAnalysis
  ): UncertaintyFactor[] {
    try {
      const factors: UncertaintyFactor[] = []

      // Check thought process limitations
      thoughtProcess.limitations.forEach(limitation => {
        factors.push({
          factor: limitation,
          impact: 'medium',
          description: `Limitation in reasoning: ${limitation}`,
          mitigation: 'Consider alternative approaches or gather more information'
        })
      })

      // Check low confidence conclusions
      logicalConclusions.forEach(conclusion => {
        if (conclusion.confidence < 0.6) {
          factors.push({
            factor: `Low confidence conclusion: ${conclusion.conclusion}`,
            impact: 'high',
            description: `Conclusion has low confidence (${conclusion.confidence})`,
            mitigation: 'Seek additional evidence or validation'
          })
        }
      })

      // Check causal analysis uncertainty
      if (causalAnalysis.confidence < 0.6) {
        factors.push({
          factor: 'Uncertain causal relationships',
          impact: 'medium',
          description: 'Causal analysis has low confidence',
          mitigation: 'Gather more data or consider alternative explanations'
        })
      }

      return factors
    } catch (error) {
      logger.warn('Failed to identify uncertainty factors:', error)
      return []
    }
  }

  /**
   * Get empty causal analysis
   */
  private getEmptyCausalAnalysis(): CausalAnalysis {
    return {
      factors: [],
      relationships: [],
      chains: [],
      confidence: 0.5
    }
  }

  /**
   * Get empty tool reasoning
   */
  private getEmptyToolReasoning(): ToolReasoning {
    return {
      selectedTools: [],
      reasoning: 'No tool reasoning performed',
      confidence: 0.5
    }
  }
}
