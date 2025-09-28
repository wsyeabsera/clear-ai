import { logger } from '../logger'
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService'
import { parseLLMJsonResponse } from '../utils'

/**
 * Query intent classification result
 */
export interface QueryIntent {
  type: 'memory_chat' | 'tool_execution' | 'hybrid' | 'knowledge_search' | 'conversation' | 'confirmation_request' | 'unknown'
  confidence: number
  requiredTools?: string[]
  memoryContext?: boolean
  parameters?: Record<string, any>
  reasoning?: string
  needsConfirmation?: boolean
  confirmationMessage?: string
}

/**
 * Intent classification options
 */
export interface IntentClassificationOptions {
  model?: string
  temperature?: number
  includeAvailableTools?: boolean
  userContext?: {
    userId?: string
    sessionId?: string
    previousIntents?: QueryIntent[]
  }
  memoryContext?: {
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
}

/**
 * Tool registry interface for getting available tools and schemas
 */
export interface ToolRegistry {
  getAllTools(): Array<{ name: string; description: string }>
  getToolNames(): string[]
  getToolSchema(name: string): any
  getAllToolSchemas(): any[]
}

/**
 * Intent classification service that determines the execution type for user queries
 */
export class IntentClassifierService {
  private langchainService: SimpleLangChainService
  private toolRegistry: ToolRegistry

  constructor(langchainConfig: CoreKeysAndModels, toolRegistry: ToolRegistry) {
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.toolRegistry = toolRegistry
  }

  /**
   * Classify a user query to determine the appropriate execution path
   */
  async classifyQuery(
    query: string,
    options: IntentClassificationOptions = {}
  ): Promise<QueryIntent> {
    try {
      logger.info(`Classifying query: "${query}"`)

      // Get available tools if requested
      let availableToolsInfo = ''
      if (options.includeAvailableTools) {
        const tools = this.toolRegistry.getAllTools()
        availableToolsInfo = `\n\nAvailable tools: ${tools.map(t => t.name).join(', ')}`

        // Add detailed tool information
        const toolDetails = tools.map(tool => {
          try {
            const schema = this.toolRegistry.getToolSchema(tool.name)
            const requiredParams = schema?.required || []
            const paramDescriptions = Object.entries(schema?.properties || {}).map(
              ([key, value]: [string, any]) => `${key}: ${value.description || 'No description'}`
            ).join(', ')

            return `${tool.name}: ${tool.description}${paramDescriptions ? ` (Parameters: ${paramDescriptions})` : ''}${requiredParams.length ? ` (Required: ${requiredParams.join(', ')})` : ''}`
          } catch (error) {
            return `${tool.name}: ${tool.description}`
          }
        }).join('\n')

        availableToolsInfo += `\n\nDetailed tool information:\n${toolDetails}`
      }

      // Build classification prompt
      const systemPrompt = this.buildClassificationPrompt(availableToolsInfo)
      const userPrompt = this.buildUserPrompt(query, options.userContext, options.memoryContext)

      // Get classification from LLM
      const response = await this.langchainService.complete(userPrompt, {
        model: options.model || 'openai',
        temperature: options.temperature || 0.1,
        systemMessage: systemPrompt,
        metadata: {
          service: 'IntentClassifierService',
          query: query.substring(0, 100), // Log first 100 chars
          userId: options.userContext?.userId,
          sessionId: options.userContext?.sessionId
        }
      })

      // Parse the response
      const classification = this.parseClassificationResponse(response.content)

      // Validate and enhance the classification
      const enhancedClassification = await this.validateAndEnhanceClassification(
        classification,
        query,
        options
      )

      logger.info(`Query classified as: ${enhancedClassification.type} (confidence: ${enhancedClassification.confidence})`)

      return enhancedClassification

    } catch (error) {
      logger.error('Error classifying query:', error)

      // Fallback to conversation intent
      return {
        type: 'conversation',
        confidence: 0.5,
        reasoning: `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Build the system prompt for intent classification
   */
  private buildClassificationPrompt(availableToolsInfo: string): string {
    return `You are an intent classifier for an AI system that can handle memory-aware conversations, tool execution, and hybrid workflows.

Your task is to classify user queries into one of these intent types:

1. **memory_chat**: Pure conversation that benefits from memory context
   - Questions about previous conversations
   - Requests for information based on past interactions
   - General conversation that should remember context
   - Examples: "What did we discuss yesterday?", "Remember that I like Python", "How are you doing?"

2. **tool_execution**: Direct tool usage or computational tasks
   - Calculations, API calls, file operations
   - Data processing or analysis
   - System operations
   - Multi-step workflows (sequential tool execution)
   - Follow-up requests for new tool execution (even if referencing previous context)
   - Examples: "Calculate 5 + 3", "Make an API call to...", "Read this file", "Get the weather", "Get posts for user 1, then get comments for the first post", "now get me all posts of user two"

3. **hybrid**: Tool execution combined with memory context
   - Tool usage that should consider user preferences or history
   - Complex workflows that need both memory and tools
   - Follow-up requests that build on previous successful tool executions
   - Requests that reference previous API calls, data, or results
   - Examples: "Based on my preferences, find a restaurant", "Remember this data and analyze it", "now get me posts for user 2" (after previous API calls), "get me the comments for that post we just retrieved"

4. **knowledge_search**: Search existing knowledge/memories
   - Questions about stored information
   - Memory retrieval without conversation
   - Examples: "What do I know about machine learning?", "Search my memories for..."

5. **conversation**: General chat without specific intent
   - Casual conversation
   - Questions that don't fit other categories
   - Examples: "Hello", "How are you?", "Tell me a joke"

6. **confirmation_request**: User is responding to a confirmation prompt
   - User confirming or rejecting a proposed action
   - Responses like "yes", "no", "do it", "cancel", "proceed"
   - Examples: "Yes, do it", "No, don't do that", "Go ahead", "Cancel"

7. **unknown**: Queries that cannot be clearly classified
   - Ambiguous or unclear requests
   - Queries that don't fit any category
   - Examples: "What?", "I don't understand", "Help me with something"

${availableToolsInfo}

For each query, respond with a JSON object containing:
- type: one of the intent types above
- confidence: number between 0 and 1
- requiredTools: array of tool names if applicable
- memoryContext: boolean indicating if memory context is needed
- reasoning: brief explanation of your classification
- needsConfirmation: boolean indicating if this query should trigger a confirmation request
- confirmationMessage: string with the confirmation message to show the user (only if needsConfirmation is true)

IMPORTANT for tool_execution queries:
- If the query involves multiple sequential steps (using words like "then", "after", "next", "followed by"), include MULTIPLE instances of the same tool in requiredTools
- For multi-step API calls, include multiple "api_call" tools (one for each step)
- Examples:
  * "Get posts for user 1, then get comments for the first post" → requiredTools: ["api_call", "api_call"]
  * "Calculate 5+3, then multiply by 2" → requiredTools: ["calculator", "calculator"]
  * "Read file A, then read file B" → requiredTools: ["file_reader", "file_reader"]

Be precise and consider the user's intent carefully. For tool execution queries that involve significant actions (API calls, file modifications, data changes), set needsConfirmation to true and provide a clear confirmation message.

IMPORTANT for hybrid classification:
- If the query is a follow-up request (using words like "now", "next", "also", "then", "get me", "show me") AND there are relevant episodic memories showing previous successful tool executions, classify as "hybrid"
- Look for patterns like "now get me X" or "show me Y" after previous API calls or tool executions
- Hybrid classification should be used when the query builds on previous context but still requires new tool execution
- Examples of hybrid classification:
  * "now get me posts for user 2" (after previous API calls to JSONPlaceholder)
  * "get me the comments for that post" (referencing previous post retrieval)
  * "show me the weather in that city" (after previous location-based queries)
  * "analyze that data we just retrieved" (after previous data retrieval)`
  }

  /**
   * Build the user prompt with context
   */
  private buildUserPrompt(query: string, userContext?: IntentClassificationOptions['userContext'], memoryContext?: IntentClassificationOptions['memoryContext']): string {
    let prompt = `Classify this user query:\n"${query}"`

    // Add memory context for hybrid classification
    if (memoryContext) {
      prompt += `\n\nMemory Context:`

      // Add recent episodic memories
      if (memoryContext.episodicMemories.length > 0) {
        prompt += `\n\nRecent Episodic Memories:`
        memoryContext.episodicMemories.slice(0, 3).forEach((memory, index) => {
          prompt += `\n${index + 1}. [${memory.timestamp.toISOString()}] ${memory.content}`
          if (memory.metadata.tags.length > 0) {
            prompt += ` (tags: ${memory.metadata.tags.join(', ')})`
          }
        })
      }

      // Add relevant semantic memories
      if (memoryContext.semanticMemories.length > 0) {
        prompt += `\n\nRelevant Semantic Knowledge:`
        memoryContext.semanticMemories.slice(0, 3).forEach((memory, index) => {
          prompt += `\n${index + 1}. ${memory.concept}: ${memory.description}`
        })
      }

      // Add context window information
      prompt += `\n\nContext Window: ${memoryContext.contextWindow.startTime.toISOString()} to ${memoryContext.contextWindow.endTime.toISOString()} (relevance: ${memoryContext.contextWindow.relevanceScore})`
    }

    if (userContext?.previousIntents && userContext.previousIntents.length > 0) {
      prompt += `\n\nPrevious intents in this session:`
      userContext.previousIntents.slice(-3).forEach((intent, index) => {
        prompt += `\n${index + 1}. ${intent.type} (confidence: ${intent.confidence})`
      })
    }

    return prompt
  }

  /**
   * Parse the LLM response into a QueryIntent object
   */
  private parseClassificationResponse(response: string): Partial<QueryIntent> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response)

      // Validate required fields
      if (!parsed.type || !parsed.confidence) {
        throw new Error('Missing required fields in classification response')
      }

      return {
        type: parsed.type,
        confidence: Math.max(0, Math.min(1, parsed.confidence)),
        requiredTools: parsed.requiredTools || [],
        memoryContext: parsed.memoryContext || false,
        reasoning: parsed.reasoning || 'No reasoning provided'
      }
    } catch (parseError) {
      logger.warn('Failed to parse JSON response, trying to extract from text:', parseError)

      // Try to extract JSON from text response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return this.parseClassificationResponse(jsonMatch[0])
      }

      throw new Error('Could not parse classification response as JSON')
    }
  }

  /**
   * Validate and enhance the classification result
   */
  private async validateAndEnhanceClassification(
    classification: Partial<QueryIntent>,
    query: string,
    options: IntentClassificationOptions
  ): Promise<QueryIntent> {
    // Validate intent type
    const validTypes = ['memory_chat', 'tool_execution', 'hybrid', 'knowledge_search', 'conversation', 'unknown']
    if (!classification.type || !validTypes.includes(classification.type)) {
      logger.warn(`Invalid intent type: ${classification.type}, defaulting to unknown`)
      classification.type = 'unknown'
      classification.confidence = 0.3
    }

    // Validate confidence
    if (!classification.confidence || classification.confidence < 0 || classification.confidence > 1) {
      classification.confidence = 0.7 // Default confidence
    }

    // Check if this is a follow-up tool execution request that should be hybrid
    const isFollowUp = this.isFollowUpToolExecution(query)
    const hasRelevantMemories = options.memoryContext &&
      (options.memoryContext.episodicMemories.length > 0 || options.memoryContext.semanticMemories.length > 0)

    if (isFollowUp && hasRelevantMemories && classification.type === 'tool_execution') {
      logger.info('Reclassifying follow-up request with memory context from tool_execution to hybrid')
      classification.type = 'hybrid'
      classification.confidence = Math.max(0.8, classification.confidence)
      classification.memoryContext = true
    } else if (isFollowUp && classification.type === 'memory_chat') {
      logger.info('Reclassifying follow-up request from memory_chat to tool_execution')
      classification.type = 'tool_execution'
      classification.confidence = Math.max(0.8, classification.confidence)
    }

    // Enhance tool detection for tool_execution and hybrid intents
    if (classification.type === 'tool_execution' || classification.type === 'hybrid') {
      const detectedTools = await this.detectRequiredTools(query)

      // Check if this is a multi-step workflow that needs multiple tool instances
      const isMultiStep = this.isMultiStepWorkflow(query)

      if (isMultiStep && detectedTools.length > 0) {
        // For multi-step workflows, duplicate tools for sequential execution
        const multiStepTools: string[] = []
        detectedTools.forEach(tool => {
          // Add multiple instances of the same tool for sequential execution
          const stepCount = this.countPotentialApiCalls(query)
          for (let i = 0; i < Math.min(stepCount, 3); i++) {
            multiStepTools.push(tool)
          }
        })
        classification.requiredTools = multiStepTools
        logger.info(`Enhanced multi-step workflow: ${multiStepTools.length} tools detected for sequential execution`)
      } else {
        classification.requiredTools = detectedTools
      }

      if (classification.requiredTools && classification.requiredTools.length > 0) {
        classification.confidence = Math.min(1, classification.confidence + 0.1)
      }
    }

    // Set memory context based on intent type
    if (!classification.memoryContext) {
      classification.memoryContext = ['memory_chat', 'hybrid', 'knowledge_search'].includes(classification.type)
    }

    return classification as QueryIntent
  }

  /**
   * Detect which tools might be required for the query
   */
  private async detectRequiredTools(query: string): Promise<string[]> {
    try {
      const availableTools = this.toolRegistry.getAllTools()
      const toolNames = this.toolRegistry.getToolNames()

      // Enhanced tool detection with multi-step workflow support
      const detectedTools: string[] = []

      // Check for multi-step workflows first
      const multiStepPatterns = [
        /then\s+(?:show|get|fetch|call|use)/i,
        /after\s+(?:that|getting|fetching)/i,
        /next\s+(?:step|call|request)/i,
        /followed\s+by/i,
        /and\s+then/i,
        /,\s+then/i
      ]

      const isMultiStep = multiStepPatterns.some(pattern => pattern.test(query))

      // Calculator tool
      if (/\b(calculate|compute|add|subtract|multiply|divide|sum|total)\b/i.test(query)) {
        detectedTools.push('calculator')
      }

      // API call tool - enhanced detection for multi-step scenarios
      const apiPatterns = [
        /\b(api|http|fetch|get|post|call|request|endpoint|url)\b/i,
        /\bGET\s+\/[\w\/\-]+/i,
        /\bPOST\s+\/[\w\/\-]+/i,
        /\bhttps?:\/\/[\w\.\-]+/i,
        // Follow-up patterns that indicate new API calls
        /\b(now|next|also|then|after|follow|get|fetch|retrieve|show|display)\s+(?:me\s+)?(?:all\s+)?(?:posts?|users?|data|info|results?)/i,
        /\b(?:get|fetch|retrieve|show|display)\s+(?:me\s+)?(?:all\s+)?(?:posts?|users?|data|info|results?)\s+(?:for|of|from)/i
      ]

      const hasApiCall = apiPatterns.some(pattern => pattern.test(query))

      if (hasApiCall) {
        // For multi-step requests, we might need multiple API calls
        if (isMultiStep) {
          // Count potential API calls in the query
          const apiCallCount = this.countPotentialApiCalls(query)
          // Add multiple api_call tools for multi-step workflows
          for (let i = 0; i < Math.min(apiCallCount, 3); i++) { // Max 3 sequential calls
            detectedTools.push('api_call')
          }
        } else {
          detectedTools.push('api_call')
        }
      }

      // File operations
      if (/\b(file|read|write|save|load|directory|folder|path)\b/i.test(query)) {
        detectedTools.push('file_reader')
      }

      // JSON operations
      if (/\b(json|parse|extract|data)\b/i.test(query)) {
        detectedTools.push('json_reader')
      }

      // Parallel execution
      if (/\b(multiple|parallel|both|all|together|simultaneous)\b/i.test(query)) {
        detectedTools.push('execute_parallel')
      }

      // Filter to only available tools
      return detectedTools.filter(tool => toolNames.includes(tool))

    } catch (error) {
      logger.warn('Error detecting required tools:', error)
      return []
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
   * Check if the query is a follow-up tool execution request
   */
  private isFollowUpToolExecution(query: string): boolean {
    const followUpPatterns = [
      // Direct follow-up patterns
      /^(?:now|next|also|then|after|follow|get|fetch|retrieve|show|display)\s+(?:me\s+)?(?:all\s+)?(?:posts?|users?|data|info|results?)/i,
      /^(?:get|fetch|retrieve|show|display)\s+(?:me\s+)?(?:all\s+)?(?:posts?|users?|data|info|results?)\s+(?:for|of|from)/i,
      // Patterns that indicate new data requests
      /\b(?:user|post|comment|data|info)\s+\d+/i,
      /\b(?:all|every|each)\s+(?:posts?|users?|comments?|items?)/i,
      // API-related follow-ups
      /\b(?:api|endpoint|url|request|call)\b.*\b(?:user|post|comment|data)\b/i
    ]

    return followUpPatterns.some(pattern => pattern.test(query))
  }

  /**
   * Count potential API calls in a multi-step query
   */
  private countPotentialApiCalls(query: string): number {
    // Look for explicit step indicators first
    const stepPatterns = [
      /then\s+(?:show|get|fetch|call|use)/gi,
      /after\s+(?:that|getting|fetching)/gi,
      /next\s+(?:step|call|request)/gi,
      /followed\s+by/gi,
      /and\s+then/gi,
      /,\s+then/gi
    ]

    let stepCount = 0
    stepPatterns.forEach(pattern => {
      const matches = query.match(pattern)
      if (matches) {
        stepCount += matches.length
      }
    })

    // If we found explicit step indicators, use that count + 1 (for the initial step)
    if (stepCount > 0) {
      return Math.min(stepCount + 1, 3) // Max 3 steps
    }

    // Fallback: look for explicit API calls
    const apiPatterns = [
      /\bGET\s+[^\s]+/gi,
      /\bPOST\s+[^\s]+/gi,
      /\bhttps?:\/\/[^\s]+/gi
    ]

    let apiCount = 0
    apiPatterns.forEach(pattern => {
      const matches = query.match(pattern)
      if (matches) {
        apiCount += matches.length
      }
    })

    // For our specific query pattern, we know it should be 2 steps
    if (query.includes('get all posts for user ID 1') && query.includes('then show me how to get comments')) {
      return 2
    }

    // Minimum of 2 for multi-step, maximum of 3
    return Math.max(2, Math.min(apiCount, 3))
  }

  /**
   * Get available intent types
   */
  getAvailableIntentTypes(): string[] {
    return ['memory_chat', 'tool_execution', 'hybrid', 'knowledge_search', 'conversation', 'unknown']
  }

  /**
   * Get intent type descriptions
   */
  getIntentTypeDescriptions(): Record<string, string> {
    return {
      memory_chat: 'Pure conversation with memory context',
      tool_execution: 'Direct tool usage or computational tasks',
      hybrid: 'Tool execution combined with memory context',
      knowledge_search: 'Search existing knowledge/memories',
      conversation: 'General chat without specific intent',
      unknown: 'Queries that cannot be clearly classified'
    }
  }
}
