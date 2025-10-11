import { logger } from '../logger'
import {
  WorkingMemoryContext,
  MemoryContext,
  ContextWindow,
  ConversationState
} from '../types/memory'
import { SimpleLangChainService } from './SimpleLangChainService'

/**
 * Managed context result from context management
 */
export interface ManagedContext {
  activeContext: WorkingMemoryContext
  summary: string
  compressionRatio: number
  relevanceThreshold: number
  tokenUsage: number
  removedItems: string[]
  priorityItems: PriorityItem[]
}

/**
 * Compressed context result from compression
 */
export interface CompressedContext {
  originalContext: MemoryContext
  compressedContext: MemoryContext
  summary: string
  compressionRatio: number
  relevanceScores: RelevanceScore[]
  removedMemories: Memory[]
  keptMemories: Memory[]
  priorityItems: PriorityItem[]
  activeContext: WorkingMemoryContext
  tokenUsage: number
}

/**
 * Relevance score for a memory item
 */
export interface RelevanceScore {
  memoryId: string
  relevance: number
  category: string
  importance: number
  recency: number
  contextRelevance: number
}

/**
 * Priority item for context management
 */
export interface PriorityItem {
  id: string
  content: string
  priority: number
  category: string
  timestamp: Date
}

/**
 * Memory item for compression
 */
export interface Memory {
  id: string
  content: string
  timestamp: Date
  category?: string
  importance?: number
  tokenUsage?: number
}

/**
 * Context Manager - Manages context window and conversation flow
 *
 * This service is responsible for managing the context window, determining
 * what information to include in responses, and managing conversation flow
 * based on the working memory context.
 */
export class ContextManager {
  private langchainService: SimpleLangChainService
  private maxTokens: number
  private compressionThreshold: number

  constructor(
    langchainService: SimpleLangChainService,
    maxTokens: number = 8000,
    compressionThreshold: number = 0.8
  ) {
    this.langchainService = langchainService
    this.maxTokens = maxTokens
    this.compressionThreshold = compressionThreshold
  }

  /**
   * Manage context for a conversation turn
   */
  async manageContext(
    workingMemory: WorkingMemoryContext,
    newMessage: string,
    maxTokens?: number,
    userId?: string,
    sessionId?: string
  ): Promise<ManagedContext> {
    try {
      const effectiveMaxTokens = maxTokens || this.maxTokens

      // Calculate current token usage
      const currentTokens = await this.calculateTokenUsageForWorkingMemory(workingMemory)

      // If within limits, return current context
      if (currentTokens <= effectiveMaxTokens) {
        return {
          activeContext: workingMemory,
          summary: '',
          compressionRatio: 1.0,
          relevanceThreshold: 0.8,
          tokenUsage: currentTokens,
          removedItems: [],
          priorityItems: []
        }
      }

      // Calculate relevance scores for all memories
      const relevanceScores = await this.calculateRelevanceScores(
        workingMemory,
        newMessage
      )

      // Compress context based on relevance
      const compressedContext = await this.compressContext(
        workingMemory,
        relevanceScores,
        effectiveMaxTokens,
        userId,
        sessionId
      )

      // Generate summary of removed items
      const summary = await this.generateContextSummary(compressedContext)

      return {
        activeContext: compressedContext.activeContext,
        summary: summary,
        compressionRatio: compressedContext.compressionRatio,
        relevanceThreshold: 0.8,
        tokenUsage: compressedContext.tokenUsage,
        removedItems: compressedContext.removedMemories.map(m => m.content),
        priorityItems: compressedContext.priorityItems
      }
    } catch (error) {
      logger.error('Failed to manage context:', error)
      throw new Error(`Context management failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build active context from working memory
   */
  private async buildActiveContext(
    workingMemory: WorkingMemoryContext,
    newMessage: string
  ): Promise<string> {
    const contextParts: string[] = []

    // Add conversation topic
    contextParts.push(`Current Topic: ${workingMemory.currentTopic}`)

    // Add conversation state
    contextParts.push(`Conversation State: ${workingMemory.conversationState.state}`)

    // Add active goals
    if (workingMemory.activeGoals.length > 0) {
      const goalsText = workingMemory.activeGoals
        .map(goal => `- ${goal.description} (${goal.status})`)
        .join('\n')
      contextParts.push(`Active Goals:\n${goalsText}`)
    }

    // Add user profile
    const profile = workingMemory.userProfile
    contextParts.push(`User Profile:`)
    contextParts.push(`- Communication Style: ${profile.communicationStyle}`)
    contextParts.push(`- Formality: ${profile.formality}`)
    contextParts.push(`- Response Length: ${profile.responseLength}`)
    if (profile.preferences.length > 0) {
      contextParts.push(`- Preferences: ${profile.preferences.join(', ')}`)
    }
    if (profile.interests.length > 0) {
      contextParts.push(`- Interests: ${profile.interests.join(', ')}`)
    }

    // Add recent conversation history
    if (workingMemory.conversationHistory.length > 0) {
      const recentHistory = workingMemory.conversationHistory
        .slice(-5) // Last 5 turns
        .map(turn => `Turn ${turn.turnNumber}: ${turn.userInput} -> ${turn.assistantResponse}`)
        .join('\n')
      contextParts.push(`Recent Conversation:\n${recentHistory}`)
    }

    // Add current message
    contextParts.push(`Current Message: ${newMessage}`)

    return contextParts.join('\n\n')
  }


  /**
   * Simple truncation fallback
   */
  private simpleTruncate(context: string, maxTokens: number): string {
    const lines = context.split('\n')
    const maxChars = maxTokens * 4 // Rough character to token ratio
    let result = ''
    let charCount = 0

    for (const line of lines) {
      if (charCount + line.length > maxChars) {
        break
      }
      result += line + '\n'
      charCount += line.length
    }

    return result.trim()
  }

  /**
   * Update context window based on new message
   */
  private async updateContextWindow(
    currentWindow: ContextWindow,
    newMessage: string,
    context: string
  ): Promise<ContextWindow> {
    const now = new Date()
    const messageTokens = this.estimateTokenCount(newMessage)
    const contextTokens = this.estimateTokenCount(context)

    return {
      startTime: currentWindow.startTime,
      endTime: now,
      relevanceScore: this.calculateRelevanceScore(newMessage, currentWindow),
      maxTokens: currentWindow.maxTokens,
      currentTokens: contextTokens,
      compressionRatio: contextTokens / currentWindow.maxTokens
    }
  }

  /**
   * Determine conversation state based on working memory and new message
   */
  private async determineConversationState(
    workingMemory: WorkingMemoryContext,
    newMessage: string
  ): Promise<ConversationState> {
    const messageLower = newMessage.toLowerCase()

    // Check for greeting patterns
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('greetings')) {
      return {
        state: 'greeting',
        topic: workingMemory.currentTopic,
        activeGoals: workingMemory.activeGoals,
        lastInteraction: new Date(),
        contextRelevance: 0.9
      }
    }

    // Check for planning patterns
    if (messageLower.includes('plan') || messageLower.includes('goal') || messageLower.includes('task')) {
      return {
        state: 'planning',
        topic: workingMemory.currentTopic,
        activeGoals: workingMemory.activeGoals,
        lastInteraction: new Date(),
        contextRelevance: 0.8
      }
    }

    // Check for waiting patterns
    if (messageLower.includes('?') || messageLower.includes('waiting') || messageLower.includes('pending')) {
      return {
        state: 'waiting',
        topic: workingMemory.currentTopic,
        activeGoals: workingMemory.activeGoals,
        lastInteraction: new Date(),
        contextRelevance: 0.7
      }
    }

    // Check for error patterns
    if (messageLower.includes('error') || messageLower.includes('failed') || messageLower.includes('problem')) {
      return {
        state: 'error_recovery',
        topic: workingMemory.currentTopic,
        activeGoals: workingMemory.activeGoals,
        lastInteraction: new Date(),
        contextRelevance: 0.6
      }
    }

    // Default to active state
    return {
      state: 'active',
      topic: workingMemory.currentTopic,
      activeGoals: workingMemory.activeGoals,
      lastInteraction: new Date(),
      contextRelevance: 0.8
    }
  }

  /**
   * Extract relevant memories for reference
   */
  private extractRelevantMemories(workingMemory: WorkingMemoryContext): string[] {
    const memories: string[] = []

    // Add recent conversation turns
    workingMemory.conversationHistory
      .slice(-3) // Last 3 turns
      .forEach(turn => {
        memories.push(`Turn ${turn.turnNumber}: ${turn.userInput} -> ${turn.assistantResponse}`)
      })

    // Add active goals
    workingMemory.activeGoals.forEach(goal => {
      memories.push(`Goal: ${goal.description} (${goal.status})`)
    })

    // Add user preferences
    workingMemory.userProfile.preferences.forEach(preference => {
      memories.push(`Preference: ${preference}`)
    })

    return memories
  }

  /**
   * Calculate relevance score for a message
   */
  private calculateRelevanceScore(message: string, contextWindow: ContextWindow): number {
    // Simple relevance calculation based on message content and context
    const messageLength = message.length
    const contextAge = Date.now() - contextWindow.endTime.getTime()
    const ageFactor = Math.max(0, 1 - (contextAge / (24 * 60 * 60 * 1000))) // Decay over 24 hours

    // Base relevance on message length and context age
    const lengthFactor = Math.min(1, messageLength / 100) // Normalize to 0-1

    return (lengthFactor + ageFactor) / 2
  }

  /**
   * Estimate token count for text (improved approximation)
   */
  private estimateTokenCount(text: string): number {
    // More accurate approximation based on GPT tokenizer behavior:
    // - English text: ~4 characters per token
    // - Code/symbols: ~2-3 characters per token
    // - Punctuation: ~1 character per token
    // - Average for mixed content: ~3.5 characters per token

    // Count different character types for better estimation
    const codeChars = (text.match(/[{}[\]();=+\-*/<>!&|]/g) || []).length
    const punctuationChars = (text.match(/[.,!?;:'"]/g) || []).length
    const whitespaceChars = (text.match(/\s/g) || []).length
    const regularChars = text.length - codeChars - punctuationChars - whitespaceChars

    // Weighted token estimation
    const estimatedTokens = Math.ceil(
      (regularChars / 4) +           // Regular text: 4 chars/token
      (codeChars / 2.5) +           // Code/symbols: 2.5 chars/token
      (punctuationChars / 1.5) +    // Punctuation: 1.5 chars/token
      (whitespaceChars / 6)         // Whitespace: 6 chars/token
    )

    // Ensure minimum token count for non-empty text
    return text.length > 0 ? Math.max(estimatedTokens, 1) : 0
  }

  /**
   * Compress context to fit within token limits
   */
  private async compressContext(
    workingMemory: WorkingMemoryContext,
    relevanceScores: RelevanceScore[],
    maxTokens: number,
    userId?: string,
    sessionId?: string
  ): Promise<CompressedContext> {
    try {
      // Convert working memory to memory context for compression
      const memoryContext = this.convertWorkingMemoryToMemoryContext(workingMemory, userId, sessionId)

      // Sort memories by relevance score
      const sortedMemories = memoryContext.episodicMemories
        .map(memory => ({
          memory: {
            id: memory.id,
            content: memory.content,
            timestamp: memory.timestamp,
            category: 'conversation',
            importance: memory.metadata.importance
          },
          relevance: relevanceScores.find(s => s.memoryId === memory.id)?.relevance || 0
        }))
        .sort((a, b) => b.relevance - a.relevance)

      // Select memories to keep based on token budget
      const keptMemories: Memory[] = []
      const removedMemories: Memory[] = []
      let currentTokens = 0

      for (const { memory, relevance } of sortedMemories) {
        const memoryTokens = await this.calculateTokenUsageForText(memory.content)

        if (currentTokens + memoryTokens <= maxTokens && relevance > 0.5) {
          keptMemories.push(memory)
          currentTokens += memoryTokens
        } else {
          removedMemories.push(memory)
        }
      }

      // Compress remaining memories if still over budget
      const compressedMemories = await this.compressMemories(keptMemories, maxTokens - currentTokens)

      // Generate summary of removed content
      const summary = await this.generateRemovedContentSummary(removedMemories)

      // Create priority items from kept memories
      const priorityItems: PriorityItem[] = compressedMemories.map(memory => ({
        id: memory.id,
        content: memory.content,
        priority: relevanceScores.find(s => s.memoryId === memory.id)?.relevance || 0.5,
        category: memory.category || 'conversation',
        timestamp: memory.timestamp
      }))

      // Convert back to working memory context
      const activeContext: WorkingMemoryContext = {
        conversationId: workingMemory.conversationId,
        currentTopic: workingMemory.currentTopic,
        conversationState: workingMemory.conversationState,
        activeGoals: workingMemory.activeGoals,
        userProfile: workingMemory.userProfile,
        sessionMetadata: workingMemory.sessionMetadata,
        lastInteraction: workingMemory.lastInteraction,
        conversationHistory: compressedMemories.map(m => ({
          turnNumber: parseInt(m.id.replace('turn-', '')) || 1,
          userInput: m.content.split(' -> ')[0] || '',
          assistantResponse: m.content.split(' -> ')[1] || '',
          timestamp: m.timestamp,
          intent: 'conversation',
          confidence: 0.8,
          contextRelevance: 0.8,
          toolsUsed: [],
          memoryRetrieved: 0
        })),
        contextWindow: {
          startTime: workingMemory.contextWindow.startTime,
          endTime: new Date(),
          relevanceScore: 0.8,
          maxTokens: workingMemory.contextWindow.maxTokens,
          currentTokens: this.estimateTokenCount(compressedMemories.map(m => m.content).join(' ')),
          compressionRatio: keptMemories.length / memoryContext.episodicMemories.length
        }
      }

      return {
        originalContext: memoryContext,
        compressedContext: {
          ...memoryContext,
          episodicMemories: compressedMemories.map(m => ({
            id: m.id,
            content: m.content,
            timestamp: m.timestamp,
            userId: userId || 'anonymous',
            sessionId: sessionId || workingMemory.sessionMetadata.sessionId,
            metadata: {
              source: 'context_manager',
              importance: m.importance || 0.5,
              tags: [m.category || 'conversation'],
              location: 'context_manager'
            },
            context: {},
            relationships: {}
          }))
        },
        summary,
        compressionRatio: keptMemories.length / memoryContext.episodicMemories.length,
        relevanceScores,
        removedMemories,
        keptMemories: compressedMemories,
        priorityItems,
        activeContext,
        tokenUsage: this.estimateTokenCount(compressedMemories.map(m => m.content).join(' '))
      }
    } catch (error) {
      logger.error('Failed to compress context:', error)
      throw new Error(`Context compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Calculate relevance scores for all memories
   */
  private async calculateRelevanceScores(
    workingMemory: WorkingMemoryContext,
    newMessage: string
  ): Promise<RelevanceScore[]> {
    try {
      const scores: RelevanceScore[] = []

      // Get all memories from context
      const allMemories = [
        ...workingMemory.conversationHistory.map(turn => ({
          content: `${turn.userInput} -> ${turn.assistantResponse}`,
          id: `turn-${turn.turnNumber}`,
          timestamp: new Date()
        })),
        ...workingMemory.activeGoals.map(g => ({
          content: g.description,
          id: g.id,
          timestamp: new Date()
        }))
      ]

      for (const memory of allMemories) {
        // Calculate different relevance factors
        const semanticRelevance = await this.calculateSemanticRelevance(
          memory.content,
          newMessage
        )

        const recencyScore = this.calculateRecencyScore(memory.timestamp)

        const importanceScore = this.calculateImportanceScore(memory)

        const contextRelevance = this.calculateContextRelevance(
          memory,
          workingMemory.currentTopic
        )

        // Weighted combination of factors
        const overallRelevance = (
          semanticRelevance * 0.4 +
          recencyScore * 0.2 +
          importanceScore * 0.2 +
          contextRelevance * 0.2
        )

        scores.push({
          memoryId: memory.id,
          relevance: overallRelevance,
          category: 'conversation',
          importance: importanceScore,
          recency: recencyScore,
          contextRelevance
        })
      }

      return scores
    } catch (error) {
      logger.warn('Failed to calculate relevance scores:', error)
      return []
    }
  }

  /**
   * Calculate semantic relevance between memory content and new message
   */
  private async calculateSemanticRelevance(
    memoryContent: string,
    newMessage: string
  ): Promise<number> {
    try {
      // Truncate memory content to prevent token limit issues
      const maxMemoryLength = 2000 // Limit to ~500 tokens
      const truncatedMemory = memoryContent.length > maxMemoryLength
        ? memoryContent.substring(0, maxMemoryLength) + '...'
        : memoryContent

      const prompt = `
      Calculate the semantic relevance between these two texts on a scale of 0-1:

      Memory: "${truncatedMemory}"
      New Message: "${newMessage}"

      Consider:
      - Topic similarity
      - Concept overlap
      - Contextual relationship
      - Information relevance

      Return only a number between 0 and 1.
      `

      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.1,
        maxTokens: 10
      })

      const relevance = parseFloat(response.content.trim())
      return isNaN(relevance) ? 0 : Math.max(0, Math.min(1, relevance))
    } catch (error) {
      logger.warn('Failed to calculate semantic relevance:', error)
      return 0.5
    }
  }

  /**
   * Compress memories to fit within token budget
   */
  private async compressMemories(
    memories: Memory[],
    availableTokens: number
  ): Promise<Memory[]> {
    try {
      if (memories.length === 0) return []

      // Group memories by category
      const groupedMemories = this.groupMemoriesByCategory(memories)

      const compressedMemories: Memory[] = []
      let remainingTokens = availableTokens

      // Process each category
      for (const [category, categoryMemories] of Object.entries(groupedMemories)) {
        if (remainingTokens <= 0) break

        // Compress category memories
        const compressedCategory = await this.compressCategoryMemories(
          categoryMemories,
          remainingTokens
        )

        compressedMemories.push(...compressedCategory.memories)
        remainingTokens -= compressedCategory.tokenUsage
      }

      return compressedMemories
    } catch (error) {
      logger.warn('Failed to compress memories:', error)
      return memories.slice(0, 5) // Fallback to first 5 memories
    }
  }

  /**
   * Compress memories within a category
   */
  private async compressCategoryMemories(
    memories: Memory[],
    maxTokens: number
  ): Promise<{ memories: Memory[], tokenUsage: number }> {
    try {
      if (memories.length === 0) return { memories: [], tokenUsage: 0 }

      // If only one memory, compress it directly
      if (memories.length === 1) {
        const compressed = await this.compressSingleMemory(memories[0], maxTokens)
        return { memories: [compressed], tokenUsage: compressed.tokenUsage || 0 }
      }

      // For multiple memories, create a summary
      const summary = await this.createCategorySummary(memories)
      const summaryTokens = await this.calculateTokenUsageForText(summary)

      if (summaryTokens <= maxTokens) {
        return {
          memories: [{
            id: `summary-${Date.now()}`,
            content: summary,
            timestamp: new Date(),
            category: memories[0].category,
            tokenUsage: summaryTokens
          }],
          tokenUsage: summaryTokens
        }
      }

      // If summary is too long, select most important memories
      const sortedMemories = memories.sort((a, b) =>
        (b.importance || 0) - (a.importance || 0)
      )

      const selectedMemories: Memory[] = []
      let currentTokens = 0

      for (const memory of sortedMemories) {
        const memoryTokens = await this.calculateTokenUsageForText(memory.content)
        if (currentTokens + memoryTokens <= maxTokens) {
          selectedMemories.push(memory)
          currentTokens += memoryTokens
        } else {
          break
        }
      }

      return { memories: selectedMemories, tokenUsage: currentTokens }
    } catch (error) {
      logger.warn('Failed to compress category memories:', error)
      return { memories: memories.slice(0, 1), tokenUsage: 0 }
    }
  }

  /**
   * Compress a single memory
   */
  private async compressSingleMemory(
    memory: Memory,
    maxTokens: number
  ): Promise<Memory> {
    try {
      const currentTokens = await this.calculateTokenUsageForText(memory.content)

      if (currentTokens <= maxTokens) {
        return { ...memory, tokenUsage: currentTokens }
      }

      // Compress using LLM
      const prompt = `
      Compress this memory content to fit within ${maxTokens} tokens while preserving the most important information:

      Content: ${memory.content}

      Requirements:
      - Keep the most important information
      - Maintain context and meaning
      - Preserve key details and relationships

      Return the compressed content:
      `

      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        maxTokens: maxTokens
      })

      return {
        ...memory,
        content: response.content,
        tokenUsage: await this.calculateTokenUsageForText(response.content)
      }
    } catch (error) {
      logger.warn('Failed to compress single memory:', error)
      return memory
    }
  }

  /**
   * Create a summary for a category of memories
   */
  private async createCategorySummary(memories: Memory[]): Promise<string> {
    try {
      const content = memories.map(m => m.content).join('\n')

      const prompt = `
      Create a concise summary of these memories:

      ${content}

      Focus on:
      - Key topics and themes
      - Important information
      - Relevant context

      Keep it under 200 words.
      `

      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        maxTokens: 300
      })

      return response.content
    } catch (error) {
      logger.warn('Failed to create category summary:', error)
      return memories.map(m => m.content).join('; ')
    }
  }

  /**
   * Group memories by category
   */
  private groupMemoriesByCategory(memories: Memory[]): Record<string, Memory[]> {
    const grouped: Record<string, Memory[]> = {}

    for (const memory of memories) {
      const category = memory.category || 'conversation'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(memory)
    }

    return grouped
  }

  /**
   * Generate summary of removed content
   */
  private async generateRemovedContentSummary(removedMemories: Memory[]): Promise<string> {
    try {
      if (removedMemories.length === 0) {
        return ''
      }

      // Truncate each memory content to prevent token limit issues
      const maxMemoryLength = 500 // Limit each memory to ~125 tokens
      const removedContent = removedMemories
        .map(m => m.content.length > maxMemoryLength
          ? m.content.substring(0, maxMemoryLength) + '...'
          : m.content
        )
        .join('\n')

      // Further truncate the total content if it's still too long
      const maxTotalLength = 5000 // Limit total content to ~1250 tokens
      const truncatedContent = removedContent.length > maxTotalLength
        ? removedContent.substring(0, maxTotalLength) + '...'
        : removedContent

      const prompt = `
      Create a concise summary of this removed conversation content:

      ${truncatedContent}

      Focus on:
      - Key topics discussed
      - Important decisions made
      - Relevant context for future conversations

      Keep it under 100 words.
      `

      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        maxTokens: 150
      })

      return response.content.trim()
    } catch (error) {
      logger.warn('Failed to generate removed content summary:', error)
      return 'Previous conversation context removed due to token limits.'
    }
  }

  /**
   * Convert working memory to memory context for compression
   */
  private convertWorkingMemoryToMemoryContext(
    workingMemory: WorkingMemoryContext,
    userId?: string,
    sessionId?: string
  ): MemoryContext {
    const effectiveUserId = userId || 'anonymous'
    const effectiveSessionId = sessionId || workingMemory.sessionMetadata.sessionId
    return {
      userId: effectiveUserId,
      sessionId: effectiveSessionId,
      episodicMemories: workingMemory.conversationHistory.map(turn => ({
        id: `turn-${turn.turnNumber}`,
        userId: effectiveUserId,
        sessionId: effectiveSessionId,
        content: `User: ${turn.userInput}\nAssistant: ${turn.assistantResponse}`,
        timestamp: turn.timestamp,
        metadata: {
          source: 'working_memory',
          importance: 0.5,
          tags: ['conversation'],
          location: 'working_memory'
        },
        context: {},
        relationships: {}
      })),
      semanticMemories: [],
      contextWindow: workingMemory.contextWindow
    }
  }

  /**
   * Calculate token usage for working memory
   */
  private async calculateTokenUsageForWorkingMemory(workingMemory: WorkingMemoryContext): Promise<number> {
    try {
      const context = await this.buildActiveContext(workingMemory, '')
      return this.estimateTokenCount(context)
    } catch (error) {
      logger.warn('Failed to calculate token usage:', error)
      return 0
    }
  }

  /**
   * Calculate token usage for text
   */
  private async calculateTokenUsageForText(text: string): Promise<number> {
    try {
      // Use tiktoken for accurate token counting if available
      // @ts-ignore - tiktoken may not be available
      const tiktoken = await import('tiktoken')
      const tokenizer = tiktoken.get_encoding('cl100k_base')
      return tokenizer.encode(text).length
    } catch (error) {
      // Fallback to approximate calculation
      logger.warn('tiktoken not available, using approximate token counting:', error)
      return this.estimateTokenCount(text)
    }
  }

  /**
   * Calculate recency score for a timestamp
   */
  private calculateRecencyScore(timestamp: Date): number {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    // Exponential decay: more recent = higher score
    return Math.exp(-diffHours / 24) // 24-hour half-life
  }

  /**
   * Calculate importance score for a memory
   */
  private calculateImportanceScore(memory: { content: string; importance?: number }): number {
    if (memory.importance !== undefined) {
      return memory.importance
    }

    // Simple heuristic based on content length and keywords
    const content = memory.content.toLowerCase()
    const lengthFactor = Math.min(1, memory.content.length / 200)

    const importantKeywords = ['important', 'goal', 'plan', 'decision', 'preference', 'like', 'dislike']
    const keywordFactor = importantKeywords.some(keyword => content.includes(keyword)) ? 0.8 : 0.3

    return (lengthFactor + keywordFactor) / 2
  }

  /**
   * Calculate context relevance for a memory
   */
  private calculateContextRelevance(
    memory: { content: string; category?: string },
    currentTopic: string
  ): number {
    if (!currentTopic) return 0.5

    const content = memory.content.toLowerCase()
    const topic = currentTopic.toLowerCase()

    // Simple keyword matching
    const topicWords = topic.split(' ')
    const contentWords = content.split(' ')

    const matches = topicWords.filter(word =>
      contentWords.some(contentWord => contentWord.includes(word))
    )

    return matches.length / topicWords.length
  }

  /**
   * Generate context summary
   */
  private async generateContextSummary(compressedContext: CompressedContext): Promise<string> {
    try {
      if (compressedContext.removedMemories.length === 0) {
        return ''
      }

      return compressedContext.summary
    } catch (error) {
      logger.warn('Failed to generate context summary:', error)
      return 'Previous conversation context removed due to token limits.'
    }
  }

  /**
   * Get context statistics
   */
  getContextStats(workingMemory: WorkingMemoryContext): {
    totalMemories: number
    activeGoals: number
    conversationTurns: number
    contextWindowSize: number
    compressionRatio: number
  } {
    return {
      totalMemories: workingMemory.conversationHistory.length,
      activeGoals: workingMemory.activeGoals.length,
      conversationTurns: workingMemory.conversationHistory.length,
      contextWindowSize: workingMemory.contextWindow.currentTokens,
      compressionRatio: workingMemory.contextWindow.compressionRatio
    }
  }
}
