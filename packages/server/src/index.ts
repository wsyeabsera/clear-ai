import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { userRoutes } from './routes/userRoutes'
import { healthRoutes } from './routes/healthRoutes'
import { mcpRoutes } from './routes/mcpRoutes'
import { errorHandler } from './middleware/errorHandler'
import { setupSwagger } from './config/swagger'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 API URL: http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
})

export default app
