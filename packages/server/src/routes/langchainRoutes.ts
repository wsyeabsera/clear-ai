import { Router } from 'express'
import { langchainController } from '../controllers/langchainController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     LangChainCompletionOptions:
 *       type: object
 *       properties:
 *         model:
 *           type: string
 *           description: Model name to use
 *         temperature:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Controls randomness in the response
 *         maxTokens:
 *           type: number
 *           description: Maximum number of tokens to generate
 *         systemMessage:
 *           type: string
 *           description: System message to set context
 *         metadata:
 *           type: object
 *           description: Additional metadata for tracing
 *     
 *     LangChainResponse:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: Generated content
 *         model:
 *           type: string
 *           description: Model used for generation
 *         usage:
 *           type: object
 *           description: Token usage information
 *         traceId:
 *           type: string
 *           description: Langfuse trace ID for observability
 *     
 *     ChainInput:
 *       type: object
 *       properties:
 *         template:
 *           type: string
 *           description: Prompt template with variables
 *         input:
 *           type: object
 *           description: Input data for the template
 *         options:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *             temperature:
 *               type: number
 *             maxTokens:
 *               type: number
 *             metadata:
 *               type: object
 */

/**
 * @swagger
 * /api/langchain/models:
 *   get:
 *     summary: Get available LangChain models
 *     tags: [LangChain]
 *     responses:
 *       200:
 *         description: List of available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: array
 *                       items:
 *                         type: string
 *                     current:
 *                       type: string
 *                     count:
 *                       type: number
 *                 message:
 *                   type: string
 */
router.get('/models', langchainController.getModels)

/**
 * @swagger
 * /api/langchain/switch-model:
 *   post:
 *     summary: Switch to a different LangChain model
 *     tags: [LangChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *             properties:
 *               model:
 *                 type: string
 *                 description: Name of the model to switch to
 *     responses:
 *       200:
 *         description: Successfully switched model
 *       400:
 *         description: Invalid model name
 *       500:
 *         description: Server error
 */
router.post('/switch-model', langchainController.switchModel)

/**
 * @swagger
 * /api/langchain/complete:
 *   post:
 *     summary: Complete a prompt with LangChain and Langfuse tracing
 *     tags: [LangChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to complete
 *               options:
 *                 $ref: '#/components/schemas/LangChainCompletionOptions'
 *     responses:
 *       200:
 *         description: Completion successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LangChainResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/complete', langchainController.complete)

/**
 * @swagger
 * /api/langchain/chat:
 *   post:
 *     summary: Chat completion with LangChain and Langfuse tracing
 *     tags: [LangChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user, assistant]
 *                     content:
 *                       type: string
 *               options:
 *                 $ref: '#/components/schemas/LangChainCompletionOptions'
 *     responses:
 *       200:
 *         description: Chat completion successful
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/chat', langchainController.chatComplete)

/**
 * @swagger
 * /api/langchain/chain:
 *   post:
 *     summary: Create and run a chain with a prompt template
 *     tags: [LangChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *               - input
 *             properties:
 *               template:
 *                 type: string
 *                 description: Prompt template with {variable} placeholders
 *               input:
 *                 type: object
 *                 description: Input data for the template
 *               options:
 *                 $ref: '#/components/schemas/LangChainCompletionOptions'
 *     responses:
 *       200:
 *         description: Chain execution successful
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/chain', langchainController.runChain)

/**
 * @swagger
 * /api/langchain/traces:
 *   get:
 *     summary: Get traces from Langfuse
 *     tags: [LangChain]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of traces to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of traces to skip
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Traces retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/traces', langchainController.getTraces)

/**
 * @swagger
 * /api/langchain/traces/{traceId}:
 *   get:
 *     summary: Get a specific trace by ID
 *     tags: [LangChain]
 *     parameters:
 *       - in: path
 *         name: traceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trace ID
 *     responses:
 *       200:
 *         description: Trace retrieved successfully
 *       400:
 *         description: Invalid trace ID
 *       500:
 *         description: Server error
 */
router.get('/traces/:traceId', langchainController.getTrace)

/**
 * @swagger
 * /api/langchain/flush:
 *   post:
 *     summary: Flush pending traces to Langfuse
 *     tags: [LangChain]
 *     responses:
 *       200:
 *         description: Traces flushed successfully
 *       500:
 *         description: Server error
 */
router.post('/flush', langchainController.flushTraces)

/**
 * @swagger
 * /api/langchain/test-all:
 *   post:
 *     summary: Test all available models with a simple prompt
 *     tags: [LangChain]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to test with all models
 *                 default: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Test results for all models
 *       500:
 *         description: Server error
 */
router.post('/test-all', langchainController.testAllModels)

export { router as langchainRoutes }
