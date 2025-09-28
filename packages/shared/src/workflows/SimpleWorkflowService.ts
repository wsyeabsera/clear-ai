import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages"
import { logger } from '../logger'
import { ToolExecutionService, ToolDefinition, ToolExecutionResult } from '../services/ToolExecutionService'
import { SimpleLangChainService, CoreKeysAndModels } from '../services/SimpleLangChainService'

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean
  finalResult?: any
  allResults: Record<string, any>
  executionOrder: string[]
  errors: string[]
  executionTime: number
  traceId?: string
  messages: BaseMessage[]
}

/**
 * Simple workflow service that demonstrates tool chaining concepts
 * This is a simplified version that can be extended with LangGraph later
 */
export class SimpleWorkflowService {
  private langchainService: SimpleLangChainService
  private toolService: ToolExecutionService

  constructor(langchainConfig: CoreKeysAndModels, toolService: ToolExecutionService) {
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.toolService = toolService
  }

  /**
   * Execute a workflow based on user query
   */
  async executeWorkflow(
    userQuery: string,
    options?: {
      model?: string
      temperature?: number
      metadata?: Record<string, any>
    }
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now()
    const messages: BaseMessage[] = [new HumanMessage(userQuery)]
    const results: Record<string, any> = {}
    const errors: string[] = []
    const executionOrder: string[] = []

    try {
      logger.info(`Executing workflow for query: ${userQuery}`)

      // Step 1: Analyze the query to determine what tools to use
      const toolOrder = await this.analyzeQuery(userQuery, options)
      messages.push(new AIMessage(`Workflow analysis: Execute tools in order: ${toolOrder.join(' → ')}`))

      if (toolOrder.length === 0) {
        throw new Error('No tools could be determined from the query')
      }

      // Step 2: Execute tools in sequence
      for (const toolName of toolOrder) {
        try {
          logger.info(`Executing tool: ${toolName}`)
          
          // Extract arguments for the tool using LLM with previous results
          const args = await this.extractToolArgs(userQuery, toolName, results, options)
          
          // Execute the tool
          const result = await this.toolService.executeTool(toolName, args)
          
          // Store results
          results[toolName] = result
          executionOrder.push(toolName)
          
          // Add result to messages
          const resultMessage = new AIMessage(
            `Tool ${toolName} executed ${result.success ? 'successfully' : 'with error'}: ${JSON.stringify(result.result || result.error)}`
          )
          messages.push(resultMessage)

          // If tool failed and it's not optional, stop execution
          if (!result.success) {
            errors.push(`Tool ${toolName} failed: ${result.error}`)
            break
          }

          // Context is now automatically passed via extractToolArgs method
          logger.info(`Tool ${toolName} completed, results available for next tool`)

        } catch (toolError) {
          const errorMsg = `Tool ${toolName} execution failed: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`
          errors.push(errorMsg)
          logger.error(errorMsg)
          break
        }
      }

      // Step 3: Combine results
      const finalResult = this.combineResults(userQuery, results, executionOrder, startTime)
      
      const executionTime = Date.now() - startTime
      const success = errors.length === 0

      const finalMessage = new AIMessage(
        success 
          ? `Workflow completed successfully with ${executionOrder.length} steps`
          : `Workflow completed with ${errors.length} errors`
      )
      messages.push(finalMessage)

      return {
        success,
        finalResult,
        allResults: results,
        executionOrder,
        errors,
        executionTime,
        messages
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMsg = `Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      
      logger.error(errorMsg)
      
      const errorMessage = new AIMessage(`Workflow failed: ${errorMsg}`)
      messages.push(errorMessage)
      
      return {
        success: false,
        allResults: results,
        executionOrder,
        errors: [errorMsg],
        executionTime,
        messages
      }
    }
  }

  /**
   * Analyze the user query to determine tool execution order
   */
  private async analyzeQuery(
    userQuery: string,
    options?: {
      model?: string
      temperature?: number
      metadata?: Record<string, any>
    }
  ): Promise<string[]> {
    const availableTools = this.toolService.getRegisteredTools()
    
    const systemMessage = `You are a workflow analyzer. Given a user query and available tools, determine what tools need to be executed and in what order.

Available tools:
${availableTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

Return ONLY a JSON array of tool names in execution order. For example:
["api_call", "json_reader"]

User Query: "${userQuery}"

Return ONLY the JSON array, no other text.`

    try {
      const response = await this.langchainService.complete(
        `Analyze this query and determine tool execution order: "${userQuery}"`,
        {
          model: options?.model || 'ollama',
          temperature: options?.temperature || 0.1,
          systemMessage
        }
      )

      // Parse the response to get tool execution order
      const toolOrder = JSON.parse(response.content)
      
      // Validate that all tools exist
      const availableToolNames = availableTools.map(t => t.name)
      const validToolOrder = toolOrder.filter((toolName: string) => 
        availableToolNames.includes(toolName)
      )
      
      return validToolOrder

    } catch (error) {
      logger.error('Query analysis failed:', error)
      
      // Fallback: try to determine tools from the query directly
      const fallbackTools = this.determineToolsFromQuery(userQuery)
      return fallbackTools
    }
  }

  /**
   * Fallback method to determine tools from query content
   */
  private determineToolsFromQuery(userQuery: string): string[] {
    const availableTools = this.toolService.getRegisteredTools().map(t => t.name)
    const tools: string[] = []

    // Simple keyword-based tool detection
    if (userQuery.toLowerCase().includes('api call') || userQuery.includes('http')) {
      if (availableTools.includes('api_call')) {
        tools.push('api_call')
      }
    }

    if (userQuery.toLowerCase().includes('json') || userQuery.toLowerCase().includes('parse')) {
      if (availableTools.includes('json_reader')) {
        tools.push('json_reader')
      }
    }

    if (userQuery.toLowerCase().includes('file') || userQuery.toLowerCase().includes('read')) {
      if (availableTools.includes('file_reader')) {
        tools.push('file_reader')
      }
    }

    if (userQuery.toLowerCase().includes('parallel') || userQuery.toLowerCase().includes('multiple')) {
      if (availableTools.includes('execute_parallel')) {
        tools.push('execute_parallel')
      }
    }

    return tools.length > 0 ? tools : ['unknown']
  }

  /**
   * Extract tool arguments from the query and previous tool results using LLM
   */
  private async extractToolArgs(
    userQuery: string, 
    toolName: string, 
    previousResults?: Record<string, any>,
    options?: { model?: string; temperature?: number }
  ): Promise<Record<string, any>> {
    const args: Record<string, any> = {}
    
    // Get tool definition to understand required parameters
    const toolDefinition = this.toolService.getRegisteredTools().find(t => t.name === toolName)
    if (!toolDefinition) {
      logger.warn(`Tool ${toolName} not found in registered tools`)
      return args
    }

    // If we have previous results, use LLM to extract arguments
    if (previousResults && Object.keys(previousResults).length > 0) {
      logger.info(`Attempting LLM argument extraction for ${toolName} with ${Object.keys(previousResults).length} previous results`)
      try {
        const extractedArgs = await this.extractArgsWithLLM(
          userQuery, 
          toolName, 
          toolDefinition, 
          previousResults, 
          options
        )
        logger.info(`LLM argument extraction successful for ${toolName}:`, extractedArgs)
        return { ...args, ...extractedArgs }
      } catch (error) {
        logger.error(`LLM argument extraction failed for ${toolName}:`, error)
        logger.info(`Falling back to simple argument extraction for ${toolName}`)
        // Fall back to simple extraction
      }
    } else {
      logger.info(`No previous results available for ${toolName}, using simple extraction`)
    }
    
    // Fallback to simple regex-based extraction
    return this.extractArgsSimple(userQuery, toolName)
  }

  /**
   * Use LLM to extract tool arguments from previous results
   */
  private async extractArgsWithLLM(
    userQuery: string,
    toolName: string,
    toolDefinition: ToolDefinition,
    previousResults: Record<string, any>,
    options?: { model?: string; temperature?: number }
  ): Promise<Record<string, any>> {
    
    // Get tool parameter schema
    const parameterSchema = toolDefinition.parameters
    const requiredParams = parameterSchema.required || []
    const properties = parameterSchema.properties || {}

    // Prepare context from previous results
    const contextSummary = Object.entries(previousResults)
      .map(([tool, result]) => {
        if (result.success && result.result) {
          return `${tool}: ${JSON.stringify(result.result, null, 2)}`
        }
        return `${tool}: Failed - ${result.error}`
      })
      .join('\n\n')

    // Create system prompt for argument extraction
    const systemPrompt = `You are an expert at extracting tool arguments from previous tool results.

Available tool: ${toolName}
Description: ${toolDefinition.description}

Tool Parameters:
${JSON.stringify(properties, null, 2)}

Required parameters: ${requiredParams.join(', ')}

Your task is to extract the correct arguments for the ${toolName} tool based on:
1. The user's original query
2. Results from previous tools in the workflow
3. The tool's parameter schema

Return ONLY a valid JSON object with the extracted arguments. Do not include any other text or explanation.

Examples:
- For json_reader tool with api_call result containing JSON data, extract the jsonString parameter
- For api_call tool, extract URL from query or construct URL from previous results
- For execute_parallel tool, create tools array with proper structure

User Query: "${userQuery}"

Previous Tool Results:
${contextSummary}

Extract arguments for ${toolName}:`

    try {
      const response = await this.langchainService.complete(
        `Extract arguments for tool: ${toolName}`,
        {
          model: options?.model || 'ollama',
          temperature: options?.temperature || 0.1,
          systemMessage: systemPrompt,
          metadata: {
            toolName,
            userQuery,
            hasPreviousResults: Object.keys(previousResults).length > 0
          }
        }
      )

      // Parse the JSON response
      const extractedArgs = JSON.parse(response.content)
      
      // Validate that extracted args match the tool schema
      const validatedArgs = this.validateExtractedArgs(extractedArgs, toolDefinition)
      
      logger.info(`LLM extracted arguments for ${toolName}:`, validatedArgs)
      return validatedArgs

    } catch (error) {
      logger.error(`LLM argument extraction failed:`, error)
      throw new Error(`Failed to extract arguments using LLM: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate extracted arguments against tool schema
   */
  private validateExtractedArgs(extractedArgs: any, toolDefinition: ToolDefinition): Record<string, any> {
    const validatedArgs: Record<string, any> = {}
    const properties = toolDefinition.parameters.properties || {}
    const requiredParams = toolDefinition.parameters.required || []

    // Validate each extracted argument
    for (const [key, value] of Object.entries(extractedArgs)) {
      if (properties[key]) {
        // Basic type validation
        const expectedType = properties[key].type
        if (expectedType === 'string' && typeof value === 'string') {
          validatedArgs[key] = value
        } else if (expectedType === 'number' && typeof value === 'number') {
          validatedArgs[key] = value
        } else if (expectedType === 'boolean' && typeof value === 'boolean') {
          validatedArgs[key] = value
        } else if (expectedType === 'object' && typeof value === 'object') {
          validatedArgs[key] = value
        } else if (expectedType === 'array' && Array.isArray(value)) {
          validatedArgs[key] = value
        } else {
          // Try to convert to expected type
          validatedArgs[key] = this.convertToType(value, expectedType)
        }
      }
    }

    // Check for missing required parameters
    for (const requiredParam of requiredParams) {
      if (!(requiredParam in validatedArgs)) {
        logger.warn(`Missing required parameter: ${requiredParam} for tool ${toolDefinition.name}`)
      }
    }

    return validatedArgs
  }

  /**
   * Convert value to expected type
   */
  private convertToType(value: any, expectedType: string): any {
    switch (expectedType) {
      case 'string':
        return String(value)
      case 'number':
        return Number(value)
      case 'boolean':
        return Boolean(value)
      case 'object':
        return typeof value === 'object' ? value : JSON.parse(String(value))
      case 'array':
        return Array.isArray(value) ? value : [value]
      default:
        return value
    }
  }

  /**
   * Simple regex-based argument extraction (fallback)
   */
  private extractArgsSimple(userQuery: string, toolName: string): Record<string, any> {
    const args: Record<string, any> = {}
    
    // For api_call, try to extract URL from query
    if (toolName === 'api_call') {
      const urlMatch = userQuery.match(/https?:\/\/[^\s]+/)
      if (urlMatch) {
        args.url = urlMatch[0]
      }
    }
    
    // For execute_parallel, try to extract multiple URLs
    if (toolName === 'execute_parallel') {
      const urls = userQuery.match(/https?:\/\/[^\s]+/g)
      if (urls && urls.length > 1) {
        args.tools = urls.map((url, index) => ({
          toolName: 'api_call',
          arguments: { url }
        }))
      }
    }
    
    return args
  }

  /**
   * Combine results from all executed tools
   */
  private combineResults(
    userQuery: string,
    results: Record<string, any>,
    executionOrder: string[],
    startTime: number
  ): any {
    return {
      workflow: userQuery,
      steps: executionOrder,
      results: results,
      success: Object.values(results).every((result: any) => result.success),
      executionTime: Date.now() - startTime,
      summary: `Executed ${executionOrder.length} tools: ${executionOrder.join(', ')}`
    }
  }

  /**
   * Get available tools
   */
  getAvailableTools(): ToolDefinition[] {
    return this.toolService.getRegisteredTools()
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(): any {
    const availableTools = this.getAvailableTools()
    
    return {
      availableTools: availableTools.length,
      toolNames: availableTools.map(t => t.name),
      toolDescriptions: availableTools.map(t => ({
        name: t.name,
        description: t.description
      })),
      langchainModels: this.langchainService.getAvailableModels(),
      currentModel: this.langchainService.getCurrentModel()
    }
  }
}
