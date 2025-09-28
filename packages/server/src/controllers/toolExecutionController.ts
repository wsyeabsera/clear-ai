import { Request, Response } from 'express'
import { ApiResponse } from '@clear-ai/shared'
import {
  ToolExecutionService,
  ToolDefinition,
  ToolExecutionOptions,
  CoreKeysAndModels
} from '@clear-ai/shared'
import dotenv from 'dotenv'
import { ToolRegistry } from 'clear-ai-mcp-basic'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { logger } from '@clear-ai/shared'

dotenv.config()

const input: CoreKeysAndModels = {
  langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
  langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || '',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  mistralModel: process.env.MISTRAL_MODEL || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || '',
  ollamaModel: process.env.OLLAMA_MODEL || '',
}

// Export singleton instance
export const toolExecutionService = new ToolExecutionService(input)

// Register sample tools
async function initializeTools() {
  try {
    const toolRegistry = new ToolRegistry()
    const tools = toolRegistry.getAllTools()

    // Convert MCP tools to ToolDefinition format
    const toolDefinitions: ToolDefinition[] = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object' as const,
        properties: convertZodSchemaToJsonSchema(tool.inputSchema),
        required: getRequiredFields(tool.inputSchema)
      },
      execute: tool.execute
    }))

    toolExecutionService.registerTools(toolDefinitions)
    console.log(`Registered ${toolDefinitions.length} tools from MCP server`)
  } catch (error) {
    console.error('Failed to initialize tools:', error)
  }
}

// Helper function to convert Zod schema to JSON schema properties
function convertZodSchemaToJsonSchema(schema: any): Record<string, any> {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  }) as any

  return jsonSchema.properties || {}
}

// Helper function to extract required fields from Zod schema
function getRequiredFields(schema: any): string[] {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  }) as any

  return jsonSchema.required || []
}

// Initialize tools on startup
initializeTools()

export const toolExecutionController = {
  /**
   * Get all registered tools
   */
  async getTools(req: Request, res: Response): Promise<void> {
    try {
      const tools = toolExecutionService.getRegisteredTools()

      const response: ApiResponse<{
        tools: ToolDefinition[]
        count: number
      }> = {
        success: true,
        data: {
          tools,
          count: tools.length
        },
        message: 'Tools retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get tools',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get a specific tool by name
   */
  async getTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName } = req.params

      if (!toolName) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool name is required',
          message: 'Please provide a tool name'
        }
        res.status(400).json(response)
        return
      }

      const tool = toolExecutionService.getTool(toolName)

      if (!tool) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool not found',
          message: `Tool '${toolName}' does not exist`
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<ToolDefinition> = {
        success: true,
        data: tool,
        message: 'Tool retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get tool',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Register a new tool
   */
  async registerTool(req: Request, res: Response): Promise<void> {
    try {
      const tool: ToolDefinition = req.body

      if (!tool.name || !tool.description || !tool.parameters || !tool.execute) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid tool definition',
          message: 'Tool must have name, description, parameters, and execute function'
        }
        res.status(400).json(response)
        return
      }

      toolExecutionService.registerTool(tool)

      const response: ApiResponse<{ toolName: string }> = {
        success: true,
        data: { toolName: tool.name },
        message: 'Tool registered successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to register tool',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Execute a tool
   */
  async executeTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName, args, options } = req.body

      if (!toolName) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool name is required',
          message: 'Please provide a tool name'
        }
        res.status(400).json(response)
        return
      }

      const result = await toolExecutionService.executeTool(toolName, args || {}, {
        ...options,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: result.success ? 'Tool executed successfully' : 'Tool execution failed'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute tool',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Execute multiple tools in parallel
   */
  async executeTools(req: Request, res: Response): Promise<void> {
    try {
      const { toolExecutions, options } = req.body

      if (!toolExecutions || !Array.isArray(toolExecutions)) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool executions array is required',
          message: 'Please provide an array of tool executions'
        }
        res.status(400).json(response)
        return
      }

      const results = await toolExecutionService.executeTools(toolExecutions, {
        ...options,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results,
        message: 'Tools executed successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute tools',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Execute multiple tools sequentially
   */
  async executeToolsSequential(req: Request, res: Response): Promise<void> {
    try {
      const { toolExecutions, options } = req.body

      if (!toolExecutions || !Array.isArray(toolExecutions)) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool executions array is required',
          message: 'Please provide an array of tool executions'
        }
        res.status(400).json(response)
        return
      }

      const results = await toolExecutionService.executeToolsSequential(toolExecutions, {
        ...options,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results,
        message: 'Tools executed sequentially'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute tools sequentially',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get tool definitions for LLM function calling
   */
  async getToolDefinitionsForLLM(req: Request, res: Response): Promise<void> {
    try {
      const definitions = toolExecutionService.getToolDefinitionsForLLM()

      const response: ApiResponse<typeof definitions> = {
        success: true,
        data: definitions,
        message: 'Tool definitions retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get tool definitions',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get execution statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = toolExecutionService.getExecutionStats()

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Remove a tool
   */
  async removeTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName } = req.params

      if (!toolName) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool name is required',
          message: 'Please provide a tool name'
        }
        res.status(400).json(response)
        return
      }

      const removed = toolExecutionService.removeTool(toolName)

      if (!removed) {
        const response: ApiResponse = {
          success: false,
          error: 'Tool not found',
          message: `Tool '${toolName}' does not exist`
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<{ toolName: string }> = {
        success: true,
        data: { toolName },
        message: 'Tool removed successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to remove tool',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Clear all tools
   */
  async clearTools(req: Request, res: Response): Promise<void> {
    try {
      toolExecutionService.clearTools()

      const response: ApiResponse = {
        success: true,
        message: 'All tools cleared successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to clear tools',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Simple endpoint: Send user query and get tool executed automatically
   */
  async executeQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query, options } = req.body

      if (!query) {
        const response: ApiResponse = {
          success: false,
          error: 'Query is required',
          message: 'Please provide a natural language query'
        }
        res.status(400).json(response)
        return
      }

      logger.info('Executing query', query)

      // Use the MCP execution method which automatically selects and executes tools
      const result = await toolExecutionService.executeWithMCP(query, {
        ...options,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: result.success
          ? `Query executed successfully using tool: ${result.toolName}`
          : result.needsMoreInfo === true
            ? 'Query incomplete - more information needed'
            : 'Query execution failed'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute query',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  }
}
