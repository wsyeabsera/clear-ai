import { Request, Response } from 'express'
import { ApiResponse } from '@clear-ai/shared'
import {
  SimpleWorkflowService,
  WorkflowExecutionResult,
  ToolExecutionService,
  CoreKeysAndModels
} from '@clear-ai/shared'
import dotenv from 'dotenv'
import { ToolRegistry } from '@clear-ai/mcp-basic'
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

// Export singleton instances
export const toolExecutionService = new ToolExecutionService(input)
export const workflowService = new SimpleWorkflowService(input, toolExecutionService)

// Register sample tools
async function initializeTools() {
  try {
    const toolRegistry = new ToolRegistry()
    const tools = toolRegistry.getAllTools()

    // Convert MCP tools to ToolDefinition format
    const toolDefinitions = tools.map(tool => ({
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
    console.log(`Registered ${toolDefinitions.length} tools for workflow service`)
  } catch (error) {
    console.error('Failed to initialize tools for LangGraph:', error)
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

export const langGraphController = {
  /**
   * Execute a workflow using LangGraph
   */
  async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { query, options }: {
        query: string
        options?: {
          model?: string
          temperature?: number
          metadata?: Record<string, any>
        }
      } = req.body

      if (!query) {
        const response: ApiResponse = {
          success: false,
          message: 'Query is required'
        }
        res.status(400).json(response)
        return
      }

      logger.info(`Executing workflow for query: ${query}`)

      const result = await workflowService.executeWorkflow(query, options)

      const response: ApiResponse<WorkflowExecutionResult> = {
        success: result.success,
        data: result,
        message: result.success ? 'Workflow executed successfully' : 'Workflow execution failed'
      }

      if (!result.success) {
        res.status(400).json(response)
      } else {
        res.json(response)
      }
    } catch (error) {
      logger.error('Error executing LangGraph workflow:', error)
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get workflow statistics and available tools
   */
  async getWorkflowStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = workflowService.getWorkflowStats()

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: 'Workflow statistics retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      logger.error('Error getting workflow stats:', error)
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Test a simple API call workflow
   */
  async testApiCallWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { url }: { url?: string } = req.body

      const testUrl = url || 'https://jsonplaceholder.typicode.com/users/1'
      const query = `Make an API call to ${testUrl}`

      logger.info(`Testing API call workflow with URL: ${testUrl}`)

      const result = await workflowService.executeWorkflow(query, {
        model: 'ollama',
        temperature: 0.1
      })

      const response: ApiResponse<WorkflowExecutionResult> = {
        success: result.success,
        data: result,
        message: result.success ? 'API call workflow test completed' : 'API call workflow test failed'
      }

      res.json(response)
    } catch (error) {
      logger.error('Error testing API call workflow:', error)
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Test a multi-step workflow
   */
  async testMultiStepWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const query = `First, make an API call to https://jsonplaceholder.typicode.com/users/1 to get user data, then make another API call to https://jsonplaceholder.typicode.com/posts?userId=1 to get their posts`

      logger.info('Testing multi-step workflow')

      const result = await workflowService.executeWorkflow(query, {
        model: 'ollama',
        temperature: 0.1
      })

      const response: ApiResponse<WorkflowExecutionResult> = {
        success: result.success,
        data: result,
        message: result.success ? 'Multi-step workflow test completed' : 'Multi-step workflow test failed'
      }

      res.json(response)
    } catch (error) {
      logger.error('Error testing multi-step workflow:', error)
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Test parallel execution workflow
   */
  async testParallelWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const query = `Execute two API calls in parallel: one to https://jsonplaceholder.typicode.com/users/1 and another to https://jsonplaceholder.typicode.com/users/2`

      logger.info('Testing parallel workflow')

      const result = await workflowService.executeWorkflow(query, {
        model: 'ollama',
        temperature: 0.1
      })

      const response: ApiResponse<WorkflowExecutionResult> = {
        success: result.success,
        data: result,
        message: result.success ? 'Parallel workflow test completed' : 'Parallel workflow test failed'
      }

      res.json(response)
    } catch (error) {
      logger.error('Error testing parallel workflow:', error)
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  }
}
