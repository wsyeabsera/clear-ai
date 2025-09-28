import { logger } from '../logger'
import { 
  MemorySearchQuery,
  MemoryContext,
  EpisodicMemory,
  SemanticMemory,
  MemoryService
} from '../types/memory'
import { 
  IntentClassifierService, 
  QueryIntent, 
  IntentClassificationOptions
} from './IntentClassifierService'
import { SimpleLangChainService } from './SimpleLangChainService'
import { ToolExecutionResult } from './ToolExecutionService'
import { RelationshipAnalysisService, DataStructureAnalysis, APIDataInsight } from './RelationshipAnalysisService'
import { EnhancedSemanticService, SemanticConcept, SemanticNetwork, ContextualUnderstanding } from './EnhancedSemanticService'

/**
 * Tool registry interface for agent service
 */
export interface AgentToolRegistry {
  getTool(name: string): any
  getAllTools(): Array<{ name: string; description: string }>
  getToolNames(): string[]
  getToolSchema(name: string): any
  getAllToolSchemas(): any[]
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  success: boolean
  response: string
  intent: QueryIntent
  memoryContext?: MemoryContext
  toolResults?: ToolExecutionResult[]
  reasoning?: string
  metadata?: {
    executionTime: number
    memoryRetrieved: number
    toolsExecuted: number
    confidence: number
  }
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  userId?: string
  sessionId?: string
  includeMemoryContext?: boolean
  maxMemoryResults?: number
  model?: string
  temperature?: number
  includeReasoning?: boolean
  previousIntents?: QueryIntent[]
}

/**
 * Agent service configuration
 */
export interface AgentServiceConfig {
  memoryService: MemoryService
  intentClassifier: IntentClassifierService
  langchainService: SimpleLangChainService
  toolRegistry: AgentToolRegistry
  defaultOptions?: Partial<AgentExecutionOptions>
}

/**
 * Main Agent Service that orchestrates memory, intent classification, and tool execution
 */
export class AgentService {
  private memoryService: MemoryService
  private intentClassifier: IntentClassifierService
  private langchainService: SimpleLangChainService
  private toolRegistry: AgentToolRegistry
  private relationshipAnalyzer: RelationshipAnalysisService
  private enhancedSemanticService: EnhancedSemanticService
  private config: AgentServiceConfig

  constructor(config: AgentServiceConfig) {
    this.config = config
    this.memoryService = config.memoryService
    this.intentClassifier = config.intentClassifier
    this.langchainService = config.langchainService
    this.toolRegistry = config.toolRegistry

    // Initialize enhanced services
    this.relationshipAnalyzer = new RelationshipAnalysisService({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      openaiModel: 'gpt-3.5-turbo',
      mistralApiKey: process.env.MISTRAL_API_KEY || '',
      mistralModel: 'mistral-small',
      groqApiKey: process.env.GROQ_API_KEY || '',
      groqModel: 'llama3-8b-8192',
      ollamaModel: 'llama2',
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
      langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
    });

    this.enhancedSemanticService = new EnhancedSemanticService({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      openaiModel: 'gpt-3.5-turbo',
      mistralApiKey: process.env.MISTRAL_API_KEY || '',
      mistralModel: 'mistral-small',
      groqApiKey: process.env.GROQ_API_KEY || '',
      groqModel: 'llama3-8b-8192',
      ollamaModel: 'llama2',
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
      langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
    });
  }

  /**
   * Initialize the agent service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing AgentService...')
      // Services should already be initialized by the caller
      logger.info('AgentService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize AgentService:', error)
      throw error
    }
  }

  /**
   * Main execution method that processes user queries
   */
  async executeQuery(
    query: string, 
    options: AgentExecutionOptions = {}
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now()
    
    try {
      logger.info(`Agent executing query: "${query}"`)

      // Merge with default options
      const executionOptions = {
        ...this.config.defaultOptions,
        ...options
      }

      // Step 1: Classify the query intent
      const intentOptions: IntentClassificationOptions = {
        model: executionOptions.model,
        temperature: executionOptions.temperature,
        includeAvailableTools: true,
        userContext: {
          userId: executionOptions.userId,
          sessionId: executionOptions.sessionId,
          previousIntents: executionOptions.previousIntents
        }
      }

      const intent = await this.intentClassifier.classifyQuery(query, intentOptions)
      logger.info(`Query classified as: ${intent.type} (confidence: ${intent.confidence})`)

      // Step 2: Retrieve memory context if needed
      let memoryContext: MemoryContext | undefined
      if (intent.memoryContext && executionOptions.includeMemoryContext !== false) {
        memoryContext = await this.retrieveMemoryContext(query, executionOptions)
        logger.info(`Retrieved memory context with ${memoryContext.episodicMemories.length} episodic and ${memoryContext.semanticMemories.length} semantic memories`)
      }

      // Step 3: Execute based on intent type
      let response: string
      let toolResults: ToolExecutionResult[] = []

      switch (intent.type) {
        case 'memory_chat':
          response = await this.handleMemoryChat(query, memoryContext, executionOptions)
          break

        case 'tool_execution':
          const toolResult = await this.handleToolExecution(query, intent, executionOptions)
          response = toolResult.response
          toolResults = toolResult.toolResults
          break

        case 'hybrid':
          const hybridResult = await this.handleHybridExecution(query, intent, memoryContext, executionOptions)
          response = hybridResult.response
          toolResults = hybridResult.toolResults
          break

        case 'knowledge_search':
          response = await this.handleKnowledgeSearch(query, memoryContext, executionOptions)
          break

        case 'conversation':
          response = await this.handleConversation(query, memoryContext, executionOptions)
          break

        case 'unknown':
        default:
          response = await this.handleUnknownQuery(query, memoryContext, executionOptions)
          break
      }

      // Step 4: Store the interaction in memory if it's worth remembering
      logger.info('Checking if should store interaction', { 
        userId: executionOptions.userId, 
        sessionId: executionOptions.sessionId,
        hasUserId: !!executionOptions.userId,
        hasSessionId: !!executionOptions.sessionId
      })
      
      if (executionOptions.userId && executionOptions.sessionId) {
        logger.info('Storing interaction in memory')
        await this.storeInteraction(query, response, intent, executionOptions)
      } else {
        logger.warn('Skipping memory storage - missing userId or sessionId', {
          userId: executionOptions.userId,
          sessionId: executionOptions.sessionId
        })
      }

      const executionTime = Date.now() - startTime

      const result: AgentExecutionResult = {
        success: true,
        response,
        intent,
        memoryContext,
        toolResults,
        reasoning: executionOptions.includeReasoning ? this.generateReasoning(intent, memoryContext, toolResults) : undefined,
        metadata: {
          executionTime,
          memoryRetrieved: (memoryContext?.episodicMemories.length || 0) + (memoryContext?.semanticMemories.length || 0),
          toolsExecuted: toolResults.length,
          confidence: intent.confidence
        }
      }

      logger.info(`Agent execution completed in ${executionTime}ms`)
      return result

    } catch (error) {
      logger.error('Agent execution failed:', error)
      
      return {
        success: false,
        response: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        intent: {
          type: 'unknown',
          confidence: 0,
          reasoning: 'Error occurred during execution'
        },
        metadata: {
          executionTime: Date.now() - startTime,
          memoryRetrieved: 0,
          toolsExecuted: 0,
          confidence: 0
        }
      }
    }
  }

  /**
   * Retrieve memory context for the query with enhanced relationship analysis
   */
  private async retrieveMemoryContext(
    query: string, 
    options: AgentExecutionOptions
  ): Promise<MemoryContext> {
    if (!options.userId || !options.sessionId) {
      return { 
        userId: '', 
        sessionId: '',
        episodicMemories: [], 
        semanticMemories: [],
        contextWindow: {
          startTime: new Date(),
          endTime: new Date(),
          relevanceScore: 0
        }
      }
    }

    try {
      // Get memory context from the service
      const context = await this.memoryService.getMemoryContext(
        options.userId, 
        options.sessionId
      )

      // Also search for relevant memories
      const searchQuery: MemorySearchQuery = {
        query,
        userId: options.userId,
        type: 'both',
        limit: options.maxMemoryResults || 10
      }

      const searchResults = await this.memoryService.searchMemories(searchQuery)
      
      // Combine context with search results
      const combinedContext = {
        userId: context.userId,
        sessionId: context.sessionId,
        episodicMemories: [...context.episodicMemories, ...searchResults.episodic.memories],
        semanticMemories: [...context.semanticMemories, ...searchResults.semantic.memories],
        contextWindow: context.contextWindow
      }

      // Enhanced analysis for API-related queries
      if (this.isAPIQuery(query) || this.hasAPIMemories(combinedContext.episodicMemories)) {
        await this.enhanceContextWithRelationshipAnalysis(combinedContext, query)
      }

      return combinedContext
    } catch (error) {
      logger.warn('Failed to retrieve memory context:', error)
      return { 
        userId: options.userId || '', 
        sessionId: options.sessionId || '',
        episodicMemories: [], 
        semanticMemories: [],
        contextWindow: {
          startTime: new Date(),
          endTime: new Date(),
          relevanceScore: 0
        }
      }
    }
  }

  /**
   * Check if query is API-related
   */
  private isAPIQuery(query: string): boolean {
    const apiKeywords = ['api', 'http', 'json', 'endpoint', 'resource', 'data', 'fetch', 'retrieve', 'get', 'post', 'put', 'delete']
    return apiKeywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  /**
   * Check if memories contain API data
   */
  private hasAPIMemories(memories: EpisodicMemory[]): boolean {
    return memories.some(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json') ||
      m.metadata.tags?.includes('api_call')
    )
  }

  /**
   * Enhance context with relationship analysis and semantic understanding
   */
  private async enhanceContextWithRelationshipAnalysis(
    context: MemoryContext,
    query: string
  ): Promise<void> {
    try {
      // Analyze relationships in API data
      const relationshipAnalysis = await this.relationshipAnalyzer.analyzeAPIRelationships(context.episodicMemories)

      // Extract enhanced semantic concepts
      const enhancedConcepts = await this.enhancedSemanticService.extractEnhancedConcepts(context.episodicMemories)

      // Build semantic network
      const semanticNetwork = await this.enhancedSemanticService.buildSemanticNetwork(enhancedConcepts, context.episodicMemories)

      // Generate contextual understanding
      const contextualUnderstanding = await this.enhancedSemanticService.understandContext(query, semanticNetwork, context.episodicMemories)

      // Store enhanced insights as semantic memories
      await this.storeEnhancedInsights(context, relationshipAnalysis, semanticNetwork, contextualUnderstanding)

      logger.info('Enhanced context with relationship analysis', {
        patterns: relationshipAnalysis.patterns.length,
        concepts: enhancedConcepts.length,
        relationships: semanticNetwork.relationships.length,
        clusters: semanticNetwork.clusters.length
      })
    } catch (error) {
      logger.warn('Failed to enhance context with relationship analysis:', error)
    }
  }

  /**
   * Store enhanced insights as semantic memories
   */
  private async storeEnhancedInsights(
    context: MemoryContext,
    relationshipAnalysis: DataStructureAnalysis,
    semanticNetwork: SemanticNetwork,
    contextualUnderstanding: ContextualUnderstanding
  ): Promise<void> {
    try {
      // Store relationship patterns as semantic memories
      for (const pattern of relationshipAnalysis.patterns) {
        await this.memoryService.storeSemanticMemory({
          userId: context.userId,
          concept: `pattern_${pattern.id}`,
          description: `${pattern.type} relationship: ${pattern.description}`,
          metadata: {
            category: 'API_Pattern',
            confidence: pattern.confidence,
            source: 'relationship_analysis',
            lastAccessed: new Date(),
            accessCount: 1,
            extractionMetadata: {
              sourceMemoryIds: [pattern.id],
              extractionTimestamp: new Date(),
              extractionConfidence: pattern.confidence,
              keywords: pattern.metadata.keywords,
              processingTime: 0
            }
          },
          relationships: {
            similar: [],
            parent: undefined,
            children: [],
            related: []
          }
        })
      }

      // Store semantic concepts
      for (const concept of semanticNetwork.concepts) {
        await this.memoryService.storeSemanticMemory({
          userId: context.userId,
          concept: concept.concept,
          description: concept.description,
          metadata: {
            category: concept.category,
            confidence: concept.confidence,
            source: 'enhanced_semantic_analysis',
            lastAccessed: new Date(),
            accessCount: 1,
            extractionMetadata: {
              sourceMemoryIds: [concept.id],
              extractionTimestamp: new Date(),
              extractionConfidence: concept.confidence,
              keywords: concept.metadata.keywords,
              processingTime: 0
            }
          },
          relationships: {
            similar: concept.relationships.similar,
            parent: concept.relationships.parent || undefined,
            children: concept.relationships.children,
            related: concept.relationships.related
          }
        })
      }

      // Store contextual insights
      if (contextualUnderstanding.insights.length > 0) {
        await this.memoryService.storeSemanticMemory({
          userId: context.userId,
          concept: `contextual_insight_${Date.now()}`,
          description: contextualUnderstanding.insights.join('; '),
          metadata: {
            category: 'Contextual_Insight',
            confidence: 0.8,
            source: 'contextual_understanding',
            lastAccessed: new Date(),
            accessCount: 1,
            extractionMetadata: {
              sourceMemoryIds: [`contextual_${Date.now()}`],
              extractionTimestamp: new Date(),
              extractionConfidence: 0.8,
              keywords: contextualUnderstanding.patterns,
              processingTime: 0
            }
          },
          relationships: {
            similar: [],
            parent: undefined,
            children: [],
            related: contextualUnderstanding.relevantConcepts.map(c => c.concept)
          }
        })
      }
    } catch (error) {
      logger.warn('Failed to store enhanced insights:', error)
    }
  }

  /**
   * Handle memory-based chat
   */
  private async handleMemoryChat(
    query: string, 
    memoryContext: MemoryContext | undefined,
    options: AgentExecutionOptions
  ): Promise<string> {
    const systemPrompt = this.buildMemoryChatSystemPrompt(memoryContext)
    
    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.7,
      systemMessage: systemPrompt,
      metadata: {
        service: 'AgentService',
        intent: 'memory_chat',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return response.content
  }

  /**
   * Handle tool execution
   */
  private async handleToolExecution(
    query: string,
    intent: QueryIntent,
    options: AgentExecutionOptions
  ): Promise<{ response: string; toolResults: ToolExecutionResult[] }> {
    const toolResults: ToolExecutionResult[] = []

    try {
      // Execute required tools
      if (intent.requiredTools && intent.requiredTools.length > 0) {
        for (const toolName of intent.requiredTools) {
          try {
            const toolArgs = await this.extractToolArgs(query, toolName)
            const tool = this.toolRegistry.getTool(toolName)
            if (!tool) {
              throw new Error(`Tool '${toolName}' not found`)
            }
            const result = await tool.execute(toolArgs)
            
            toolResults.push({
              success: true,
              toolName,
              result,
              executionTime: 0 // Tool registry doesn't provide timing
            })
          } catch (error) {
            toolResults.push({
              success: false,
              toolName,
              error: error instanceof Error ? error.message : 'Unknown error',
              executionTime: 0
            })
          }
        }
      }

      // Generate response based on tool results
      const response = await this.generateToolResponse(query, toolResults, options)
      
      return { response, toolResults }
    } catch (error) {
      logger.error('Tool execution failed:', error)
      return {
        response: `I encountered an error while executing tools: ${error instanceof Error ? error.message : 'Unknown error'}`,
        toolResults
      }
    }
  }

  /**
   * Handle hybrid execution (memory + tools)
   */
  private async handleHybridExecution(
    query: string,
    intent: QueryIntent,
    memoryContext: MemoryContext | undefined,
    options: AgentExecutionOptions
  ): Promise<{ response: string; toolResults: ToolExecutionResult[] }> {
    // First execute tools
    const toolResult = await this.handleToolExecution(query, intent, options)
    
    // Then generate response with both memory context and tool results
    const systemPrompt = this.buildHybridSystemPrompt(memoryContext, toolResult.toolResults)
    
    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.7,
      systemMessage: systemPrompt,
      metadata: {
        service: 'AgentService',
        intent: 'hybrid',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return {
      response: response.content,
      toolResults: toolResult.toolResults
    }
  }

  /**
   * Handle knowledge search
   */
  private async handleKnowledgeSearch(
    query: string,
    memoryContext: MemoryContext | undefined,
    options: AgentExecutionOptions
  ): Promise<string> {
    const systemPrompt = this.buildKnowledgeSearchSystemPrompt(memoryContext)
    
    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.3,
      systemMessage: systemPrompt,
      metadata: {
        service: 'AgentService',
        intent: 'knowledge_search',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return response.content
  }

  /**
   * Handle general conversation
   */
  private async handleConversation(
    query: string,
    memoryContext: MemoryContext | undefined,
    options: AgentExecutionOptions
  ): Promise<string> {
    const systemPrompt = this.buildConversationSystemPrompt(memoryContext)
    
    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.8,
      systemMessage: systemPrompt,
      metadata: {
        service: 'AgentService',
        intent: 'conversation',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return response.content
  }

  /**
   * Handle unknown queries
   */
  private async handleUnknownQuery(
    query: string,
    memoryContext: MemoryContext | undefined,
    options: AgentExecutionOptions
  ): Promise<string> {
    const systemPrompt = this.buildUnknownQuerySystemPrompt(memoryContext)
    
    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.5,
      systemMessage: systemPrompt,
      metadata: {
        service: 'AgentService',
        intent: 'unknown',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return response.content
  }

  /**
   * Extract tool arguments from query using LLM
   */
  private async extractToolArgs(query: string, toolName: string): Promise<Record<string, any>> {
    try {
      const toolSchema = this.toolRegistry.getToolSchema(toolName)
      const prompt = `Extract arguments for the tool "${toolName}" from this query: "${query}"

Tool schema: ${JSON.stringify(toolSchema, null, 2)}

Return only a JSON object with the extracted arguments. If you cannot extract valid arguments, return an empty object {}.

Example: If the tool needs { "operation": "add", "a": 5, "b": 3 } and the query is "add 5 and 3", return {"operation": "add", "a": 5, "b": 3}.`

      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.1,
        metadata: {
          service: 'AgentService',
          method: 'extractToolArgs',
          toolName
        }
      })

      return JSON.parse(response.content)
    } catch (error) {
      logger.warn(`Failed to extract tool args for ${toolName}:`, error)
      return {}
    }
  }

  /**
   * Generate response based on tool results with enhanced relationship analysis
   */
  private async generateToolResponse(
    query: string,
    toolResults: ToolExecutionResult[],
    options: AgentExecutionOptions
  ): Promise<string> {
    const toolResultsText = toolResults.map(result => 
      `Tool: ${result.toolName}\nSuccess: ${result.success}\nResult: ${JSON.stringify(result.result || result.error, null, 2)}`
    ).join('\n\n')

    // Check if this is an API-related query that would benefit from relationship analysis
    const isAPIQuery = this.isAPIQuery(query)
    const hasAPIData = toolResults.some(r =>
      r.success &&
      r.result &&
      (JSON.stringify(r.result).includes('api') ||
       JSON.stringify(r.result).includes('http') ||
       JSON.stringify(r.result).includes('json'))
    )

    let prompt = `User query: "${query}"

Tool execution results:
${toolResultsText}`

    if (isAPIQuery || hasAPIData) {
      prompt += `\n\nThis appears to be an API-related query. When responding:
1. Analyze the data structure and identify patterns
2. Look for relationships between different data elements
3. Explain how different parts of the API data relate to each other
4. Identify hierarchical, associative, or other relationship patterns
5. Provide insights about the overall data organization
6. Connect the current data with any patterns you can identify

Focus on showing deep understanding of the relationships and structure in the API data.`
    } else {
      prompt += `\n\nBased on the tool execution results, provide a helpful and natural response to the user. If tools failed, explain what went wrong and suggest alternatives.`
    }

    const response = await this.langchainService.complete(prompt, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.7,
      metadata: {
        service: 'AgentService',
        method: 'generateToolResponse',
        userId: options.userId,
        sessionId: options.sessionId
      }
    })

    return response.content
  }

  /**
   * Store interaction in memory
   */
  private async storeInteraction(
    query: string,
    response: string,
    intent: QueryIntent,
    options: AgentExecutionOptions
  ): Promise<void> {
    if (!options.userId || !options.sessionId) {
      logger.warn('Cannot store interaction: missing userId or sessionId', { userId: options.userId, sessionId: options.sessionId })
      return
    }

    logger.info('Storing interaction in memory', { userId: options.userId, sessionId: options.sessionId, intent: intent.type })

    try {
      // Determine if this is an API-related interaction
      const isAPIInteraction = this.isAPIQuery(query) ||
        response.includes('api') ||
        response.includes('http') ||
        response.includes('json') ||
        intent.type === 'tool_execution'

      // Always store as episodic memory for ALL interactions
      const memory = await this.memoryService.storeEpisodicMemory({
        userId: options.userId,
        sessionId: options.sessionId,
        timestamp: new Date(),
        content: `User: ${query}\nAssistant: ${response}`,
        context: {
          intent: intent.type,
          confidence: intent.confidence,
          conversation_turn: Date.now(),
          isAPIInteraction
        },
        metadata: {
          source: 'agent_service',
          importance: intent.confidence,
          tags: [intent.type, 'conversation', ...(isAPIInteraction ? ['api_call'] : [])],
          location: 'agent_service',
          ...(isAPIInteraction && {
            apiContext: {
              hasAPIData: true,
              relationshipAnalysis: true,
              semanticUnderstanding: true
            }
          })
        },
        relationships: {}
      })

      logger.info('Successfully stored episodic memory', { memoryId: memory.id })

      // If it's knowledge-related or API-related, also store as semantic memory (if available)
      if (intent.type === 'knowledge_search' || intent.type === 'hybrid' || isAPIInteraction) {
        try {
          const semanticMemory = await this.memoryService.storeSemanticMemory({
            userId: options.userId,
            concept: isAPIInteraction ? `api_interaction_${Date.now()}` : query,
            description: response,
            metadata: {
              category: isAPIInteraction ? 'API_Interaction' : 'conversation',
              confidence: intent.confidence,
              source: 'agent_service',
              lastAccessed: new Date(),
              accessCount: 1,
              ...(isAPIInteraction && {
                apiContext: {
                  hasAPIData: true,
                  relationshipAnalysis: true,
                  semanticUnderstanding: true
                }
              })
            },
            relationships: {}
          })
          logger.info('Successfully stored semantic memory', { memoryId: semanticMemory.id })
        } catch (semanticError) {
          // Log warning but don't fail the entire operation
          logger.warn('Failed to store semantic memory (Pinecone may not be available):', semanticError)
        }
      }
    } catch (error) {
      logger.error('Failed to store interaction in memory:', error)
    }
  }

  /**
   * Generate reasoning for the execution
   */
  private generateReasoning(
    intent: QueryIntent,
    memoryContext: MemoryContext | undefined,
    toolResults: ToolExecutionResult[]
  ): string {
    const parts = []
    
    parts.push(`Intent: ${intent.type} (confidence: ${intent.confidence})`)
    
    if (intent.reasoning) {
      parts.push(`Reasoning: ${intent.reasoning}`)
    }
    
    if (memoryContext) {
      parts.push(`Memory context: ${memoryContext.episodicMemories.length} episodic, ${memoryContext.semanticMemories.length} semantic memories`)
    }
    
    if (toolResults.length > 0) {
      parts.push(`Tools executed: ${toolResults.map(r => r.toolName).join(', ')}`)
    }
    
    return parts.join(' | ')
  }

  // System prompt builders
  private buildMemoryChatSystemPrompt(memoryContext?: MemoryContext): string {
    let prompt = `You are an AI assistant with access to memory. You can remember past conversations and use that context to provide more personalized and relevant responses.

Current memory context:`

    const hasEpisodicMemories = (memoryContext?.episodicMemories?.length ?? 0) > 0
    const hasSemanticMemories = (memoryContext?.semanticMemories?.length ?? 0) > 0

    if (hasEpisodicMemories && memoryContext) {
      prompt += `\n\nRecent conversations:\n${memoryContext.episodicMemories.map((m: EpisodicMemory) => `- ${m.content}`).join('\n')}`
    }

    if (hasSemanticMemories && memoryContext) {
      prompt += `\n\nRelevant knowledge:\n${memoryContext.semanticMemories.map((m: SemanticMemory) => `- ${m.concept}: ${m.description}`).join('\n')}`
    }

    if (!hasEpisodicMemories && !hasSemanticMemories) {
      prompt += `\n\nNo memories found - this appears to be our first conversation or no relevant memories exist for this user.`
      prompt += `\n\nIMPORTANT: If the user asks about what you remember from past conversations, you must respond that this is your first conversation with them and you don't have any memories to recall. Do not make up or hallucinate any past conversations or memories.`
    } else {
      prompt += `\n\nUse this context to provide helpful, personalized responses. If the user asks about something from memory, reference it naturally.`
    }

    return prompt
  }

  private buildHybridSystemPrompt(memoryContext?: MemoryContext, toolResults?: ToolExecutionResult[]): string {
    let prompt = `You are an AI assistant with advanced relationship analysis and semantic understanding capabilities. You can remember past conversations, execute tools, and understand complex relationships in API data.

Memory context:`

    const hasEpisodicMemories = (memoryContext?.episodicMemories?.length ?? 0) > 0
    const hasSemanticMemories = (memoryContext?.semanticMemories?.length ?? 0) > 0

    if (hasEpisodicMemories && memoryContext) {
      prompt += `\n\nRecent conversations:\n${memoryContext.episodicMemories.map((m: EpisodicMemory) => `- ${m.content}`).join('\n')}`
    }

    if (hasSemanticMemories && memoryContext) {
      prompt += `\n\nRelevant knowledge and patterns:\n${memoryContext.semanticMemories.map((m: SemanticMemory) => `- ${m.concept}: ${m.description}`).join('\n')}`
    }

    if (!hasEpisodicMemories && !hasSemanticMemories) {
      prompt += `\n\nNo memories found - this appears to be our first conversation or no relevant memories exist for this user.`
      prompt += `\n\nIMPORTANT: If the user asks about what you remember from past conversations, you must respond that this is your first conversation with them and you don't have any memories to recall. Do not make up or hallucinate any past conversations or memories.`
    }

    if (toolResults?.length) {
      prompt += `\n\nTool execution results:\n${toolResults.map(r => `- ${r.toolName}: ${r.success ? 'Success' : 'Failed'} - ${JSON.stringify(r.result || r.error)}`).join('\n')}`
    }

    prompt += `\n\nWhen analyzing API data or relationships:
1. Look for patterns in data structure and organization
2. Identify relationships between different resources (hierarchical, associative, temporal, causal)
3. Understand data flow and dependencies
4. Recognize semantic similarities and groupings
5. Provide insights about how different parts of the system work together
6. Connect new information with previously learned patterns

Use both the memory context and tool results to provide a comprehensive response that shows deep understanding of relationships and patterns.`

    return prompt
  }

  private buildKnowledgeSearchSystemPrompt(memoryContext?: MemoryContext): string {
    let prompt = `You are an AI assistant that searches through stored knowledge and memories to answer questions.

Available knowledge:`

    const hasEpisodicMemories = (memoryContext?.episodicMemories?.length ?? 0) > 0
    const hasSemanticMemories = (memoryContext?.semanticMemories?.length ?? 0) > 0

    if (hasSemanticMemories && memoryContext) {
      prompt += `\n\n${memoryContext.semanticMemories.map((m: SemanticMemory) => `- ${m.concept}: ${m.description}`).join('\n')}`
    }

    if (hasEpisodicMemories && memoryContext) {
      prompt += `\n\nRelated conversations:\n${memoryContext.episodicMemories.map((m: EpisodicMemory) => `- ${m.content}`).join('\n')}`
    }

    if (!hasEpisodicMemories && !hasSemanticMemories) {
      prompt += `\n\nNo memories found - this appears to be our first conversation or no relevant memories exist for this user.`
      prompt += `\n\nIMPORTANT: If the user asks about what you remember from past conversations, you must respond that this is your first conversation with them and you don't have any memories to recall. Do not make up or hallucinate any past conversations or memories.`
    }

    prompt += `\n\nSearch through this knowledge to provide accurate, detailed answers. If you don't find relevant information, say so clearly.`

    return prompt
  }

  private buildConversationSystemPrompt(memoryContext?: MemoryContext): string {
    let prompt = `You are a helpful AI assistant engaged in conversation.`

    const hasEpisodicMemories = (memoryContext?.episodicMemories?.length ?? 0) > 0

    if (hasEpisodicMemories && memoryContext) {
      prompt += `\n\nYou have some context from previous conversations:\n${memoryContext.episodicMemories.map((m: EpisodicMemory) => `- ${m.content}`).join('\n')}`
    } else {
      prompt += `\n\nThis appears to be our first conversation - no previous context available.`
      prompt += `\n\nIMPORTANT: If the user asks about what you remember from past conversations, you must respond that this is your first conversation with them and you don't have any memories to recall. Do not make up or hallucinate any past conversations or memories.`
    }

    prompt += `\n\nBe friendly, helpful, and engaging in your responses.`

    return prompt
  }

  private buildUnknownQuerySystemPrompt(memoryContext?: MemoryContext): string {
    let prompt = `You are an AI assistant dealing with an unclear or ambiguous query.`

    const hasEpisodicMemories = (memoryContext?.episodicMemories?.length ?? 0) > 0

    if (hasEpisodicMemories && memoryContext) {
      prompt += `\n\nPrevious context:\n${memoryContext.episodicMemories.map((m: EpisodicMemory) => `- ${m.content}`).join('\n')}`
    } else {
      prompt += `\n\nThis appears to be our first conversation - no previous context available.`
      prompt += `\n\nIMPORTANT: If the user asks about what you remember from past conversations, you must respond that this is your first conversation with them and you don't have any memories to recall. Do not make up or hallucinate any past conversations or memories.`
    }

    prompt += `\n\nTry to understand what the user might be asking for and provide helpful guidance. Ask clarifying questions if needed.`

    return prompt
  }

  /**
   * Get agent status and capabilities
   */
  getAgentStatus(): {
    memoryService: boolean
    intentClassifier: boolean
    toolRegistry: boolean
    availableTools: string[]
    intentTypes: string[]
  } {
    return {
      memoryService: !!this.memoryService,
      intentClassifier: !!this.intentClassifier,
      toolRegistry: !!this.toolRegistry,
      availableTools: this.toolRegistry.getToolNames(),
      intentTypes: this.intentClassifier.getAvailableIntentTypes()
    }
  }
}
