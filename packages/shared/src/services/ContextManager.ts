import { logger } from '../logger'
import {
  WorkingMemoryContext,
  MemoryContext,
  ContextWindow,
  ConversationState
} from '../types/memory'
import { SimpleLangChainService } from './SimpleLangChainService'

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
    maxTokens?: number
  ): Promise<{
    activeContext: string
    contextWindow: ContextWindow
    conversationState: ConversationState
    relevantMemories: string[]
    compressedContext: boolean
  }> {
    try {
      const effectiveMaxTokens = maxTokens || this.maxTokens
      
      // Build active context from working memory
      const activeContext = await this.buildActiveContext(workingMemory, newMessage)
      
      // Check if compression is needed
      const tokenCount = this.estimateTokenCount(activeContext)
      const needsCompression = tokenCount > effectiveMaxTokens * this.compressionThreshold
      
      let finalContext = activeContext
      let compressedContext = false
      
      if (needsCompression) {
        finalContext = await this.compressContext(activeContext, effectiveMaxTokens)
        compressedContext = true
        logger.info('Context compressed due to token limit', {
          originalTokens: tokenCount,
          compressedTokens: this.estimateTokenCount(finalContext),
          maxTokens: effectiveMaxTokens
        })
      }
      
      // Update context window
      const updatedContextWindow = await this.updateContextWindow(
        workingMemory.contextWindow,
        newMessage,
        finalContext
      )
      
      // Determine conversation state
      const conversationState = await this.determineConversationState(
        workingMemory,
        newMessage
      )
      
      // Extract relevant memories for reference
      const relevantMemories = this.extractRelevantMemories(workingMemory)
      
      return {
        activeContext: finalContext,
        contextWindow: updatedContextWindow,
        conversationState,
        relevantMemories,
        compressedContext
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
   * Compress context to fit within token limits
   */
  private async compressContext(
    context: string,
    maxTokens: number
  ): Promise<string> {
    try {
      const compressionPrompt = `
      Compress this conversation context to fit within ${maxTokens} tokens while preserving the most important information:
      
      Context:
      ${context}
      
      Requirements:
      - Keep the current topic and conversation state
      - Preserve active goals and user preferences
      - Include only the most recent and relevant conversation history
      - Maintain context for understanding the current message
      
      Return the compressed context:
      `
      
      const response = await this.langchainService.complete(compressionPrompt, {
        model: 'openai',
        temperature: 0.3,
        maxTokens: maxTokens
      })
      
      return response.content
    } catch (error) {
      logger.warn('Failed to compress context with LLM, using simple truncation:', error)
      return this.simpleTruncate(context, maxTokens)
    }
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
   * Estimate token count for text
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
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
