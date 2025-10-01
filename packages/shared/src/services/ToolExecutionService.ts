import { logger } from '../logger'
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService'
import { parseLLMJsonResponse } from '../utils'

/**
 * Tool definition interface
 */
export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
      required?: boolean
    }>
    required?: string[]
  }
  execute: (args: Record<string, any>) => Promise<any>
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean
  result?: any
  error?: string
  toolName: string
  executionTime: number
  traceId?: string
}

/**
 * Tool execution options
 */
export interface ToolExecutionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemMessage?: string
  metadata?: Record<string, any>
  timeout?: number
}

/**
 * Simple tool execution service that takes tool definitions and executes them
 */
export class ToolExecutionService {
  private langchainService: SimpleLangChainService
  private tools: Map<string, ToolDefinition> = new Map()

  constructor(langchainConfig: CoreKeysAndModels) {
    this.langchainService = new SimpleLangChainService(langchainConfig)
    this.registerDefaultTools()
  }

  /**
   * Register default tools including the unknown tool fallback
   */
  private registerDefaultTools(): void {
    const unknownTool: ToolDefinition = {
      name: 'unknown',
      description: 'Fallback tool when the query cannot be matched to any specific tool',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The original user query that could not be processed'
          },
          reason: {
            type: 'string',
            description: 'Reason why no specific tool could be matched'
          }
        },
        required: ['query']
      },
      execute: async (args: Record<string, any>) => {
        const { query, reason } = args
        return {
          message: `I couldn't determine how to help with your query: "${query}"`,
          reason: reason || 'No specific tool matched your request',
          suggestion: 'Please try rephrasing your request or ask for help with a specific task like calculations, greetings, or weather information.',
          availableTools: this.getRegisteredTools().filter(t => t.name !== 'unknown').map(t => t.name)
        }
      }
    }

    this.registerTool(unknownTool)
  }

  /**
   * Register a tool definition
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool)
  }

  /**
   * Register multiple tools at once
   */
  registerTools(tools: ToolDefinition[]): void {
    tools.forEach(tool => this.registerTool(tool))
  }

  async registerToolsFromCallback(callback: () => Promise<ToolDefinition[]>): Promise<void> {
    const tools = await callback()

    const mappedTools: ToolDefinition[] = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.execute
    }))

    this.registerTools(mappedTools)
  }

  /**
   * Get all registered tools
   */
  getRegisteredTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get a specific tool by name
   */
  getTool(toolName: string): ToolDefinition | null {
    return this.tools.get(toolName) || null
  }

  /**
   * Execute a tool by name with arguments
   */
  async executeTool(
    toolName: string,
    args: Record<string, any>,
    options?: ToolExecutionOptions
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now()
    const tool = this.getTool(toolName)

    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
        toolName,
        executionTime: Date.now() - startTime
      }
    }

    try {
      // Validate required parameters
      const requiredParams = tool.parameters.required || []
      const missingParams = requiredParams.filter(param => !(param in args))

      if (missingParams.length > 0) {
        return {
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')}`,
          toolName,
          executionTime: Date.now() - startTime
        }
      }

      // Set up timeout if specified
      let executionPromise = tool.execute(args)

      if (options?.timeout) {
        executionPromise = Promise.race([
          executionPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tool execution timeout')), options.timeout)
          )
        ])
      }

      // Execute the tool
      const result = await executionPromise
      const executionTime = Date.now() - startTime

      return {
        success: true,
        result,
        toolName,
        executionTime
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        toolName,
        executionTime
      }
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeTools(
    toolExecutions: Array<{ toolName: string; args: Record<string, any> }>,
    options?: ToolExecutionOptions
  ): Promise<ToolExecutionResult[]> {
    const promises = toolExecutions.map(({ toolName, args }) =>
      this.executeTool(toolName, args, options)
    )

    return Promise.all(promises)
  }

  /**
   * Execute multiple tools sequentially
   */
  async executeToolsSequential(
    toolExecutions: Array<{ toolName: string; args: Record<string, any> }>,
    options?: ToolExecutionOptions
  ): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = []

    for (const { toolName, args } of toolExecutions) {
      const result = await this.executeTool(toolName, args, options)
      results.push(result)

      // Stop execution if a tool fails (optional behavior)
      if (!result.success && options?.metadata?.stopOnError) {
        break
      }
    }

    return results
  }

  /**
   * Get tool definitions in a format suitable for LLM function calling
   */
  getToolDefinitionsForLLM(): Array<{
    type: 'function'
    function: {
      name: string
      description: string
      parameters: any
    }
  }> {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }))
  }

  /**
   * Execute a tool using LLM to determine parameters
   */
  async executeToolWithLLM(
    toolName: string,
    userQuery: string,
    options?: ToolExecutionOptions
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now()

    try {
      const tool = this.getTool(toolName)
      if (!tool) {
        return {
          success: false,
          error: `Tool '${toolName}' not found`,
          toolName,
          executionTime: Date.now() - startTime
        }
      }

      // Create a prompt to help the LLM determine the correct parameters
      const systemMessage = `You are a tool parameter extraction assistant.
      Given a tool definition and a user query, extract the appropriate parameters.

      Tool: ${tool.name}
      Description: ${tool.description}
      Parameters: ${JSON.stringify(tool.parameters, null, 2)}

      User Query: ${userQuery}

      Return ONLY a valid JSON object with the extracted parameters. Do not include any other text.`

      const response = await this.langchainService.complete(
        `Extract parameters for tool "${toolName}" from this query: "${userQuery}"`,
        {
          model: options?.model,
          temperature: options?.temperature || 0.1,
          systemMessage,
          metadata: {
            ...options?.metadata,
            toolName,
            userQuery
          }
        }
      )

      // Parse the LLM response as JSON
      let extractedArgs: Record<string, any>
      try {
        extractedArgs = JSON.parse(response.content)
      } catch (parseError) {
        // Try to extract JSON from the response if it's wrapped in other text
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          extractedArgs = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Could not parse JSON from LLM response')
        }
      }

      // Execute the tool with the extracted parameters
      return this.executeTool(toolName, extractedArgs, options)
    } catch (error) {
      return {
        success: false,
        error: `LLM parameter extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: Date.now() - startTime,
        toolName
      }
    }
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalTools: number
    toolNames: string[]
    availableModels: string[]
    currentModel: string
  } {
    return {
      totalTools: this.tools.size,
      toolNames: Array.from(this.tools.keys()),
      availableModels: this.langchainService.getAvailableModels(),
      currentModel: this.langchainService.getCurrentModel()
    }
  }

  /**
   * Clear all registered tools
   */
  clearTools(): void {
    this.tools.clear()
  }

  /**
   * Remove a specific tool
   */
  removeTool(toolName: string): boolean {
    return this.tools.delete(toolName)
  }

  /**
   * MCP-style execution: Take a user query and automatically determine which tool to call
   */
  async executeWithMCP(
    userQuery: string,
    options?: ToolExecutionOptions
  ): Promise<{
    success: boolean
    result?: any
    error?: string
    toolName?: string
    executionTime: number
    traceId?: string
    reasoning?: string
    needsMoreInfo?: boolean
    missingInfo?: string[]
    followUpQuestion?: string
  }> {
    const startTime = Date.now()

    try {
      // Get available tools for LLM context
      const availableTools = this.getRegisteredTools()

      if (availableTools.length === 0) {
        return {
          success: false,
          error: 'No tools available for execution',
          executionTime: Date.now() - startTime
        }
      }

      // Create a system message that helps the LLM choose the right tool and validate inputs
      const systemMessage = `You are a tool selection and validation assistant. Given a user query, you must:
1. Analyze the query to understand what the user wants to do
2. Choose the most appropriate tool from the available tools
3. If no specific tool matches the query, use the 'unknown' tool
4. Extract the correct parameters for that tool
5. Validate if all required parameters are provided
6. If missing required parameters, indicate what information is needed

Return ONLY a JSON object with this exact structure (always include the 'complete' field):

For complete queries (all required parameters provided):
{
  "toolName": "exact_tool_name",
  "args": {
    "param1": "value1",
    "param2": "value2"
  },
  "reasoning": "Brief explanation of why this tool was chosen",
  "complete": true
}

For incomplete queries (missing required parameters):
{
  "toolName": "exact_tool_name",
  "reasoning": "Brief explanation of why this tool was chosen",
  "complete": false,
  "missingInfo": ["specific missing parameter 1", "specific missing parameter 2"],
  "followUpQuestion": "A natural, conversational question asking for the missing information"
}

For queries that don't match any specific tool:
{
  "toolName": "unknown",
  "args": {
    "query": "original_user_query",
    "reason": "Brief explanation of why no specific tool matched"
  },
  "reasoning": "No specific tool could handle this query",
  "complete": true
}

IMPORTANT: Always include the 'complete' field in your response. Set it to 'true' if all required parameters are provided, 'false' if any required parameters are missing.

Available tools:
${availableTools.map(tool => `
- ${tool.name}: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters, null, 2)}
`).join('\n')}

User Query: "${userQuery}"

Return ONLY the JSON object, no other text.`

      // Use LLM to determine tool and parameters
      const llmResponse = await this.langchainService.complete(
        `Select the appropriate tool and extract parameters for this query: "${userQuery}"`,
        {
          model: options?.model,
          temperature: options?.temperature || 0.1,
          systemMessage,
          metadata: {
            ...options?.metadata,
            userQuery,
            mcpExecution: true
          }
        }
      )

      // Parse the LLM response
      let toolSelection: {
        toolName: string
        args?: Record<string, any>
        reasoning?: string
        complete?: boolean
        missingInfo?: string[]
        followUpQuestion?: string
      }

      try {
        // Use robust JSON parsing to handle different LLM response formats
        logger.info('LLM response', llmResponse.content)
        const parseResult = parseLLMJsonResponse(llmResponse.content)

        if (!parseResult.success) {
          logger.error('JSON parsing failed after multiple attempts:', parseResult.attempts)
          return {
            success: false,
            error: `Failed to parse LLM response: ${parseResult.error}. Attempts: ${parseResult.attempts.join(', ')}`,
            executionTime: Date.now() - startTime
          }
        }

        toolSelection = parseResult.data
        logger.info('Successfully parsed JSON response after attempts:', parseResult.success ? ['success'] : [])
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse LLM response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
          executionTime: Date.now() - startTime
        }
      }

      console.log('Tool selection', toolSelection)

      // Validate tool selection
      if (!toolSelection.toolName) {
        return {
          success: false,
          error: 'LLM response missing required field: toolName',
          executionTime: Date.now() - startTime
        }
      }

      // Check if query is complete (treat undefined as incomplete)
      if (toolSelection.complete === false || toolSelection.complete === undefined) {
        return {
          success: false,
          error: 'Incomplete query - missing required information',
          toolName: toolSelection.toolName,
          reasoning: toolSelection.reasoning,
          needsMoreInfo: true,
          missingInfo: toolSelection.missingInfo || [],
          followUpQuestion: toolSelection.followUpQuestion,
          executionTime: Date.now() - startTime,
          traceId: llmResponse.traceId
        }
      }

      // Handle unknown tool case
      if (toolSelection.toolName === 'unknown') {
        const unknownArgs = toolSelection.args || { query: userQuery, reason: 'No specific tool matched' }

        // Execute the unknown tool
        const executionResult = await this.executeTool(
          'unknown',
          unknownArgs,
          options
        )

        return {
          ...executionResult,
          reasoning: toolSelection.reasoning,
          traceId: llmResponse.traceId
        }
      }

      // Validate args for complete queries
      if (!toolSelection.args) {
        return {
          success: false,
          error: 'LLM response missing required field: args',
          toolName: toolSelection.toolName,
          executionTime: Date.now() - startTime
        }
      }

      console.log('Tool selection', toolSelection)
      logger.info('Tool selection', toolSelection)
      // Execute the selected tool
      const executionResult = await this.executeTool(
        toolSelection.toolName,
        toolSelection.args,
        options
      )

      return {
        ...executionResult,
        reasoning: toolSelection.reasoning,
        traceId: llmResponse.traceId
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        error: `MCP execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime
      }
    }
  }

  /**
   * Get the underlying LangChain service for advanced usage
   */
  getLangChainService(): SimpleLangChainService {
    return this.langchainService
  }
}
