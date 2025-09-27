import { Langfuse } from 'langfuse'
import { ChatOpenAI } from '@langchain/openai'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatGroq } from '@langchain/groq'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'

/**
 * Simple LangChain service that uses native LangChain providers with Langfuse tracing
 */
export class SimpleLangChainService {
  private langfuse: Langfuse
  private models: Map<string, BaseLanguageModel> = new Map()
  private defaultModel: string

  constructor() {
    // Initialize Langfuse
    this.langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY || 'test-secret-key',
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || 'test-public-key',
      baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
    })

    // Initialize models
    this.initializeModels()

    // Set default model
    const availableModels = Array.from(this.models.keys())
    this.defaultModel = availableModels.length > 0 ? availableModels[0] : 'ollama'
  }

  private initializeModels(): void {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      const openai = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        temperature: 0.7,
      })
      this.models.set('openai', openai)
    }

    // Mistral
    if (process.env.MISTRAL_API_KEY) {
      const mistral = new ChatMistralAI({
        apiKey: process.env.MISTRAL_API_KEY,
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
        temperature: 0.7,
      })
      this.models.set('mistral', mistral)
    }

    // Groq
    if (process.env.GROQ_API_KEY) {
      const groq = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        temperature: 0.7,
      })
      this.models.set('groq', groq)
    }

    // Ollama (custom implementation since there's no official LangChain Ollama integration)
    // Always add Ollama as it's our fallback
    const ollama = this.createOllamaModel()
    this.models.set('ollama', ollama)
  }

  private createOllamaModel(): any {
    // Create a simple Ollama model wrapper that works with Langfuse
    return {
      _llmType: 'ollama',
      async invoke(input: any, options?: any) {
        const startTime = Date.now()

        try {
          const url = `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`
          // Convert LangChain messages to a single prompt
          let prompt = ''
          for (const msg of input) {
            if (msg._getType() === 'system') {
              prompt += `System: ${msg.content}\n\n`
            } else if (msg._getType() === 'human') {
              prompt += `Human: ${msg.content}\n\n`
            } else if (msg._getType() === 'ai') {
              prompt += `Assistant: ${msg.content}\n\n`
            }
          }
          prompt += 'Assistant:'
          
          const payload = {
            model: process.env.OLLAMA_MODEL || 'mistral:latest',
            prompt: prompt,
            stream: false,
          }

          console.log('Ollama request:', { url, payload })
          console.log('Environment variables:', {
            OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
            OLLAMA_MODEL: process.env.OLLAMA_MODEL
          })

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          const endTime = Date.now()

          return {
            content: data.response || '',
            additional_kwargs: {},
            usage: {
              prompt_tokens: 0, // Ollama doesn't provide token usage
              completion_tokens: 0,
              total_tokens: 0,
            },
            response_metadata: {
              model: process.env.OLLAMA_MODEL || 'mistral:latest',
              duration: endTime - startTime,
              ollama_response: data
            }
          }
        } catch (error) {
          const endTime = Date.now()
          throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },
    }
  }

  /**
   * Get available model names
   */
  getAvailableModels(): string[] {
    return Array.from(this.models.keys())
  }

  /**
   * Get a specific model
   */
  getModel(modelName: string): BaseLanguageModel | null {
    return this.models.get(modelName) || null
  }

  /**
   * Set default model
   */
  setDefaultModel(modelName: string): void {
    if (this.models.has(modelName)) {
      this.defaultModel = modelName
    } else {
      throw new Error(`Model ${modelName} not found`)
    }
  }

  /**
   * Get current default model
   */
  getCurrentModel(): string {
    return this.defaultModel
  }

  /**
   * Switch to a different model
   */
  switchModel(modelName: string): void {
    this.setDefaultModel(modelName)
  }

  /**
   * Complete a prompt with tracing
   */
  async complete(
    prompt: string,
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
      systemMessage?: string
      metadata?: Record<string, any>
    }
  ): Promise<{
    content: string
    model: string
    usage?: any
    traceId?: string
  }> {
    const modelName = options?.model || this.defaultModel
    const model = this.getModel(modelName)

    if (!model) {
      throw new Error(`Model ${modelName} not found`)
    }

    // Create messages
    const messages: BaseMessage[] = []
    if (options?.systemMessage) {
      messages.push(new SystemMessage(options.systemMessage))
    }
    messages.push(new HumanMessage(prompt))

    // Create trace
    const trace = this.langfuse.trace({
      name: 'llm-completion',
      input: { prompt, options },
      metadata: {
        ...options?.metadata,
        timestamp: new Date().toISOString(),
        service: 'SimpleLangChainService'
      },
    })

    try {
      // Generate response
      const result = await model.invoke(messages)

      // Log to Langfuse
      trace.generation({
        name: 'llm-generation',
        input: messages,
        output: result,
        model: modelName,
        usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        metadata: {
          model: modelName,
          duration: result.response_metadata?.duration || 0,
        }
      })

      await trace.update({
        output: {
          content: result.content,
          model: modelName,
          usage: result.usage
        },
        metadata: {
          model: modelName,
          success: true,
          timestamp: new Date().toISOString()
        },
      })

      // Flush to ensure data is sent
      await this.langfuse.flush()

      return {
        content: result.content,
        model: modelName,
        usage: result.usage,
        traceId: trace.id,
      }
    } catch (error) {
      // Log error to Langfuse
      await trace.update({
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        metadata: {
          model: modelName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
      })

      // Flush error data
      await this.langfuse.flush()
      throw error
    }
  }

  /**
   * Chat completion with tracing
   */
  async chatComplete(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
      metadata?: Record<string, any>
    }
  ): Promise<{
    content: string
    model: string
    usage?: any
    traceId?: string
  }> {
    const modelName = options?.model || this.defaultModel
    const model = this.getModel(modelName)

    if (!model) {
      throw new Error(`Model ${modelName} not found`)
    }

    // Convert messages to LangChain format
    const langchainMessages: BaseMessage[] = messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content)
        case 'user':
          return new HumanMessage(msg.content)
        case 'assistant':
          return new AIMessage(msg.content)
        default:
          return new HumanMessage(msg.content)
      }
    })

    // Create trace
    const trace = this.langfuse.trace({
      name: 'llm-chat-completion',
      input: { messages, options },
      metadata: {
        ...options?.metadata,
        timestamp: new Date().toISOString(),
        service: 'SimpleLangChainService'
      },
    })

    try {
      // Generate response
      const result = await model.invoke(langchainMessages)

      // Log to Langfuse
      trace.generation({
        name: 'llm-chat-generation',
        input: langchainMessages,
        output: result,
        model: modelName,
        usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        metadata: {
          model: modelName,
          duration: result.response_metadata?.duration || 0,
        }
      })

      await trace.update({
        output: {
          content: result.content,
          model: modelName,
          usage: result.usage
        },
        metadata: {
          model: modelName,
          success: true,
          timestamp: new Date().toISOString()
        },
      })

      // Flush to ensure data is sent
      await this.langfuse.flush()

      return {
        content: result.content,
        model: modelName,
        usage: result.usage,
        traceId: trace.id,
      }
    } catch (error) {
      // Log error to Langfuse
      await trace.update({
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        metadata: {
          model: modelName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
      })

      // Flush error data
      await this.langfuse.flush()
      throw error
    }
  }

  /**
   * Test all available models
   */
  async testAllModels(prompt: string = 'Hello, how are you?'): Promise<{
    results: Record<string, any>
    errors: Record<string, string>
    tested: string[]
    successful: string[]
    failed: string[]
  }> {
    const results: Record<string, any> = {}
    const errors: Record<string, string> = {}
    const availableModels = this.getAvailableModels()

    for (const modelName of availableModels) {
      try {
        const result = await this.complete(prompt, {
          model: modelName,
          metadata: { test: true }
        })
        results[modelName] = {
          success: true,
          content: result.content,
          model: result.model,
          traceId: result.traceId
        }
      } catch (error) {
        errors[modelName] = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return {
      results,
      errors,
      tested: availableModels,
      successful: Object.keys(results),
      failed: Object.keys(errors)
    }
  }

  /**
   * Get traces from Langfuse (placeholder)
   */
  async getTraces(options?: {
    limit?: number
    offset?: number
    userId?: string
  }) {
    // Note: Langfuse client methods may vary by version
    // This is a placeholder implementation
    return { traces: [], total: 0 }
  }

  /**
   * Get a specific trace (placeholder)
   */
  async getTrace(traceId: string) {
    // Note: Langfuse client methods may vary by version
    // This is a placeholder implementation
    return { id: traceId, name: 'trace', input: {}, output: {} }
  }

  /**
   * Flush pending traces
   */
  async flush() {
    return this.langfuse.flush()
  }
}

// Export singleton instance
export const simpleLangChainService = new SimpleLangChainService()