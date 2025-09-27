import { Router } from 'express'
import { ApiResponse } from '@clear-ai/shared'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               success: true
 *               data:
 *                 status: "healthy"
 *                 timestamp: "2023-01-01T00:00:00.000Z"
 *                 uptime: 123.45
 *               message: "Server is running"
 */
router.get('/', (req, res) => {
  const response: ApiResponse<{ status: string; timestamp: string; uptime: number }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'Server is running',
  }
  
  res.json(response)
})

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check endpoint
 *     description: Returns detailed health information including memory usage and system info
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         uptime:
 *                           type: number
 *                         memory:
 *                           type: object
 *                         version:
 *                           type: string
 *                         environment:
 *                           type: string
 *             example:
 *               success: true
 *               data:
 *                 status: "healthy"
 *                 timestamp: "2023-01-01T00:00:00.000Z"
 *                 uptime: 123.45
 *                 memory: {}
 *                 version: "v18.0.0"
 *                 environment: "development"
 *               message: "Detailed health check completed"
 */
router.get('/detailed', (req, res) => {
  const response: ApiResponse<{
    status: string
    timestamp: string
    uptime: number
    memory: NodeJS.MemoryUsage
    version: string
    environment: string
  }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
    message: 'Detailed health check completed',
  }
  
  res.json(response)
})

export { router as healthRoutes }
