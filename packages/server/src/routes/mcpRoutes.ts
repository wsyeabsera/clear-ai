import { Router } from 'express';
import { mcpController } from '../controllers/mcpController';

const router = Router();

/**
 * @swagger
 * /api/mcp/execute:
 *   post:
 *     summary: Execute MCP tool
 *     description: Execute a tool with the given name and arguments
 *     tags: [MCP]
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
 *                 example: "api_call"
 *               arguments:
 *                 type: object
 *                 description: Arguments to pass to the tool
 *                 example:
 *                   url: "https://api.example.com/data"
 *                   method: "GET"
 *     responses:
 *       200:
 *         description: Tool executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Result from the tool execution
 *             example:
 *               success: true
 *               data:
 *                 status: 200
 *                 data: "Tool result"
 *               message: "Tool 'api_call' executed successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/execute', mcpController.executeTool);

/**
 * @swagger
 * /api/mcp/tools:
 *   get:
 *     summary: Get available MCP tools
 *     description: Retrieve a list of all available MCP tools
 *     tags: [MCP]
 *     responses:
 *       200:
 *         description: Tools retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "api_call"
 *                           description:
 *                             type: string
 *                             example: "Make HTTP API calls to external services"
 *             example:
 *               success: true
 *               data:
 *                 - name: "api_call"
 *                   description: "Make HTTP API calls to external services"
 *                 - name: "json_reader"
 *                   description: "Parse and read JSON data with optional path extraction"
 *                 - name: "file_reader"
 *                   description: "Read files, list directories, or get file information"
 *               message: "Tools retrieved successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tools', mcpController.getTools);

export { router as mcpRoutes };
