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
import { errorHandler } from './middleware/errorHandler'
import { setupSwagger } from './config/swagger'

// Load environment variables
dotenv.config({ path: './.env' })

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

  const server = app.listen(PORT, () => {
    console.log(process.env.LANGFUSE_BASE_URL)
    console.log(`🚀 Server running on port ${PORT} - Hot reload working perfectly!`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 API URL: http://localhost:${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
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
