// Export the createServer function for programmatic usage
export { createServer, CreateServerOptions } from './createServer';

// Default server instance for direct usage
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { userRoutes } from './routes/userRoutes'
import { healthRoutes } from './routes/healthRoutes'
import { mcpRoutes } from './routes/mcpRoutes'
import { langchainRoutes } from './routes/langchainRoutes'
import { toolExecutionRoutes } from './routes/toolExecutionRoutes'
import { langGraphRoutes } from './routes/langGraphRoutes'
import memoryRoutes from './routes/memoryRoutes'
import memoryChatRoutes from './routes/memoryChatRoutes'
import intentClassifierRoutes from './routes/intentClassifierRoutes'
import agentRoutes from './routes/agentRoutes'
import { errorHandler } from './middleware/errorHandler'
import { setupSwagger } from './config/swagger'
import { initializeAgentService } from './controllers/agentController'
import { ToolRegistry } from '@clear-ai/mcp-basic'
import { MemoryServiceConfig, CoreKeysAndModels, ReasoningEngine, IntentClassifierService, Neo4jMemoryService } from '@clear-ai/shared'
import { initializeEnhancedAgentService } from './controllers/enhanced/enhancedAgentController'

// Load environment variables
dotenv.config({ path: './packages/server/.env' })

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Swagger Documentation
setupSwagger(app)

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/mcp', mcpRoutes)
app.use('/api/langchain', langchainRoutes)
app.use('/api/tools', toolExecutionRoutes)
app.use('/api/langgraph', langGraphRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/memory-chat', memoryChatRoutes)
app.use('/api/intent-classifier', intentClassifierRoutes)
app.use('/api/agent', agentRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Function to check if port is available
const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = require('net').createServer()

    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

// Function to wait for port to be available
const waitForPort = async (port: number, maxRetries = 10, delay = 500): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    if (await checkPort(port)) {
      return
    }
    console.log(`⏳ Waiting for port ${port} to be available... (attempt ${i + 1}/${maxRetries})`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  throw new Error(`Port ${port} is still in use after ${maxRetries} attempts`)
}

// Start server with port availability check
const startServer = async () => {
  try {
    await waitForPort(Number(PORT))
    console.log(`✅ Port ${PORT} is available, starting server...`)
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }

  const server = app.listen(PORT, async () => {
    console.log(process.env.LANGFUSE_BASE_URL)
    console.log(`🚀 Server running on port ${PORT} - Hot reload working perfectly!`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 API URL: http://localhost:${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)

    // Initialize agent service automatically
    try {
      console.log('🤖 Initializing Agent Service...')

      const memoryConfig: MemoryServiceConfig = {
        neo4j: {
          uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
          username: process.env.NEO4J_USERNAME || 'neo4j',
          password: process.env.NEO4J_PASSWORD || 'samplepassword',
          database: process.env.NEO4J_DATABASE || 'neo4j'
        },
        pinecone: {
          apiKey: process.env.PINECONE_API_KEY || '',
          environment: process.env.PINECONE_ENVIRONMENT || 'clear-ai',
          indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
        },
        embedding: {
          model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
          dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768')
        },
        semanticExtraction: {
          enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
          minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
          maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
          enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
          categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
          batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
        }
      };

      // Check if API keys are valid (not test keys)
      const hasValidOpenAI = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('sk-test');
      const hasValidMistral = process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10;
      const hasValidGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10;

      const langchainConfig: CoreKeysAndModels = {
        openaiApiKey: hasValidOpenAI ? (process.env.OPENAI_API_KEY || '') : '',
        openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        mistralApiKey: hasValidMistral ? (process.env.MISTRAL_API_KEY || '') : '',
        mistralModel: process.env.MISTRAL_MODEL || 'mistral-small',
        groqApiKey: hasValidGroq ? (process.env.GROQ_API_KEY || '') : '',
        groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        ollamaModel: process.env.OLLAMA_MODEL || 'mistral:latest',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
      };

      // Log which models are available
      console.log('🔑 API Key Status:');
      console.log(`   OpenAI: ${hasValidOpenAI ? '✅ Valid' : '❌ Invalid/Missing'}`);
      console.log(`   Mistral: ${hasValidMistral ? '✅ Valid' : '❌ Invalid/Missing'}`);
      console.log(`   Groq: ${hasValidGroq ? '✅ Valid' : '❌ Invalid/Missing'}`);
      console.log(`   Ollama: ${process.env.OLLAMA_BASE_URL ? '✅ Available' : '❌ Not configured'}`);

      // Initialize tool registry
      const toolRegistry = new ToolRegistry();

      // Initialize MCP controller with the same tool registry
      const { initializeMcpController } = await import('./controllers/mcpController');
      initializeMcpController(toolRegistry);

      await initializeAgentService(memoryConfig, langchainConfig, toolRegistry);
      await initializeEnhancedAgentService(memoryConfig, langchainConfig, toolRegistry);
      console.log('✅ Agent Service initialized successfully');

      // Initialize Memory Service
      console.log('🧠 Initializing Memory Service...');
      const { initializeMemoryService } = await import('./controllers/memoryController');
      await initializeMemoryService(memoryConfig, langchainConfig);
      console.log('✅ Memory Service initialized successfully');

      // Initialize Semantic Extraction Service
      if (memoryConfig.semanticExtraction.enabled) {
        console.log('🔍 Initializing Semantic Extraction Service...');
        const { MemoryContextService } = await import('@clear-ai/shared');
        const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
        await memoryService.initialize();
        console.log('✅ Semantic Extraction Service initialized successfully');
        console.log(`   📊 Configuration: ${memoryConfig.semanticExtraction.categories.join(', ')} categories`);
        console.log(`   🎯 Min confidence: ${memoryConfig.semanticExtraction.minConfidence}`);
        console.log(`   📦 Batch size: ${memoryConfig.semanticExtraction.batchSize}`);
      } else {
        console.log('⚠️  Semantic Extraction Service disabled in configuration');
      }
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      // Don't exit the server, just log the error
    }
  })

  return server
}

// Start the server
startServer().then((server) => {
  // Graceful shutdown handling for nodemon hot reloading
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)

    server.close((err) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err)
        process.exit(1)
      }

      console.log('✅ Server closed successfully')
      process.exit(0)
    })

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('⏰ Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)
  }

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  // Handle nodemon restart signal
  process.on('SIGUSR2', () => {
    console.log('🔄 Received SIGUSR2, restarting server...')
    gracefulShutdown('SIGUSR2')
  })
}).catch((error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})

export default app
