import { Request, Response } from 'express'
import { ApiResponse } from '@clear-ai/shared'
import { SimpleLangChainService, CoreKeysAndModels } from '@clear-ai/shared'
import dotenv from 'dotenv'

dotenv.config()

const input: CoreKeysAndModels = {
  langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || ''  ,
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
export const simpleLangChainService = new SimpleLangChainService(input)

export const langchainController = {
  /**
   * Get available LangChain models
   */
  async getModels(req: Request, res: Response): Promise<void> {
    console.log('Getting models', input)
    try {
      const models = simpleLangChainService.getAvailableModels()
      const currentModel = simpleLangChainService.getCurrentModel()
      
      const response: ApiResponse<{
        available: string[]
        current: string
        count: number
      }> = {
        success: true,
        data: {
          available: models,
          current: currentModel,
          count: models.length
        },
        message: 'Models retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get models',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Switch to a different model
   */
  async switchModel(req: Request, res: Response): Promise<void> {
    try {
      const { model } = req.body
      
      if (!model) {
        const response: ApiResponse = {
          success: false,
          error: 'Model name is required',
          message: 'Please provide a valid model name'
        }
        res.status(400).json(response)
        return
      }

      simpleLangChainService.switchModel(model)
      const currentModel = simpleLangChainService.getCurrentModel()
      
      const response: ApiResponse<{ current: string }> = {
        success: true,
        data: { current: currentModel },
        message: `Switched to ${model} model`
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to switch model',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Complete a prompt with LangChain and Langfuse tracing
   */
  async complete(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, options } = req.body
      
      if (!prompt) {
        const response: ApiResponse = {
          success: false,
          error: 'Prompt is required',
          message: 'Please provide a prompt for completion'
        }
        res.status(400).json(response)
        return
      }

      const result = await simpleLangChainService.complete(prompt, {
        model: options?.model,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 1000,
        systemMessage: options?.systemMessage,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Completion successful'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Completion failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Chat completion with LangChain and Langfuse tracing
   */
  async chatComplete(req: Request, res: Response): Promise<void> {
    try {
      const { messages, options } = req.body
      
      if (!messages || !Array.isArray(messages)) {
        const response: ApiResponse = {
          success: false,
          error: 'Messages array is required',
          message: 'Please provide an array of chat messages'
        }
        res.status(400).json(response)
        return
      }

      const result = await simpleLangChainService.chatComplete(messages, {
        model: options?.model,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 1000,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Chat completion successful'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Chat completion failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Create and run a chain with a prompt template
   */
  async runChain(req: Request, res: Response): Promise<void> {
    try {
      const { template, input, options } = req.body
      
      if (!template || !input) {
        const response: ApiResponse = {
          success: false,
          error: 'Template and input are required',
          message: 'Please provide a template and input data'
        }
        res.status(400).json(response)
        return
      }

      // For now, use simple completion with template substitution
      const processedPrompt = template.replace(/\{(\w+)\}/g, (match: string, key: string) => {
        return input[key] || match
      })

      const result = await simpleLangChainService.complete(processedPrompt, {
        model: options?.model,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 1000,
        metadata: {
          userId: req.headers['x-user-id'] as string,
          sessionId: req.headers['x-session-id'] as string,
          ...options?.metadata
        }
      })
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Chain execution successful'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Chain execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get traces from Langfuse
   */
  async getTraces(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0, userId } = req.query
      
      const traces = await simpleLangChainService.getTraces({
        limit: Number(limit),
        offset: Number(offset),
        userId: userId as string
      })
      
      const response: ApiResponse<typeof traces> = {
        success: true,
        data: traces,
        message: 'Traces retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get traces',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Get a specific trace by ID
   */
  async getTrace(req: Request, res: Response): Promise<void> {
    try {
      const { traceId } = req.params
      
      if (!traceId) {
        const response: ApiResponse = {
          success: false,
          error: 'Trace ID is required',
          message: 'Please provide a valid trace ID'
        }
        res.status(400).json(response)
        return
      }

      const trace = await simpleLangChainService.getTrace(traceId)
      
      const response: ApiResponse<typeof trace> = {
        success: true,
        data: trace,
        message: 'Trace retrieved successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get trace',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Flush pending traces to Langfuse
   */
  async flushTraces(req: Request, res: Response): Promise<void> {
    try {
      await simpleLangChainService.flush()
      
      const response: ApiResponse = {
        success: true,
        message: 'Traces flushed successfully'
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to flush traces',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  /**
   * Test all available models with a simple prompt
   */
  async testAllModels(req: Request, res: Response): Promise<void> {
    try {
      const { prompt = 'Hello, how are you?' } = req.body

      const testResults = await simpleLangChainService.testAllModels(prompt)

      const response: ApiResponse<typeof testResults> = {
        success: true,
        data: testResults,
        message: `Tested ${testResults.tested.length} models`
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to test models',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  async debugOllama(req: Request, res: Response): Promise<void> {
    try {
      const testUrl = 'http://localhost:11434/api/generate'
      const testPayload = {
        model: 'mistral:latest',
        prompt: 'What is 2+2?',
        stream: false,
      }

      console.log('Testing Ollama directly:', { testUrl, testPayload })

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      })

      const data = await response.json()

      const debugResponse: ApiResponse<any> = {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: testUrl,
          payload: testPayload
        },
        message: 'Ollama debug test completed'
      }
      res.json(debugResponse)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to debug Ollama',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  },

  async debugService(req: Request, res: Response): Promise<void> {
    try {
      // Test the service directly
      const result = await simpleLangChainService.complete('What is 2+2?', {
        metadata: { test: true }
      })

      const debugResponse: ApiResponse<any> = {
        success: true,
        data: result,
        message: 'Service debug test completed'
      }
      res.json(debugResponse)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to debug service',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  }
}
