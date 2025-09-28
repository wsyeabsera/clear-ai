import { Router } from 'express'
import { langGraphController } from '../controllers/langGraphController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowExecutionResult:
 *       type: object
 *       required:
 *         - success
 *         - allResults
 *         - executionOrder
 *         - errors
 *         - executionTime
 *         - messages
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the workflow execution was successful
 *         finalResult:
 *           description: The final result of the workflow
 *         allResults:
 *           type: object
 *           description: Results from all executed steps
 *         executionOrder:
 *           type: array
 *           items:
 *             type: string
 *           description: Order in which steps were executed
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *         executionTime:
 *           type: number
 *           description: Total execution time in milliseconds
 *         traceId:
 *           type: string
 *           description: Langfuse trace ID
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *           description: Conversation messages from the workflow
 */

/**
 * @swagger
 * /api/langgraph/execute:
 *   post:
 *     summary: Execute a workflow using LangGraph
 *     tags: [LangGraph Workflows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language query describing the workflow
 *                 example: "Make an API call to https://jsonplaceholder.typicode.com/users/1"
 *               options:
 *                 type: object
 *                 properties:
 *                   model:
 *                     type: string
 *                     description: LLM model to use
 *                     example: ollama
 *                   temperature:
 *                     type: number
 *                     description: Temperature for LLM generation
 *                   metadata:
 *                     type: object
 *                     description: Additional metadata
 *     responses:
 *       200:
 *         description: Workflow executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request or workflow failed
 *       500:
 *         description: Internal server error
 */
router.post('/execute', langGraphController.executeWorkflow)

/**
 * @swagger
 * /api/langgraph/stats:
 *   get:
 *     summary: Get workflow statistics and available tools
 *     tags: [LangGraph Workflows]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', langGraphController.getWorkflowStats)

/**
 * @swagger
 * /api/langgraph/test/api-call:
 *   post:
 *     summary: Test a simple API call workflow
 *     tags: [LangGraph Workflows]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL to test (defaults to JSONPlaceholder users/1)
 *                 example: "https://jsonplaceholder.typicode.com/users/1"
 *     responses:
 *       200:
 *         description: API call workflow test completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/test/api-call', langGraphController.testApiCallWorkflow)

/**
 * @swagger
 * /api/langgraph/test/multi-step:
 *   post:
 *     summary: Test a multi-step workflow
 *     tags: [LangGraph Workflows]
 *     responses:
 *       200:
 *         description: Multi-step workflow test completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/test/multi-step', langGraphController.testMultiStepWorkflow)

/**
 * @swagger
 * /api/langgraph/test/parallel:
 *   post:
 *     summary: Test a parallel execution workflow
 *     tags: [LangGraph Workflows]
 *     responses:
 *       200:
 *         description: Parallel workflow test completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/test/parallel', langGraphController.testParallelWorkflow)

export { router as langGraphRoutes }
