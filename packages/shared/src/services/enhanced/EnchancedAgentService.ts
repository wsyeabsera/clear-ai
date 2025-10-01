import { logger } from '../../logger'
import {
  MemorySearchQuery,
  MemoryContext,
  EpisodicMemory,
  SemanticMemory,
  MemoryService,
  WorkingMemoryContext,
  WorkingMemoryService,
  WorkingMemoryServiceConfig,
  ConversationTurn,
  Interaction
} from '../../types/memory'
import {
  IntentClassifierService,
  QueryIntent,
  IntentClassificationOptions
} from '../IntentClassifierService'
import { SimpleLangChainService } from '../SimpleLangChainService'
import { ToolExecutionResult } from '../ToolExecutionService'
import { RelationshipAnalysisService, DataStructureAnalysis, APIDataInsight } from '../RelationshipAnalysisService'
import { EnhancedSemanticService, SemanticConcept, SemanticNetwork, ContextualUnderstanding } from '../EnhancedSemanticService'
import { ContextManager } from '../ContextManager'

/**
 * Tool registry interface for EnhancedAgent service
 */
export interface EnhancedAgentToolRegistry {
  getTool(name: string): any
  getAllTools(): Array<{ name: string; description: string }>
  getToolNames(): string[]
  getToolSchema(name: string): any
  getAllToolSchemas(): any[]
}

/**
 * EnhancedAgent execution result
 */
export interface EnhancedAgentExecutionResult {
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
 * Lightweight memory context for tool chaining - excludes vectors and heavy metadata
 */
export interface LightweightMemoryContext {
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
}

/**
 * EnhancedAgent execution options
 */
export interface EnhancedAgentExecutionOptions {
  userId?: string
  sessionId?: string
  includeMemoryContext?: boolean
  maxMemoryResults?: number
  model?: string
  temperature?: number
  includeReasoning?: boolean
  previousIntents?: QueryIntent[]
  responseDetailLevel?: 'minimal' | 'standard' | 'full'
  excludeVectors?: boolean
  // Context management options
  maxTokens?: number
  enableContextCompression?: boolean
  contextCompressionThreshold?: number
  includeContextSummary?: boolean
}

export interface PendingAction {
  id: string
  userId: string
  sessionId: string
  originalQuery: string
  intent: QueryIntent
  requiredTools: string[]
  toolArgs: Record<string, any>[]
  confirmationMessage: string
  timestamp: number
}

/**
 * EnhancedAgent service configuration
 */
export interface EnhancedAgentServiceConfig {
  memoryService: MemoryService
  intentClassifier: IntentClassifierService
  langchainService: SimpleLangChainService
  toolRegistry: EnhancedAgentToolRegistry
  workingMemoryService?: WorkingMemoryService
  contextManager?: ContextManager
  defaultOptions?: Partial<EnhancedAgentExecutionOptions>
}

/**
 * Main EnhancedAgent Service that orchestrates memory, intent classification, and tool execution
 */
export class EnhancedAgentService {
  private memoryService: MemoryService
  private intentClassifier: IntentClassifierService
  private langchainService: SimpleLangChainService
  private toolRegistry: EnhancedAgentToolRegistry
  private workingMemoryService?: WorkingMemoryService
  private contextManager?: ContextManager
  private relationshipAnalyzer: RelationshipAnalysisService
  private enhancedSemanticService: EnhancedSemanticService
  private config: EnhancedAgentServiceConfig
  private pendingActions: Map<string, PendingAction> = new Map()

  constructor(config: EnhancedAgentServiceConfig) {
    this.config = config
    this.memoryService = config.memoryService
    this.intentClassifier = config.intentClassifier
    this.langchainService = config.langchainService
    this.toolRegistry = config.toolRegistry
    this.workingMemoryService = config.workingMemoryService
    this.contextManager = config.contextManager

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
      logger.info('Initializing EnhancedAgentService...')
      // Services should already be initialized by the caller
      logger.info('EnhancedAgentService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize EnhancedAgentService:', error)
      throw error
    }
  }

  /**
   * Main execution method that processes user queries
   */
  async executeQuery(
    query: string,
    options: EnhancedAgentExecutionOptions = {}
  ): Promise<EnhancedAgentExecutionResult> {
    const startTime = Date.now()

    try {
      logger.info(`EnhancedAgent executing query: "${query}"`)

      // Merge with default options
      const executionOptions = {
        ...this.config.defaultOptions,
        ...options
      }

      // Step 1: Retrieve working memory context FIRST for enhanced conversation management
      let workingMemoryContext: WorkingMemoryContext | undefined
      let memoryContext: MemoryContext | undefined
      let managedContext: any = undefined

      logger.info(`Memory context check: includeMemoryContext=${executionOptions.includeMemoryContext}, userId=${executionOptions.userId}, sessionId=${executionOptions.sessionId}`)
      if (executionOptions.includeMemoryContext !== false) {
        // Use Working Memory Service if available
        if (this.workingMemoryService) {
          logger.info(`Retrieving working memory context for userId: ${executionOptions.userId}, sessionId: ${executionOptions.sessionId}`)
          workingMemoryContext = await this.workingMemoryService.getWorkingMemory(
            executionOptions.userId || 'anonymous',
            executionOptions.sessionId || 'default'
          )
          logger.info(`Retrieved working memory context with topic: ${workingMemoryContext.currentTopic}, goals: ${workingMemoryContext.activeGoals.length}`)

          // Apply context management if available
          if (this.contextManager && executionOptions.enableContextCompression !== false) {
            logger.info('Applying context management to working memory')
            const maxTokens = executionOptions.maxTokens || 8000
            managedContext = await this.contextManager.manageContext(
              workingMemoryContext,
              query,
              maxTokens,
              executionOptions.userId,
              executionOptions.sessionId
            )
            // Write detailed context management log to file
            const fs = require('fs')
            const path = require('path')
            const logPath = path.join(process.cwd(), 'context-debug.log')
            const contextLog = {
              timestamp: new Date().toISOString(),
              query: query.substring(0, 100),
              compressionRatio: managedContext.compressionRatio,
              tokenUsage: managedContext.tokenUsage,
              activeContext: managedContext.activeContext ? 'present' : 'missing',
              summary: managedContext.summary ? 'present' : 'missing',
              removedItems: managedContext.removedItems ? managedContext.removedItems.length : 0
            }
            fs.appendFileSync(logPath, 'CONTEXT_MANAGED: ' + JSON.stringify(contextLog) + '\n')

            logger.info(`Context managed: compression ratio=${managedContext.compressionRatio}, token usage=${managedContext.tokenUsage}`)
          }
        } else {
          // Fallback to traditional memory context
          logger.info(`Retrieving traditional memory context for userId: ${executionOptions.userId}, sessionId: ${executionOptions.sessionId}`)
          memoryContext = await this.retrieveMemoryContext(query, executionOptions)
          logger.info(`Retrieved memory context with ${memoryContext.episodicMemories.length} episodic and ${memoryContext.semanticMemories.length} semantic memories`)
        }
      } else {
        logger.info('Memory context retrieval disabled')
      }

      // Step 2: Classify the query intent with working memory context
      const intentOptions: IntentClassificationOptions = {
        model: executionOptions.model,
        temperature: executionOptions.temperature,
        includeAvailableTools: true,
        userContext: {
          userId: executionOptions.userId,
          sessionId: executionOptions.sessionId,
          previousIntents: executionOptions.previousIntents
        },
        // Pass memory context to enable hybrid classification
        memoryContext: memoryContext
      }

      const intent = await this.intentClassifier.classifyQuery(query, intentOptions)
      logger.info(`Query classified as: ${intent.type} (confidence: ${intent.confidence})`)

      // Step 3: Re-retrieve memory context if not already retrieved and needed
      if (!memoryContext && intent.memoryContext && executionOptions.includeMemoryContext !== false) {
        memoryContext = await this.retrieveMemoryContext(query, executionOptions)
        logger.info(`Retrieved memory context with ${memoryContext.episodicMemories.length} episodic and ${memoryContext.semanticMemories.length} semantic memories`)
      }

      // Step 4: Execute based on intent type
      let response: string
      let toolResults: ToolExecutionResult[] = []

      switch (intent.type) {
        case 'memory_chat':
          response = await this.handleMemoryChat(query, memoryContext, executionOptions, managedContext)
          break

        case 'tool_execution':
          const toolResult = await this.handleToolExecution(query, intent, executionOptions)
          response = toolResult.response
          toolResults = toolResult.toolResults
          break

        case 'hybrid':
          const hybridResult = await this.handleHybridExecution(query, intent, memoryContext, executionOptions, managedContext)
          response = hybridResult.response
          toolResults = hybridResult.toolResults
          break

        case 'knowledge_search':
          response = await this.handleKnowledgeSearch(query, memoryContext, executionOptions)
          break

        case 'conversation':
          response = await this.handleConversation(query, memoryContext, executionOptions)
          break

        case 'confirmation_request':
          response = await this.handleConfirmationRequest(query, intent, executionOptions)
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

      // Determine response detail level
      const responseDetailLevel = executionOptions.responseDetailLevel || 'standard'
      const excludeVectors = executionOptions.excludeVectors !== false // Default to true

      // Create appropriate memory context based on detail level
      let finalMemoryContext: MemoryContext | LightweightMemoryContext | undefined
      if (memoryContext) {
        if (responseDetailLevel === 'minimal' || excludeVectors) {
          finalMemoryContext = this.createLightweightMemoryContext(memoryContext)
        } else {
          finalMemoryContext = memoryContext
        }
      }

      const result: EnhancedAgentExecutionResult = {
        success: true,
        response,
        intent,
        memoryContext: finalMemoryContext as MemoryContext, // Type assertion for compatibility
        toolResults: responseDetailLevel === 'minimal' ? undefined : toolResults,
        reasoning: (executionOptions.includeReasoning && responseDetailLevel !== 'minimal')
          ? this.generateReasoning(intent, memoryContext, toolResults)
          : undefined,
        metadata: responseDetailLevel === 'minimal' ? undefined : {
          executionTime,
          memoryRetrieved: (memoryContext?.episodicMemories.length || 0) + (memoryContext?.semanticMemories.length || 0),
          toolsExecuted: toolResults.length,
          confidence: intent.confidence
        }
      }

      logger.info(`EnhancedAgent execution completed in ${executionTime}ms`)
      return result

    } catch (error) {
      logger.error('EnhancedAgent execution failed:', error)

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
    options: EnhancedAgentExecutionOptions
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
      let combinedContext = {
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

      // Apply context compression if enabled
      if (options.enableContextCompression && options.maxTokens) {
        // Write compression trigger log
        const fs = require('fs')
        const path = require('path')
        const logPath = path.join(process.cwd(), 'context-debug.log')
        const triggerLog = {
          timestamp: new Date().toISOString(),
          query: query.substring(0, 100),
          maxTokens: options.maxTokens,
          episodicMemoriesCount: combinedContext.episodicMemories.length,
          semanticMemoriesCount: combinedContext.semanticMemories.length,
          compressionEnabled: true
        }
        fs.appendFileSync(logPath, 'COMPRESSION_TRIGGER: ' + JSON.stringify(triggerLog) + '\n')

        combinedContext = await this.applyContextCompression(combinedContext, query, options.maxTokens)
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
   * Apply context compression to reduce token usage
   */
  private async applyContextCompression(
    context: MemoryContext,
    query: string,
    maxTokens: number
  ): Promise<MemoryContext> {
    try {
      // Calculate current token usage
      const currentTokens = await this.calculateContextTokenUsage(context)

      // Write detailed compression log to file
      const compressionLog = {
        timestamp: new Date().toISOString(),
        query: query.substring(0, 100),
        maxTokens,
        currentTokens,
        episodicMemoriesCount: context.episodicMemories.length,
        semanticMemoriesCount: context.semanticMemories.length,
        needsCompression: currentTokens > maxTokens
      }

      // Write to compression log file
      const fs = require('fs')
      const path = require('path')
      const logPath = path.join(process.cwd(), 'compression-debug.log')
      fs.appendFileSync(logPath, JSON.stringify(compressionLog) + '\n')

      if (currentTokens <= maxTokens) {
        logger.info(`No compression needed: ${currentTokens} tokens <= ${maxTokens} tokens`)
        return context
      }

      logger.info(`Applying context compression: ${currentTokens} tokens -> ${maxTokens} tokens`)

      // Sort memories by relevance (simplified scoring)
      const scoredMemories = context.episodicMemories.map(memory => ({
        memory,
        relevance: this.calculateSimpleRelevance(memory.content, query)
      })).sort((a, b) => b.relevance - a.relevance)

      // Log relevance scores
      const relevanceLog = {
        timestamp: new Date().toISOString(),
        scoredMemories: scoredMemories.map(sm => ({
          id: sm.memory.id,
          relevance: sm.relevance,
          contentLength: sm.memory.content.length,
          contentPreview: sm.memory.content.substring(0, 50) + '...'
        }))
      }
      fs.appendFileSync(logPath, 'RELEVANCE_SCORES: ' + JSON.stringify(relevanceLog) + '\n')

      // Select most relevant memories within token budget
      const compressedMemories: EpisodicMemory[] = []
      let usedTokens = 0
      const targetTokens = Math.floor(maxTokens * 0.8) // Use 80% of budget for memories

      for (const { memory, relevance } of scoredMemories) {
        const memoryTokens = await this.calculateTokenUsageForText(memory.content)

        if (usedTokens + memoryTokens <= targetTokens && relevance > 0.3) {
          compressedMemories.push(memory)
          usedTokens += memoryTokens
        }
      }

      // Log compression results
      const compressionResult = {
        timestamp: new Date().toISOString(),
        originalCount: context.episodicMemories.length,
        compressedCount: compressedMemories.length,
        usedTokens,
        targetTokens,
        compressionRatio: usedTokens / currentTokens
      }
      fs.appendFileSync(logPath, 'COMPRESSION_RESULT: ' + JSON.stringify(compressionResult) + '\n')

      // If we still have too many tokens, compress the remaining memories
      if (usedTokens > targetTokens) {
        const finalMemories = await this.compressMemories(compressedMemories, targetTokens)
        return {
          ...context,
          episodicMemories: finalMemories
        }
      }

      return {
        ...context,
        episodicMemories: compressedMemories
      }
    } catch (error) {
      logger.warn('Failed to apply context compression:', error)
      return context
    }
  }

  /**
   * Calculate simple relevance score for memory content
   */
  private calculateSimpleRelevance(content: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentWords = content.toLowerCase().split(/\s+/)

    let matches = 0
    for (const word of queryWords) {
      if (contentWords.some(cw => cw.includes(word) || word.includes(cw))) {
        matches++
      }
    }

    return matches / queryWords.length
  }

  /**
   * Calculate token usage for memory context
   */
  private async calculateContextTokenUsage(context: MemoryContext): Promise<number> {
    let totalTokens = 0
    let episodicTokens = 0
    let semanticTokens = 0

    for (const memory of context.episodicMemories) {
      const memoryTokens = await this.calculateTokenUsageForText(memory.content)
      episodicTokens += memoryTokens
    }

    for (const memory of context.semanticMemories) {
      const memoryTokens = await this.calculateTokenUsageForText(memory.description)
      semanticTokens += memoryTokens
    }

    totalTokens = episodicTokens + semanticTokens

    // Log token calculation details
    const fs = require('fs')
    const path = require('path')
    const logPath = path.join(process.cwd(), 'compression-debug.log')
    const tokenLog = {
      timestamp: new Date().toISOString(),
      episodicMemoriesCount: context.episodicMemories.length,
      semanticMemoriesCount: context.semanticMemories.length,
      episodicTokens,
      semanticTokens,
      totalTokens
    }
    fs.appendFileSync(logPath, 'TOKEN_CALCULATION: ' + JSON.stringify(tokenLog) + '\n')

    return totalTokens
  }

  /**
   * Calculate token usage for text (simplified)
   */
  private async calculateTokenUsageForText(text: string): Promise<number> {
    // Simple approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  /**
   * Compress memories to fit within token budget
   */
  private async compressMemories(
    memories: EpisodicMemory[],
    maxTokens: number
  ): Promise<EpisodicMemory[]> {
    if (memories.length === 0) return []

    // If only one memory, truncate it
    if (memories.length === 1) {
      const memory = memories[0]
      const maxChars = maxTokens * 4
      const truncatedContent = memory.content.length > maxChars
        ? memory.content.substring(0, maxChars) + '...'
        : memory.content

      return [{
        ...memory,
        content: truncatedContent
      }]
    }

    // For multiple memories, create a summary
    const summaryContent = memories.map(m =>
      `[${m.timestamp.toISOString()}] ${m.content.substring(0, 200)}...`
    ).join('\n')

    const summaryMemory: EpisodicMemory = {
      id: `summary-${Date.now()}`,
      userId: memories[0]?.userId || 'unknown',
      sessionId: memories[0]?.sessionId || 'unknown',
      content: `Summary of ${memories.length} memories:\n${summaryContent}`,
      timestamp: new Date(),
      context: {},
      metadata: {
        source: 'compression',
        importance: 0.8,
        tags: ['summary', 'compressed']
      },
      relationships: {
        related: memories.map(m => m.id)
      }
    }

    return [summaryMemory]
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
    options: EnhancedAgentExecutionOptions,
    managedContext?: any
  ): Promise<string> {
    const systemPrompt = this.buildMemoryChatSystemPrompt(memoryContext, managedContext)

    const response = await this.langchainService.complete(query, {
      model: options.model || 'openai',
      temperature: options.temperature || 0.7,
      systemMessage: systemPrompt,
      metadata: {
        service: 'EnhancedAgentService',
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
    options: EnhancedAgentExecutionOptions
  ): Promise<{ response: string; toolResults: ToolExecutionResult[] }> {
    let toolResults: ToolExecutionResult[] = []

    try {
      // Check if this tool execution needs confirmation
      if (intent.needsConfirmation && intent.confirmationMessage) {
        // Store the pending action for later execution
        const pendingActionId = `${options.userId || 'anonymous'}-${options.sessionId || 'default'}-${Date.now()}`
        const toolArgs: Record<string, any>[] = []

        // Extract tool arguments for each required tool
        if (intent.requiredTools && intent.requiredTools.length > 0) {
          for (const toolName of intent.requiredTools) {
            try {
              const args = await this.extractToolArgs(query, toolName)
              toolArgs.push({ toolName, args })
            } catch (error) {
              logger.warn(`Failed to extract args for tool ${toolName}:`, error)
              toolArgs.push({ toolName, args: {} })
            }
          }
        }

        const pendingAction: PendingAction = {
          id: pendingActionId,
          userId: options.userId || 'anonymous',
          sessionId: options.sessionId || 'default',
          originalQuery: query,
          intent,
          requiredTools: intent.requiredTools || [],
          toolArgs,
          confirmationMessage: intent.confirmationMessage,
          timestamp: Date.now()
        }

        this.pendingActions.set(pendingActionId, pendingAction)

        return {
          response: `🤔 ${intent.confirmationMessage}\n\nWould you like me to perform this action for you?`,
          toolResults: []
        }
      }

      // Execute required tools - enhanced for multi-step workflows
      if (intent.requiredTools && intent.requiredTools.length > 0) {
        toolResults = await this.executeToolsWithWorkflowSupport(query, intent.requiredTools, options)
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
    options: EnhancedAgentExecutionOptions,
    managedContext?: any
  ): Promise<{ response: string; toolResults: ToolExecutionResult[] }> {
    // First execute tools
    const toolResult = await this.handleToolExecution(query, intent, options)

    // Then generate response with both memory context and tool results
    const systemPrompt = this.buildHybridSystemPrompt(memoryContext, toolResult.toolResults, managedContext)

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
    options: EnhancedAgentExecutionOptions
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
    options: EnhancedAgentExecutionOptions
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
   * Handle confirmation requests
   */
  private async handleConfirmationRequest(
    query: string,
    intent: QueryIntent,
    options: EnhancedAgentExecutionOptions
  ): Promise<string> {
    // Check if this is a positive confirmation (yes, do it, proceed, etc.)
    const positiveConfirmations = ['yes', 'y', 'do it', 'proceed', 'go ahead', 'execute', 'confirm', 'ok', 'okay', 'sure']
    const negativeConfirmations = ['no', 'n', 'cancel', 'stop', 'abort', 'don\'t', 'dont', 'nevermind', 'never mind']

    const queryLower = query.toLowerCase().trim()
    const isPositive = positiveConfirmations.some(conf => queryLower.includes(conf))
    const isNegative = negativeConfirmations.some(conf => queryLower.includes(conf))

    if (isPositive) {
      // User confirmed - find and execute the pending action
      const pendingAction = this.findPendingAction(options.userId, options.sessionId)

      if (pendingAction) {
        try {
          // Execute the pending action
          const toolResults: ToolExecutionResult[] = []

          for (const toolArg of pendingAction.toolArgs) {
            try {
              const tool = this.toolRegistry.getTool(toolArg.toolName)
              if (!tool) {
                throw new Error(`Tool '${toolArg.toolName}' not found`)
              }
              const result = await tool.execute(toolArg.args)

              toolResults.push({
                success: true,
                toolName: toolArg.toolName,
                result,
                executionTime: 0
              })
            } catch (error) {
              toolResults.push({
                success: false,
                toolName: toolArg.toolName,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: 0
              })
            }
          }

          // Generate response based on tool results
          const response = await this.generateToolResponse(pendingAction.originalQuery, toolResults, options)

          // Clean up the pending action
          this.pendingActions.delete(pendingAction.id)

          return `✅ ${response}`
        } catch (error) {
          logger.error('Failed to execute pending action:', error)
          return `❌ I encountered an error while executing the action: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      } else {
        return "❌ I don't have any pending actions to execute. Please make a new request that requires confirmation."
      }
    } else if (isNegative) {
      // User declined - clean up any pending actions
      this.clearPendingActions(options.userId, options.sessionId)
      return "❌ Understood. I won't proceed with the action. Is there anything else I can help you with?"
    } else {
      return "I'm not sure if you're confirming or declining. Please respond with 'yes' to proceed or 'no' to cancel."
    }
  }

  /**
   * Handle unknown queries
   */
  private async handleUnknownQuery(
    query: string,
    memoryContext: MemoryContext | undefined,
    options: EnhancedAgentExecutionOptions
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
   * Find the most recent pending action for a user/session
   */
  private findPendingAction(userId?: string, sessionId?: string): PendingAction | null {
    const userKey = userId || 'anonymous'
    const sessionKey = sessionId || 'default'

    // Find the most recent pending action for this user/session
    let mostRecent: PendingAction | null = null
    let mostRecentTime = 0

    for (const [id, action] of this.pendingActions) {
      if (action.userId === userKey && action.sessionId === sessionKey) {
        if (action.timestamp > mostRecentTime) {
          mostRecent = action
          mostRecentTime = action.timestamp
        }
      }
    }

    return mostRecent
  }

  /**
   * Clear all pending actions for a user/session
   */
  private clearPendingActions(userId?: string, sessionId?: string): void {
    const userKey = userId || 'anonymous'
    const sessionKey = sessionId || 'default'

    for (const [id, action] of this.pendingActions) {
      if (action.userId === userKey && action.sessionId === sessionKey) {
        this.pendingActions.delete(id)
      }
    }
  }

  /**
   * Execute tools with support for multi-step workflows
   */
  private async executeToolsWithWorkflowSupport(
    query: string,
    requiredTools: string[],
    options: EnhancedAgentExecutionOptions
  ): Promise<ToolExecutionResult[]> {
    const toolResults: ToolExecutionResult[] = []

    // Check if this is a multi-step workflow
    const isMultiStep = this.isMultiStepWorkflow(query)

    if (isMultiStep && requiredTools.length > 1) {
      // Execute tools sequentially for multi-step workflows
      logger.info(`Executing ${requiredTools.length} tools sequentially for multi-step workflow`)
      return await this.executeSequentialTools(query, requiredTools, options)
    } else {
      // Execute tools in parallel for single-step or simple workflows
      logger.info(`Executing ${requiredTools.length} tools in parallel`)
      return await this.executeParallelTools(query, requiredTools, options)
    }
  }

  /**
   * Check if the query represents a multi-step workflow
   */
  private isMultiStepWorkflow(query: string): boolean {
    const multiStepPatterns = [
      /then\s+(?:show|get|fetch|call|use)/i,
      /after\s+(?:that|getting|fetching)/i,
      /next\s+(?:step|call|request)/i,
      /followed\s+by/i,
      /and\s+then/i,
      /,\s+then/i,
      /step\s+\d+/i,
      /first\s+.*then/i
    ]

    return multiStepPatterns.some(pattern => pattern.test(query))
  }

  /**
   * Execute tools sequentially for multi-step workflows
   */
  private async executeSequentialTools(
    query: string,
    requiredTools: string[],
    options: EnhancedAgentExecutionOptions
  ): Promise<ToolExecutionResult[]> {
    const toolResults: ToolExecutionResult[] = []
    let previousResults: any[] = []

    for (let i = 0; i < requiredTools.length; i++) {
      const toolName = requiredTools[i]
      const toolIndex = i + 1

      try {
        logger.info(`Executing tool ${toolIndex}/${requiredTools.length}: ${toolName}`)

        // Extract arguments for this specific step
        const toolArgs = await this.extractToolArgsForStep(query, toolName, toolIndex, previousResults)
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

        // Store result for potential use in next steps
        previousResults.push(result)

        logger.info(`Tool ${toolName} executed successfully`, { step: toolIndex })

      } catch (error) {
        logger.error(`Tool ${toolName} failed at step ${toolIndex}:`, error)
        toolResults.push({
          success: false,
          toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        })

        // For sequential workflows, if one step fails, we might want to stop
        // or continue depending on the error type
        break
      }
    }

    return toolResults
  }

  /**
   * Execute tools in parallel for single-step workflows
   */
  private async executeParallelTools(
    query: string,
    requiredTools: string[],
    options: EnhancedAgentExecutionOptions
  ): Promise<ToolExecutionResult[]> {
    const toolResults: ToolExecutionResult[] = []

    // Execute all tools in parallel
    const toolPromises = requiredTools.map(async (toolName) => {
      try {
        const toolArgs = await this.extractToolArgs(query, toolName)
        const tool = this.toolRegistry.getTool(toolName)

        if (!tool) {
          throw new Error(`Tool '${toolName}' not found`)
        }

        const result = await tool.execute(toolArgs)

        return {
          success: true,
          toolName,
          result,
          executionTime: 0
        }
      } catch (error) {
        return {
          success: false,
          toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        }
      }
    })

    // Wait for all tools to complete
    const results = await Promise.all(toolPromises)
    toolResults.push(...results)

    return toolResults
  }

  /**
   * Extract tool arguments for a specific step in a multi-step workflow
   */
  private async extractToolArgsForStep(
    query: string,
    toolName: string,
    stepNumber: number,
    previousResults: any[]
  ): Promise<Record<string, any>> {
    try {
      const toolSchema = this.toolRegistry.getToolSchema(toolName)

      // Build context for this specific step (limit to avoid token overflow)
      let contextInfo = ''
      if (previousResults.length > 0) {
        // Only include the most recent result and limit its size
        const lastResult = previousResults[previousResults.length - 1]
        const resultSummary = {
          success: lastResult.success,
          toolName: lastResult.toolName,
          dataType: lastResult.result?.data ? 'array' : 'object',
          dataLength: Array.isArray(lastResult.result?.data) ? lastResult.result.data.length : 1,
          sampleData: Array.isArray(lastResult.result?.data)
            ? lastResult.result.data.slice(0, 2) // Only first 2 items
            : lastResult.result?.data
        }
        contextInfo = `\n\nPrevious step result summary: ${JSON.stringify(resultSummary, null, 2)}`
      }

      // Enhanced prompt for API call tool in multi-step workflows
      let prompt = `Step ${stepNumber} of multi-step workflow.

Tool: ${toolName}
Schema: ${JSON.stringify(toolSchema)}

Query: ${query.substring(0, 200)}...
${contextInfo}

Extract arguments for this step. If step 2 and previous step returned posts, use first post's ID for comments API.

Return JSON with arguments only:`

      // Special handling for API call tool in multi-step workflows
      if (toolName === 'api_call') {
        prompt = `Step ${stepNumber} of multi-step API workflow.

Tool: ${toolName}
Schema: ${JSON.stringify(toolSchema)}

Query: ${query.substring(0, 200)}...
${contextInfo}

CRITICAL: You MUST use the JSONPlaceholder API (https://jsonplaceholder.typicode.com) for all API calls unless explicitly told otherwise.

URL Construction Rules:
- For posts by user: "https://jsonplaceholder.typicode.com/posts?userId={userId}"
- For specific post: "https://jsonplaceholder.typicode.com/posts/{postId}"
- For comments: "https://jsonplaceholder.typicode.com/comments?postId={postId}"

Query Analysis:
- If query mentions "posts made by user id X" or "posts for user X" → "https://jsonplaceholder.typicode.com/posts?userId=X"
- If query mentions "comments for post X" or "comments for the first post" → "https://jsonplaceholder.typicode.com/comments?postId=X"
- If query mentions "get posts" without specific user → "https://jsonplaceholder.typicode.com/posts"

MANDATORY: Always use jsonplaceholder.typicode.com as the domain. Never use api.example.com or any other domain.

If previous results contain post data, look for the first post's ID and use it for comments.

Return JSON with arguments only. The URL must be a complete, valid URL starting with https://.`
      }

      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.1,
        metadata: {
          service: 'AgentService',
          method: 'extractToolArgsForStep',
          toolName,
          stepNumber
        }
      })

      return JSON.parse(response.content)
    } catch (error) {
      logger.warn(`Failed to extract tool args for step ${stepNumber} (${toolName}):`, error)
      return {}
    }
  }

  /**
   * Extract tool arguments from query using LLM
   */
  private async extractToolArgs(query: string, toolName: string): Promise<Record<string, any>> {
    try {
      const toolSchema = this.toolRegistry.getToolSchema(toolName)

      // Enhanced prompt for API call tool with better URL construction guidance
      let prompt = `Extract arguments for the tool "${toolName}" from this query: "${query}"

Tool schema: ${JSON.stringify(toolSchema, null, 2)}

Return only a JSON object with the extracted arguments. If you cannot extract valid arguments, return an empty object {}.

Example: If the tool needs { "operation": "add", "a": 5, "b": 3 } and the query is "add 5 and 3", return {"operation": "add", "a": 5, "b": 3}.`

      // Special handling for API call tool
      if (toolName === 'api_call') {
        prompt = `Extract arguments for the API call tool from this query: "${query}"

Tool schema: ${JSON.stringify(toolSchema, null, 2)}

CRITICAL: You MUST use the JSONPlaceholder API (https://jsonplaceholder.typicode.com) for all API calls unless explicitly told otherwise.

URL Construction Rules:
- For posts by user: "https://jsonplaceholder.typicode.com/posts?userId={userId}"
- For specific post: "https://jsonplaceholder.typicode.com/posts/{postId}"
- For comments: "https://jsonplaceholder.typicode.com/comments?postId={postId}"

Query Analysis:
- If query mentions "posts made by user id X" or "posts for user X" → "https://jsonplaceholder.typicode.com/posts?userId=X"
- If query mentions "comments for post X" or "comments for the first post" → "https://jsonplaceholder.typicode.com/comments?postId=X"
- If query mentions "get posts" without specific user → "https://jsonplaceholder.typicode.com/posts"

MANDATORY: Always use jsonplaceholder.typicode.com as the domain. Never use api.example.com or any other domain.

Return only a JSON object with the extracted arguments. The URL must be a complete, valid URL starting with https://.

Example: For "get posts for user 2", return {"url": "https://jsonplaceholder.typicode.com/posts?userId=2", "method": "GET"}`
      }

      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.1,
        metadata: {
          service: 'AgentService',
          method: 'extractToolArgs',
          toolName
        }
      })

      const extractedArgs = JSON.parse(response.content)

      // Fallback correction for API call tool
      if (toolName === 'api_call' && extractedArgs.url) {
        // Check if the URL is incorrect and fix it
        if (extractedArgs.url.includes('api.example.com') ||
          (!extractedArgs.url.includes('jsonplaceholder.typicode.com') &&
            !extractedArgs.url.includes('http'))) {

          logger.warn(`Detected incorrect URL: ${extractedArgs.url}, correcting to JSONPlaceholder`)

          // Extract user ID from query
          const userIdMatch = query.match(/user\s+id\s+(\d+)/i) || query.match(/user\s+(\d+)/i)
          const postIdMatch = query.match(/post\s+id\s+(\d+)/i) || query.match(/post\s+(\d+)/i)

          if (userIdMatch) {
            extractedArgs.url = `https://jsonplaceholder.typicode.com/posts?userId=${userIdMatch[1]}`
            extractedArgs.method = 'GET'
          } else if (postIdMatch) {
            extractedArgs.url = `https://jsonplaceholder.typicode.com/comments?postId=${postIdMatch[1]}`
            extractedArgs.method = 'GET'
          } else if (query.includes('posts')) {
            extractedArgs.url = 'https://jsonplaceholder.typicode.com/posts'
            extractedArgs.method = 'GET'
          } else if (query.includes('comments')) {
            extractedArgs.url = 'https://jsonplaceholder.typicode.com/comments'
            extractedArgs.method = 'GET'
          }
        }
      }

      return extractedArgs
    } catch (error) {
      logger.warn(`Failed to extract tool args for ${toolName}:`, error)
      return {}
    }
  }

  /**
   * Convert full memory context to lightweight version for tool chaining
   */
  private createLightweightMemoryContext(memoryContext: MemoryContext): LightweightMemoryContext {
    return {
      userId: memoryContext.userId,
      sessionId: memoryContext.sessionId,
      episodicMemories: memoryContext.episodicMemories.map(memory => ({
        id: memory.id,
        timestamp: memory.timestamp,
        content: memory.content,
        metadata: {
          source: memory.metadata.source,
          importance: memory.metadata.importance,
          tags: memory.metadata.tags
        }
      })),
      semanticMemories: memoryContext.semanticMemories.map(memory => ({
        id: memory.id,
        concept: memory.concept,
        description: memory.description,
        metadata: {
          category: memory.metadata.category,
          confidence: memory.metadata.confidence
        }
      })),
      contextWindow: memoryContext.contextWindow
    }
  }

  /**
   * Generate response based on tool results with enhanced relationship analysis
   */
  private async generateToolResponse(
    query: string,
    toolResults: ToolExecutionResult[],
    options: EnhancedAgentExecutionOptions
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
    options: EnhancedAgentExecutionOptions
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

      // Update working memory with the new interaction
      if (this.workingMemoryService) {
        try {
          // Get current working memory
          const currentWorkingMemory = await this.workingMemoryService.getWorkingMemory(
            options.userId,
            options.sessionId
          )

          // Add the new conversation turn
          const newTurn: ConversationTurn = {
            turnNumber: currentWorkingMemory.conversationHistory.length + 1,
            userInput: query,
            assistantResponse: response,
            timestamp: new Date(),
            intent: intent.type,
            confidence: intent.confidence,
            contextRelevance: 0.8,
            toolsUsed: [],
            memoryRetrieved: 0
          }

          // Create the last interaction
          const lastInteraction: Interaction = {
            id: `interaction-${Date.now()}`,
            timestamp: new Date(),
            userInput: query,
            assistantResponse: response,
            intent: intent.type,
            confidence: intent.confidence,
            toolsUsed: [],
            memoryRetrieved: 0
          }

          // Update the working memory context
          const updatedWorkingMemory: WorkingMemoryContext = {
            ...currentWorkingMemory,
            conversationHistory: [...currentWorkingMemory.conversationHistory, newTurn],
            lastInteraction: lastInteraction,
            contextWindow: {
              ...currentWorkingMemory.contextWindow,
              endTime: new Date(),
              currentTokens: Math.ceil((currentWorkingMemory.contextWindow.currentTokens || 0) + query.length + response.length / 4)
            }
          }

          // Update working memory
          await this.workingMemoryService.updateWorkingMemory(updatedWorkingMemory, options.userId)
          logger.info('Successfully updated working memory with new conversation turn')
        } catch (workingMemoryError) {
          logger.warn('Failed to update working memory:', workingMemoryError)
        }
      }

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
  private buildMemoryChatSystemPrompt(memoryContext?: MemoryContext, managedContext?: any): string {
    let prompt = `You are an AI assistant with access to memory. You can remember past conversations and use that context to provide more personalized and relevant responses.

Current memory context:`

    // Use managed context if available, otherwise fall back to traditional memory context
    if (managedContext) {
      const workingMemory = managedContext.activeContext

      // Add conversation topic
      prompt += `\n\nCurrent Topic: ${workingMemory.currentTopic}`

      // Add conversation state
      prompt += `\n\nConversation State: ${workingMemory.conversationState.state}`

      // Add active goals
      if (workingMemory.activeGoals.length > 0) {
        const goalsText = workingMemory.activeGoals
          .map((goal: any) => `- ${goal.description} (${goal.status})`)
          .join('\n')
        prompt += `\n\nActive Goals:\n${goalsText}`
      }

      // Add user profile
      const profile = workingMemory.userProfile
      prompt += `\n\nUser Profile:`
      prompt += `\n- Communication Style: ${profile.communicationStyle}`
      prompt += `\n- Formality: ${profile.formality}`
      prompt += `\n- Response Length: ${profile.responseLength}`
      if (profile.preferences.length > 0) {
        prompt += `\n- Preferences: ${profile.preferences.join(', ')}`
      }
      if (profile.interests.length > 0) {
        prompt += `\n- Interests: ${profile.interests.join(', ')}`
      }

      // Add recent conversation history
      if (workingMemory.conversationHistory.length > 0) {
        const recentHistory = workingMemory.conversationHistory
          .slice(-5) // Last 5 turns
          .map((turn: any) => `Turn ${turn.turnNumber}: ${turn.userInput} -> ${turn.assistantResponse}`)
          .join('\n')
        prompt += `\n\nRecent Conversation:\n${recentHistory}`
      }

      // Add context summary if available
      if (managedContext.summary && managedContext.summary.length > 0) {
        prompt += `\n\nContext Summary (previous conversation context):\n${managedContext.summary}`
      }

      // Add compression information if context was compressed
      if (managedContext.compressionRatio < 1.0) {
        prompt += `\n\nNote: Previous conversation context has been compressed to fit within token limits (${Math.round(managedContext.compressionRatio * 100)}% of original context retained).`
      }

    } else {
      // Fallback to traditional memory context
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
    }

    return prompt
  }

  private buildHybridSystemPrompt(memoryContext?: MemoryContext, toolResults?: ToolExecutionResult[], managedContext?: any): string {
    let prompt = `You are an AI assistant with advanced relationship analysis and semantic understanding capabilities. You can remember past conversations, execute tools, and understand complex relationships in API data.

Memory context:`

    // Use managed context if available, otherwise fall back to traditional memory context
    if (managedContext) {
      const workingMemory = managedContext.activeContext

      // Add conversation topic
      prompt += `\n\nCurrent Topic: ${workingMemory.currentTopic}`

      // Add conversation state
      prompt += `\n\nConversation State: ${workingMemory.conversationState.state}`

      // Add active goals
      if (workingMemory.activeGoals.length > 0) {
        const goalsText = workingMemory.activeGoals
          .map((goal: any) => `- ${goal.description} (${goal.status})`)
          .join('\n')
        prompt += `\n\nActive Goals:\n${goalsText}`
      }

      // Add user profile
      const profile = workingMemory.userProfile
      prompt += `\n\nUser Profile:`
      prompt += `\n- Communication Style: ${profile.communicationStyle}`
      prompt += `\n- Formality: ${profile.formality}`
      prompt += `\n- Response Length: ${profile.responseLength}`
      if (profile.preferences.length > 0) {
        prompt += `\n- Preferences: ${profile.preferences.join(', ')}`
      }
      if (profile.interests.length > 0) {
        prompt += `\n- Interests: ${profile.interests.join(', ')}`
      }

      // Add recent conversation history
      if (workingMemory.conversationHistory.length > 0) {
        const recentHistory = workingMemory.conversationHistory
          .slice(-5) // Last 5 turns
          .map((turn: any) => `Turn ${turn.turnNumber}: ${turn.userInput} -> ${turn.assistantResponse}`)
          .join('\n')
        prompt += `\n\nRecent Conversation:\n${recentHistory}`
      }

      // Add context summary if available
      if (managedContext.summary && managedContext.summary.length > 0) {
        prompt += `\n\nContext Summary (previous conversation context):\n${managedContext.summary}`
      }

      // Add compression information if context was compressed
      if (managedContext.compressionRatio < 1.0) {
        prompt += `\n\nNote: Previous conversation context has been compressed to fit within token limits (${Math.round(managedContext.compressionRatio * 100)}% of original context retained).`
      }

    } else {
      // Fallback to traditional memory context
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
