import { Router } from 'express'
import { toolExecutionController } from '../controllers/toolExecutionController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     ToolDefinition:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - parameters
 *         - execute
 *       properties:
 *         name:
 *           type: string
 *           description: Unique name of the tool
 *         description:
 *           type: string
 *           description: Description of what the tool does
 *         parameters:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [object]
 *             properties:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   description:
 *                     type: string
 *                   enum:
 *                     type: array
 *                     items:
 *                       type: string
 *                   required:
 *                     type: boolean
 *             required:
 *               type: array
 *               items:
 *                 type: string
 *         execute:
 *           type: object
 *           description: Function to execute the tool
 *     
 *     ToolExecutionResult:
 *       type: object
 *       required:
 *         - success
 *         - toolName
 *         - executionTime
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the tool execution was successful
 *         result:
 *           type: object
 *           description: The result of the tool execution
 *         error:
 *           type: string
 *           description: Error message if execution failed
 *         toolName:
 *           type: string
 *           description: Name of the executed tool
 *         executionTime:
 *           type: number
 *           description: Execution time in milliseconds
 *         traceId:
 *           type: string
 *           description: Langfuse trace ID
 *     
 *     ToolExecutionOptions:
 *       type: object
 *       properties:
 *         model:
 *           type: string
 *           description: LLM model to use
 *         temperature:
 *           type: number
 *           description: Temperature for LLM generation
 *         maxTokens:
 *           type: number
 *           description: Maximum tokens for LLM generation
 *         systemMessage:
 *           type: string
 *           description: System message for LLM
 *         metadata:
 *           type: object
 *           description: Additional metadata
 *         timeout:
 *           type: number
 *           description: Execution timeout in milliseconds
 */

/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Get all registered tools
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Tools retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', toolExecutionController.getTools)

/**
 * @swagger
 * /api/tools/stats:
 *   get:
 *     summary: Get tool execution statistics
 *     tags: [Tools]
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
router.get('/stats', toolExecutionController.getStats)

/**
 * @swagger
 * /api/tools/definitions:
 *   get:
 *     summary: Get tool definitions for LLM function calling
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Tool definitions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/definitions', toolExecutionController.getToolDefinitionsForLLM)

/**
 * @swagger
 * /api/tools/{toolName}:
 *   get:
 *     summary: Get a specific tool by name
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: toolName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tool
 *     responses:
 *       200:
 *         description: Tool retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tool not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Remove a tool
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: toolName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tool to remove
 *     responses:
 *       200:
 *         description: Tool removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tool not found
 *       500:
 *         description: Internal server error
 */
router.get('/:toolName', toolExecutionController.getTool)
router.delete('/:toolName', toolExecutionController.removeTool)

/**
 * @swagger
 * /api/tools/register:
 *   post:
 *     summary: Register a new tool
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToolDefinition'
 *     responses:
 *       200:
 *         description: Tool registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid tool definition
 *       500:
 *         description: Internal server error
 */
router.post('/register', toolExecutionController.registerTool)

/**
 * @swagger
 * /api/tools/execute:
 *   post:
 *     summary: Execute a tool
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolName
 *             properties:
 *               toolName:
 *                 type: string
 *                 description: Name of the tool to execute
 *               args:
 *                 type: object
 *                 description: Arguments for the tool
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: Tool executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/execute', toolExecutionController.executeTool)

/**
 * @swagger
 * /api/tools/execute-multiple:
 *   post:
 *     summary: Execute multiple tools in parallel
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolExecutions
 *             properties:
 *               toolExecutions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - toolName
 *                   properties:
 *                     toolName:
 *                       type: string
 *                     args:
 *                       type: object
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: Tools executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/execute-multiple', toolExecutionController.executeTools)

/**
 * @swagger
 * /api/tools/execute-sequential:
 *   post:
 *     summary: Execute multiple tools sequentially
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolExecutions
 *             properties:
 *               toolExecutions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - toolName
 *                   properties:
 *                     toolName:
 *                       type: string
 *                     args:
 *                       type: object
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: Tools executed sequentially
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/execute-sequential', toolExecutionController.executeToolsSequential)

/**
 * @swagger
 * /api/tools/execute-with-llm:
 *   post:
 *     summary: Execute a tool using LLM to determine parameters
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolName
 *               - userQuery
 *             properties:
 *               toolName:
 *                 type: string
 *                 description: Name of the tool to execute
 *               userQuery:
 *                 type: string
 *                 description: Natural language query to extract parameters from
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: Tool executed with LLM successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/execute-with-llm', toolExecutionController.executeToolWithLLM)

/**
 * @swagger
 * /api/tools/mcp:
 *   post:
 *     summary: Execute tool using MCP-style natural language query
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userQuery
 *             properties:
 *               userQuery:
 *                 type: string
 *                 description: Natural language query describing what you want to do
 *                 example: "What is 15 multiplied by 8?"
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: MCP execution completed
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
 *                     success:
 *                       type: boolean
 *                     result:
 *                       type: object
 *                       description: Tool execution result (if successful)
 *                     error:
 *                       type: string
 *                       description: Error message (if failed)
 *                     toolName:
 *                       type: string
 *                       description: Name of the selected tool
 *                     reasoning:
 *                       type: string
 *                       description: Why this tool was chosen
 *                     needsMoreInfo:
 *                       type: boolean
 *                       description: Whether more information is needed
 *                     missingInfo:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of missing parameters (if incomplete)
 *                     followUpQuestion:
 *                       type: string
 *                       description: Question to ask for missing information (if incomplete)
 *                     executionTime:
 *                       type: number
 *                       description: Execution time in milliseconds
 *                     traceId:
 *                       type: string
 *                       description: Langfuse trace ID
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/mcp', toolExecutionController.executeWithMCP)

/**
 * @swagger
 * /api/tools/clear:
 *   post:
 *     summary: Clear all registered tools
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: All tools cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/clear', toolExecutionController.clearTools)

/**
 * @swagger
 * /api/tools/execute-query:
 *   post:
 *     summary: Execute a natural language query with automatic tool selection
 *     tags: [Tools]
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
 *                 description: Natural language query describing what you want to do
 *                 example: "Make an API call to https://api.github.com/users/octocat"
 *               options:
 *                 $ref: '#/components/schemas/ToolExecutionOptions'
 *     responses:
 *       200:
 *         description: Query executed successfully
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
 *                     success:
 *                       type: boolean
 *                     result:
 *                       type: object
 *                       description: Tool execution result (if successful)
 *                     error:
 *                       type: string
 *                       description: Error message (if failed)
 *                     toolName:
 *                       type: string
 *                       description: Name of the selected tool
 *                     reasoning:
 *                       type: string
 *                       description: Why this tool was chosen
 *                     needsMoreInfo:
 *                       type: boolean
 *                       description: Whether more information is needed
 *                     missingInfo:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of missing parameters (if incomplete)
 *                     followUpQuestion:
 *                       type: string
 *                       description: Question to ask for missing information (if incomplete)
 *                     executionTime:
 *                       type: number
 *                       description: Execution time in milliseconds
 *                     traceId:
 *                       type: string
 *                       description: Langfuse trace ID
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/execute-query', toolExecutionController.executeQuery)

export { router as toolExecutionRoutes }
