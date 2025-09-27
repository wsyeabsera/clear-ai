import { Langfuse } from 'langfuse'
import { ChatOpenAI } from '@langchain/openai'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatGroq } from '@langchain/groq'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { ChatOllama } from '@langchain/ollama'
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'

export interface CoreKeysAndModels {
  langfuseSecretKey: string
  langfusePublicKey: string
  langfuseBaseUrl: string
  openaiApiKey: string
  openaiModel: string
  mistralApiKey: string
  mistralModel: string
  groqApiKey: string
  groqModel: string
  ollamaBaseUrl: string
  ollamaModel: string
}


/**
 * Simple LangChain service that uses native LangChain providers with Langfuse tracing
 */
export class SimpleLangChainService {
  private langfuse: Langfuse
  private models: Map<string, BaseLanguageModel> = new Map()
  private defaultModel: string

  constructor(input: CoreKeysAndModels) {
    // Initialize Langfuse
    this.langfuse = new Langfuse({
      secretKey: input.langfuseSecretKey,
      publicKey: input.langfusePublicKey,
      baseUrl: input.langfuseBaseUrl,
    })

    // Initialize models
    this.initializeModels(input)

    // Set default model - prioritize local Mistral via Ollama
    const availableModels = Array.from(this.models.keys())
    if (availableModels.includes('mistral-ollama')) {
      this.defaultModel = 'mistral-ollama'
    } else if (availableModels.includes('ollama')) {
      this.defaultModel = 'ollama'
    } else if (availableModels.length > 0) {
      this.defaultModel = availableModels[0]
    } else {
      this.defaultModel = 'mistral-ollama' // fallback
    }
  }

  private initializeModels(input: CoreKeysAndModels): void {
    console.log('Initializing models...')
    console.log('Input:', input)

    // OpenAI
    if (input.openaiApiKey && process.env.OPENAI_API_KEY) {
      const openai = new ChatOpenAI({
        apiKey: input.openaiApiKey,
        model: input.openaiModel,
        temperature: 0.7,
      })
      this.models.set('openai', openai)
    }

    // Mistral (Cloud API)
    if (input.mistralApiKey) {
      const mistral = new ChatMistralAI({
        apiKey: input.mistralApiKey,
        model: input.mistralModel,
        temperature: 0.7,
      })
      this.models.set('mistral', mistral)
    }

    // Mistral via Ollama (Local)
    if (input.ollamaBaseUrl) {
      const mistralOllama = new ChatOllama({
        baseUrl: input.ollamaBaseUrl,
        model: input.ollamaModel || 'mistral:latest',
        temperature: 0.7,
      })
      this.models.set('mistral-ollama', mistralOllama)
    }
    if (input.ollamaBaseUrl) {
      // Also add generic ollama model
      const ollama = new ChatOllama({
        baseUrl: input.ollamaBaseUrl,
        model: input.ollamaModel || 'mistral:latest',
        temperature: 0.7,
      })
      this.models.set('ollama', ollama)
    }

    // Groq
    if (input.groqApiKey) {
      const groq = new ChatGroq({
        apiKey: input.groqApiKey,
        model: input.groqModel,
        temperature: 0.7,
      })
      this.models.set('groq', groq)
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