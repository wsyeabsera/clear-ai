import { logger } from '../logger'
import {
  MemoryService,
  MemoryContext,
  WorkingMemoryContext,
  ConversationState,
  Goal,
  ContextWindow,
  UserProfile,
  SessionMetadata,
  Interaction,
  ConversationTurn,
  WorkingMemoryServiceConfig,
  WorkingMemoryService as IWorkingMemoryService,
  MemorySearchQuery
} from '../types/memory'
import { SimpleLangChainService } from './SimpleLangChainService'

/**
 * Working Memory Service - The foundation of AgentService v2.0's intelligent conversation management
 *
 * This service maintains the current state of conversations, tracks active goals,
 * and provides context for all other services. It acts as the "short-term memory"
 * of the agent, maintaining current conversation topic, active goals, user profile,
 * session metadata, and recent interaction history.
 */
export class WorkingMemoryService implements IWorkingMemoryService {
  private memoryService: MemoryService
  private langchainService: SimpleLangChainService
  private config: WorkingMemoryServiceConfig
  private cache: Map<string, { context: WorkingMemoryContext; timestamp: number }> = new Map()
  private performanceMetrics: {
    totalRetrievals: number
    totalRetrievalTime: number
    cacheHits: number
    activeSessions: Set<string>
  } = {
      totalRetrievals: 0,
      totalRetrievalTime: 0,
      cacheHits: 0,
      activeSessions: new Set()
    }

  constructor(
    memoryService: MemoryService,
    langchainService: SimpleLangChainService,
    config: WorkingMemoryServiceConfig
  ) {
    this.memoryService = memoryService
    this.langchainService = langchainService
    this.config = config
  }

  /**
   * Get working memory context for a user and session
   */
  async getWorkingMemory(
    userId: string,
    sessionId: string
  ): Promise<WorkingMemoryContext> {
    const startTime = Date.now()
    const cacheKey = `${userId}-${sessionId}`

    try {
      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = this.cache.get(cacheKey)
        if (cached && (Date.now() - cached.timestamp) < this.config.cacheTTL) {
          this.performanceMetrics.cacheHits++
          this.performanceMetrics.activeSessions.add(cacheKey)
          logger.debug('Working memory retrieved from cache', { userId, sessionId })
          return cached.context
        }
      }

      // Try to get stored working memory context first
      const storedContext = await this.getStoredWorkingMemoryContext(userId, sessionId)
      if (storedContext) {
        logger.debug('Retrieved working memory context from database', { userId, sessionId })
        return storedContext
      }

      // Get existing memory context
      const memoryContext = await this.memoryService.getMemoryContext(userId, sessionId)

      // Build working memory components
      const currentTopic = await this.extractCurrentTopic(memoryContext)
      const conversationState = await this.determineConversationState(memoryContext)
      const activeGoals = await this.extractActiveGoals(memoryContext)
      const contextWindow = await this.buildContextWindow(memoryContext)
      const userProfile = await this.buildUserProfile(userId, memoryContext)
      const sessionMetadata = await this.buildSessionMetadata(sessionId)
      const lastInteraction = await this.getLastInteraction(memoryContext)
      const conversationHistory = await this.getConversationHistory(memoryContext)

      const workingMemoryContext: WorkingMemoryContext = {
        conversationId: sessionId,
        currentTopic,
        conversationState,
        activeGoals,
        contextWindow,
        userProfile,
        sessionMetadata,
        lastInteraction,
        conversationHistory
      }

      // Cache the result
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, {
          context: workingMemoryContext,
          timestamp: Date.now()
        })
      }

      // Update performance metrics
      this.performanceMetrics.totalRetrievals++
      this.performanceMetrics.totalRetrievalTime += Date.now() - startTime
      this.performanceMetrics.activeSessions.add(cacheKey)

      logger.info('Working memory retrieved successfully', {
        userId,
        sessionId,
        topic: currentTopic,
        goals: activeGoals.length,
        retrievalTime: Date.now() - startTime
      })

      return workingMemoryContext
    } catch (error) {
      logger.error('Failed to get working memory:', error)
      throw new Error(`Failed to get working memory: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update working memory context
   */
  async updateWorkingMemory(context: WorkingMemoryContext, userId?: string): Promise<void> {
    try {
      // Update conversation state
      await this.updateConversationState(context)

      // Update active goals
      await this.updateActiveGoals(context.activeGoals)

      // Update user profile
      await this.updateUserProfile(context.userProfile)

      // Store session metadata
      await this.storeSessionMetadata(context.sessionMetadata)

      // Update context window
      await this.updateContextWindow(context.contextWindow)

      // Store working memory context in database
      if (userId) {
        await this.storeWorkingMemoryContext(context, userId)
      }

      // Update cache
      const cacheKey = `${context.userProfile.preferences.length > 0 ? 'user' : 'anonymous'}-${context.conversationId}`
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, {
          context,
          timestamp: Date.now()
        })
      }

      logger.info('Working memory updated successfully', {
        conversationId: context.conversationId,
        topic: context.currentTopic,
        goals: context.activeGoals.length
      })
    } catch (error) {
      logger.error('Failed to update working memory:', error)
      throw new Error(`Failed to update working memory: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract current topic from memory context
   */
  async extractCurrentTopic(memoryContext: MemoryContext): Promise<string> {
    try {
      // Get recent conversation memories
      const recentMemories = memoryContext.episodicMemories
        .slice(-5)
        .map(m => m.content)
        .join(' ')

      if (!recentMemories.trim()) {
        return 'general conversation'
      }

      // Use LLM to extract topic
      const topicPrompt = `
      Analyze this conversation and extract the main topic in 2-3 words:

      Conversation: "${recentMemories}"

      Return only the topic, no explanation.
      `

      const response = await this.langchainService.complete(topicPrompt, {
        model: this.config.topicExtractionModel,
        temperature: this.config.topicExtractionTemperature,
        maxTokens: 50
      })

      return response.content.trim() || 'general conversation'
    } catch (error) {
      logger.warn('Failed to extract topic:', error)
      return 'general conversation'
    }
  }

  /**
   * Determine conversation state based on memory context
   */
  async determineConversationState(
    memoryContext: MemoryContext
  ): Promise<ConversationState> {
    try {
      // Analyze conversation patterns
      const patterns = await this.analyzeConversationPatterns(memoryContext)

      // Determine state based on patterns
      let state: ConversationState['state'] = 'active'

      if (patterns.hasActiveGoal) {
        state = 'planning'
      } else if (patterns.awaitingResponse) {
        state = 'waiting'
      } else if (patterns.hasError) {
        state = 'error_recovery'
      } else if (patterns.isGreeting) {
        state = 'greeting'
      }

      return {
        state,
        topic: await this.extractCurrentTopic(memoryContext),
        activeGoals: await this.extractActiveGoals(memoryContext),
        lastInteraction: new Date(),
        contextRelevance: patterns.relevanceScore
      }
    } catch (error) {
      logger.warn('Failed to determine conversation state:', error)
      return {
        state: 'active',
        topic: 'general conversation',
        activeGoals: [],
        lastInteraction: new Date(),
        contextRelevance: 0.5
      }
    }
  }

  /**
   * Extract active goals from memory context
   */
  async extractActiveGoals(memoryContext: MemoryContext): Promise<Goal[]> {
    try {
      // Search for goal-related memories
      const goalMemories = await this.memoryService.searchMemories({
        query: 'goal objective task plan',
        userId: memoryContext.userId,
        type: 'semantic',
        limit: 10
      })

      const goals: Goal[] = []

      for (const memory of goalMemories.semantic.memories) {
        if (memory.metadata.category === 'Goal' && memory.metadata.status !== 'completed') {
          goals.push({
            id: memory.metadata.goalId || `goal-${Date.now()}`,
            description: memory.description,
            priority: memory.metadata.priority || 1,
            status: memory.metadata.status || 'pending',
            subgoals: memory.metadata.subgoals || [],
            successCriteria: memory.metadata.successCriteria || [],
            createdAt: new Date(memory.metadata.createdAt || Date.now()),
            updatedAt: new Date(memory.metadata.updatedAt || Date.now())
          })
        }
      }

      return goals.sort((a, b) => b.priority - a.priority)
    } catch (error) {
      logger.warn('Failed to extract active goals:', error)
      return []
    }
  }

  /**
   * Update active goals
   */
  async updateActiveGoals(goals: Goal[]): Promise<void> {
    try {
      // Store updated goals as semantic memories
      for (const goal of goals) {
        await this.memoryService.storeSemanticMemory({
          userId: 'system', // This should be passed from context
          concept: `goal_${goal.id}`,
          description: goal.description,
          metadata: {
            category: 'Goal',
            confidence: 1.0,
            source: 'working_memory',
            lastAccessed: new Date(),
            accessCount: 1,
            goalId: goal.id,
            priority: goal.priority,
            status: goal.status,
            subgoals: goal.subgoals,
            successCriteria: goal.successCriteria,
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString()
          },
          relationships: {}
        })
      }
    } catch (error) {
      logger.warn('Failed to update active goals:', error)
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(description: string, priority: number, userId: string): Promise<Goal> {
    const goal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      priority,
      status: 'pending',
      subgoals: [],
      successCriteria: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.updateActiveGoals([goal])
    return goal
  }

  /**
   * Update an existing goal
   */
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    // This would need to be implemented with proper goal storage
    // For now, return a mock goal
    return {
      id: goalId,
      description: updates.description || 'Updated goal',
      priority: updates.priority || 1,
      status: updates.status || 'pending',
      subgoals: updates.subgoals || [],
      successCriteria: updates.successCriteria || [],
      createdAt: updates.createdAt || new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Complete a goal
   */
  async completeGoal(goalId: string): Promise<boolean> {
    try {
      await this.updateGoal(goalId, { status: 'completed' })
      return true
    } catch (error) {
      logger.warn('Failed to complete goal:', error)
      return false
    }
  }

  /**
   * Build user profile from memory context
   */
  async buildUserProfile(
    userId: string,
    memoryContext: MemoryContext
  ): Promise<UserProfile> {
    try {
      // Search for user preference memories
      const preferenceMemories = await this.memoryService.searchMemories({
        query: 'preference like dislike style personality',
        userId,
        type: 'semantic',
        limit: 20
      })

      const profile: UserProfile = {
        preferences: [],
        communicationStyle: 'conversational',
        formality: 'medium',
        responseLength: 'detailed',
        interests: [],
        expertise: [],
        personality: 'helpful'
      }

      // Extract preferences from memories
      for (const memory of preferenceMemories.semantic.memories) {
        if (memory.metadata.category === 'Preference') {
          profile.preferences.push(memory.description)
        } else if (memory.metadata.category === 'Interest') {
          profile.interests.push(memory.description)
        } else if (memory.metadata.category === 'Expertise') {
          profile.expertise.push(memory.description)
        }
      }

      // Extract communication style
      const styleMemories = await this.memoryService.searchMemories({
        query: 'communication style formality',
        userId,
        type: 'semantic',
        limit: 5
      })

      for (const memory of styleMemories.semantic.memories) {
        if (memory.metadata.communicationStyle) {
          profile.communicationStyle = memory.metadata.communicationStyle
        }
        if (memory.metadata.formality) {
          profile.formality = memory.metadata.formality
        }
      }

      return profile
    } catch (error) {
      logger.warn('Failed to build user profile:', error)
      return {
        preferences: [],
        communicationStyle: 'conversational',
        formality: 'medium',
        responseLength: 'detailed',
        interests: [],
        expertise: [],
        personality: 'helpful'
      }
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profile: UserProfile): Promise<void> {
    try {
      // Store profile as semantic memories
      for (const preference of profile.preferences) {
        await this.memoryService.storeSemanticMemory({
          userId: 'system', // This should be passed from context
          concept: `preference_${Date.now()}`,
          description: preference,
          metadata: {
            category: 'Preference',
            confidence: 1.0,
            source: 'working_memory',
            lastAccessed: new Date(),
            accessCount: 1
          },
          relationships: {}
        })
      }
    } catch (error) {
      logger.warn('Failed to update user profile:', error)
    }
  }

  /**
   * Build context window from memory context
   */
  async buildContextWindow(memoryContext: MemoryContext): Promise<ContextWindow> {
    const now = new Date()
    const startTime = memoryContext.contextWindow.startTime
    const endTime = memoryContext.contextWindow.endTime

    // Calculate current token usage (simplified)
    const totalContent = memoryContext.episodicMemories
      .map(m => m.content)
      .join(' ')
    const currentTokens = Math.ceil(totalContent.length / 4) // Rough token estimation

    return {
      startTime,
      endTime,
      relevanceScore: memoryContext.contextWindow.relevanceScore,
      maxTokens: this.config.maxTokens,
      currentTokens,
      compressionRatio: currentTokens / this.config.maxTokens
    }
  }

  /**
   * Update context window
   */
  async updateContextWindow(contextWindow: ContextWindow): Promise<void> {
    // This would typically update the memory context
    // For now, we'll just log the update
    logger.debug('Context window updated', {
      currentTokens: contextWindow.currentTokens,
      maxTokens: contextWindow.maxTokens,
      compressionRatio: contextWindow.compressionRatio
    })
  }

  /**
   * Get stored working memory context from database
   */
  private async getStoredWorkingMemoryContext(userId: string, sessionId: string): Promise<WorkingMemoryContext | null> {
    try {
      // Search for working memory context in episodic memories
      const memories = await this.memoryService.searchEpisodicMemories({
        userId,
        query: 'working_memory',
        type: 'episodic',
        filters: {
          tags: ['working_memory']
        },
        limit: 1
      })

      if (memories.length > 0) {
        const memory = memories[0]
        if (memory.content.startsWith('WORKING_MEMORY_CONTEXT: ')) {
          const contextData = JSON.parse(memory.content.replace('WORKING_MEMORY_CONTEXT: ', ''))

          // Convert date strings back to Date objects
          if (contextData.contextWindow) {
            contextData.contextWindow.startTime = new Date(contextData.contextWindow.startTime)
            contextData.contextWindow.endTime = new Date(contextData.contextWindow.endTime)
          }

          if (contextData.conversationState && contextData.conversationState.lastInteraction) {
            contextData.conversationState.lastInteraction = new Date(contextData.conversationState.lastInteraction)
          }

          if (contextData.sessionMetadata) {
            contextData.sessionMetadata.startTime = new Date(contextData.sessionMetadata.startTime)
            contextData.sessionMetadata.lastActivity = new Date(contextData.sessionMetadata.lastActivity)
          }

          if (contextData.lastInteraction && contextData.lastInteraction.timestamp) {
            contextData.lastInteraction.timestamp = new Date(contextData.lastInteraction.timestamp)
          }

          if (contextData.conversationHistory) {
            contextData.conversationHistory.forEach((turn: any) => {
              if (turn.timestamp) {
                turn.timestamp = new Date(turn.timestamp)
              }
            })
          }

          return contextData as WorkingMemoryContext
        }
      }

      return null
    } catch (error) {
      logger.warn('Failed to get stored working memory context:', error)
      return null
    }
  }

  /**
   * Store working memory context in database
   */
  private async storeWorkingMemoryContext(context: WorkingMemoryContext, userId: string): Promise<void> {
    try {
      // Store as a special episodic memory for working memory context
      const workingMemoryContent = JSON.stringify({
        conversationId: context.conversationId,
        currentTopic: context.currentTopic,
        conversationState: context.conversationState,
        activeGoals: context.activeGoals,
        userProfile: context.userProfile,
        sessionMetadata: context.sessionMetadata,
        lastInteraction: context.lastInteraction,
        conversationHistory: context.conversationHistory,
        contextWindow: context.contextWindow
      })

      await this.memoryService.storeEpisodicMemory({
        userId: userId,
        sessionId: context.sessionMetadata.sessionId,
        timestamp: new Date(),
        content: `WORKING_MEMORY_CONTEXT: ${workingMemoryContent}`,
        context: {
          type: 'working_memory_context',
          conversationId: context.conversationId
        },
        metadata: {
          source: 'working_memory_service',
          importance: 1.0,
          tags: ['working_memory', 'context', 'conversation_state'],
          location: 'working_memory_service'
        },
        relationships: {}
      })

      logger.debug('Working memory context stored in database', {
        conversationId: context.conversationId,
        userId: userId,
        sessionId: context.sessionMetadata.sessionId
      })
    } catch (error) {
      logger.warn('Failed to store working memory context in database:', error)
    }
  }

  /**
   * Compress context window if needed
   */
  async compressContextWindow(contextWindow: ContextWindow): Promise<ContextWindow> {
    if (contextWindow.compressionRatio > this.config.compressionThreshold) {
      // Implement compression logic here
      // For now, just return the original context window
      logger.info('Context window compression triggered', {
        compressionRatio: contextWindow.compressionRatio,
        threshold: this.config.compressionThreshold
      })
    }

    return contextWindow
  }

  /**
   * Build session metadata
   */
  async buildSessionMetadata(sessionId: string): Promise<SessionMetadata> {
    return {
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      totalInteractions: 0,
      averageResponseTime: 0,
      sessionGoals: [],
      contextSwitches: 0
    }
  }

  /**
   * Store session metadata
   */
  async storeSessionMetadata(metadata: SessionMetadata): Promise<void> {
    // This would typically store in a database
    logger.debug('Session metadata stored', { sessionId: metadata.sessionId })
  }

  /**
   * Get last interaction from memory context
   */
  async getLastInteraction(memoryContext: MemoryContext): Promise<Interaction> {
    const lastMemory = memoryContext.episodicMemories[memoryContext.episodicMemories.length - 1]

    if (!lastMemory) {
      return {
        id: 'no-interaction',
        timestamp: new Date(),
        userInput: '',
        assistantResponse: '',
        intent: 'none',
        confidence: 0,
        toolsUsed: [],
        memoryRetrieved: 0
      }
    }

    return {
      id: lastMemory.id,
      timestamp: lastMemory.timestamp,
      userInput: lastMemory.content.split('\n')[0] || '',
      assistantResponse: lastMemory.content.split('\n')[1] || '',
      intent: lastMemory.context.intent || 'unknown',
      confidence: lastMemory.context.confidence || 0,
      toolsUsed: lastMemory.context.toolsUsed || [],
      memoryRetrieved: memoryContext.episodicMemories.length
    }
  }

  /**
   * Get conversation history from memory context
   */
  async getConversationHistory(memoryContext: MemoryContext): Promise<ConversationTurn[]> {
    return memoryContext.episodicMemories.map((memory, index) => ({
      turnNumber: index + 1,
      timestamp: memory.timestamp,
      userInput: memory.content.split('\n')[0] || '',
      assistantResponse: memory.content.split('\n')[1] || '',
      intent: memory.context.intent || 'unknown',
      confidence: memory.context.confidence || 0,
      contextRelevance: memory.metadata.importance,
      toolsUsed: memory.context.toolsUsed || [],
      memoryRetrieved: memoryContext.episodicMemories.length
    }))
  }

  /**
   * Record an interaction
   */
  async recordInteraction(interaction: Interaction): Promise<void> {
    // This would typically store the interaction
    logger.debug('Interaction recorded', { interactionId: interaction.id })
  }

  /**
   * Get debug information
   */
  async getDebugInfo(userId: string, sessionId: string): Promise<any> {
    const cacheKey = `${userId}-${sessionId}`
    const cached = this.cache.get(cacheKey)

    return {
      userId,
      sessionId,
      cached: !!cached,
      cacheAge: cached ? Date.now() - cached.timestamp : null,
      activeSessions: this.performanceMetrics.activeSessions.size,
      totalRetrievals: this.performanceMetrics.totalRetrievals,
      averageRetrievalTime: this.performanceMetrics.totalRetrievals > 0
        ? this.performanceMetrics.totalRetrievalTime / this.performanceMetrics.totalRetrievals
        : 0
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    averageRetrievalTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    activeSessions: number;
  }> {
    const cacheHitRate = this.performanceMetrics.totalRetrievals > 0
      ? this.performanceMetrics.cacheHits / this.performanceMetrics.totalRetrievals
      : 0

    return {
      averageRetrievalTime: this.performanceMetrics.totalRetrievals > 0
        ? this.performanceMetrics.totalRetrievalTime / this.performanceMetrics.totalRetrievals
        : 0,
      cacheHitRate,
      memoryUsage: this.cache.size * 1024, // Rough estimate
      activeSessions: this.performanceMetrics.activeSessions.size
    }
  }

  /**
   * Analyze conversation patterns to determine state
   */
  private async analyzeConversationPatterns(memoryContext: MemoryContext): Promise<{
    hasActiveGoal: boolean
    awaitingResponse: boolean
    hasError: boolean
    isGreeting: boolean
    relevanceScore: number
  }> {
    const recentMemories = memoryContext.episodicMemories.slice(-3)
    const hasActiveGoal = recentMemories.some(m =>
      m.content.toLowerCase().includes('goal') ||
      m.content.toLowerCase().includes('plan') ||
      m.content.toLowerCase().includes('task')
    )

    const awaitingResponse = recentMemories.some(m =>
      m.content.toLowerCase().includes('?') ||
      m.content.toLowerCase().includes('waiting')
    )

    const hasError = recentMemories.some(m =>
      m.content.toLowerCase().includes('error') ||
      m.content.toLowerCase().includes('failed') ||
      m.content.toLowerCase().includes('problem')
    )

    const isGreeting = recentMemories.some(m =>
      m.content.toLowerCase().includes('hello') ||
      m.content.toLowerCase().includes('hi') ||
      m.content.toLowerCase().includes('greetings')
    )

    const relevanceScore = memoryContext.contextWindow.relevanceScore

    return {
      hasActiveGoal,
      awaitingResponse,
      hasError,
      isGreeting,
      relevanceScore
    }
  }

  /**
   * Update conversation state
   */
  private async updateConversationState(context: WorkingMemoryContext): Promise<void> {
    // This would typically update the memory context
    logger.debug('Conversation state updated', {
      state: context.conversationState.state,
      topic: context.conversationState.topic
    })
  }
}
