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

/**
 * @swagger
 * /api/mcp/schemas:
 *   get:
 *     summary: Get all MCP tool schemas
 *     description: Retrieve input and output schemas for all available MCP tools
 *     tags: [MCP]
 *     responses:
 *       200:
 *         description: Tool schemas retrieved successfully
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
 *                           inputSchema:
 *                             type: object
 *                             description: JSON Schema for input parameters
 *                           outputSchema:
 *                             type: object
 *                             description: JSON Schema for output format
 *             example:
 *               success: true
 *               data:
 *                 - name: "api_call"
 *                   description: "Make HTTP API calls to external services"
 *                   inputSchema: { ... }
 *                   outputSchema: { ... }
 *               message: "Tool schemas retrieved successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/schemas', mcpController.getToolSchemas);

/**
 * @swagger
 * /api/mcp/schemas/{toolName}:
 *   get:
 *     summary: Get specific MCP tool schema
 *     description: Retrieve input and output schema for a specific MCP tool
 *     tags: [MCP]
 *     parameters:
 *       - in: path
 *         name: toolName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tool
 *         example: "api_call"
 *     responses:
 *       200:
 *         description: Tool schema retrieved successfully
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
 *                         name:
 *                           type: string
 *                           example: "api_call"
 *                         description:
 *                           type: string
 *                           example: "Make HTTP API calls to external services"
 *                         inputSchema:
 *                           type: object
 *                           description: JSON Schema for input parameters
 *                         outputSchema:
 *                           type: object
 *                           description: JSON Schema for output format
 *             example:
 *               success: true
 *               data:
 *                 name: "api_call"
 *                 description: "Make HTTP API calls to external services"
 *                 inputSchema: { ... }
 *                 outputSchema: { ... }
 *               message: "Schema for tool 'api_call' retrieved successfully"
 *       404:
 *         description: Tool not found
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
router.get('/schemas/:toolName', mcpController.getToolSchema);

export { router as mcpRoutes };
