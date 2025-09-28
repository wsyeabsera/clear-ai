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
      const userPrompt = this.buildUserPrompt(query, options.userContext)

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
   - Examples: "Calculate 5 + 3", "Make an API call to...", "Read this file", "Get the weather"

3. **hybrid**: Tool execution combined with memory context
   - Tool usage that should consider user preferences or history
   - Complex workflows that need both memory and tools
   - Examples: "Based on my preferences, find a restaurant", "Remember this data and analyze it"

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

Be precise and consider the user's intent carefully. For tool execution queries that involve significant actions (API calls, file modifications, data changes), set needsConfirmation to true and provide a clear confirmation message.`
  }

  /**
   * Build the user prompt with context
   */
  private buildUserPrompt(query: string, userContext?: IntentClassificationOptions['userContext']): string {
    let prompt = `Classify this user query:\n"${query}"`

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

    // Enhance tool detection for tool_execution and hybrid intents
    if (classification.type === 'tool_execution' || classification.type === 'hybrid') {
      classification.requiredTools = await this.detectRequiredTools(query)
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
      
      // Simple keyword-based tool detection
      const detectedTools: string[] = []
      
      // Calculator tool
      if (/\b(calculate|compute|add|subtract|multiply|divide|sum|total)\b/i.test(query)) {
        detectedTools.push('calculator')
      }
      
      // API call tool
      if (/\b(api|http|fetch|get|post|call|request|endpoint|url)\b/i.test(query)) {
        detectedTools.push('api_call')
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
