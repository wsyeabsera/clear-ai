import { Router } from 'express';
import { intentClassifierController } from '../controllers/intentClassifierController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     QueryIntent:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [memory_chat, tool_execution, hybrid, knowledge_search, conversation]
 *           description: The classified intent type
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Confidence score for the classification
 *         requiredTools:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tools that might be required
 *         memoryContext:
 *           type: boolean
 *           description: Whether memory context is needed
 *         parameters:
 *           type: object
 *           description: Extracted parameters for tool execution
 *         reasoning:
 *           type: string
 *           description: Explanation of the classification decision
 *     
 *     ClassificationRequest:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           example: "Calculate 5 + 3"
 *           description: The user query to classify
 *         options:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *               example: "openai"
 *               description: LLM model to use for classification
 *             temperature:
 *               type: number
 *               example: 0.1
 *               description: Temperature for LLM generation
 *             includeAvailableTools:
 *               type: boolean
 *               example: true
 *               description: Whether to include available tools in context
 *             userContext:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 previousIntents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QueryIntent'
 *     
 *     BatchClassificationRequest:
 *       type: object
 *       required:
 *         - queries
 *       properties:
 *         queries:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Calculate 5 + 3", "What did we discuss yesterday?"]
 *         options:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *             temperature:
 *               type: number
 *             includeAvailableTools:
 *               type: boolean
 *             userContext:
 *               type: object
 */

/**
 * @swagger
 * /api/intent-classifier/initialize:
 *   post:
 *     summary: Initialize intent classifier service
 *     description: Initialize the intent classifier with LangChain and ToolRegistry
 *     tags: [Intent Classification]
 *     responses:
 *       200:
 *         description: Intent classifier initialized successfully
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
 *                         initialized:
 *                           type: boolean
 *                         availableIntentTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                         intentTypeDescriptions:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
router.post('/initialize', intentClassifierController.initializeService);

/**
 * @swagger
 * /api/intent-classifier/classify:
 *   post:
 *     summary: Classify a single query
 *     description: Classify a user query to determine the appropriate execution intent
 *     tags: [Intent Classification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassificationRequest'
 *     responses:
 *       200:
 *         description: Query classified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QueryIntent'
 *       400:
 *         description: Bad request - missing or invalid query
 *       500:
 *         description: Internal server error
 *     example:
 *       request:
 *         query: "Calculate 5 + 3"
 *         options:
 *           model: "openai"
 *           temperature: 0.1
 *           includeAvailableTools: true
 *       response:
 *         success: true
 *         data:
 *           type: "tool_execution"
 *           confidence: 0.95
 *           requiredTools: ["calculator"]
 *           memoryContext: false
 *           reasoning: "User is asking for a mathematical calculation"
 */
router.post('/classify', intentClassifierController.classifyQuery);

/**
 * @swagger
 * /api/intent-classifier/classify-batch:
 *   post:
 *     summary: Classify multiple queries in batch
 *     description: Classify multiple user queries in parallel for efficiency
 *     tags: [Intent Classification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchClassificationRequest'
 *     responses:
 *       200:
 *         description: Queries classified successfully
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
 *                         classifications:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               query:
 *                                 type: string
 *                               intent:
 *                                 $ref: '#/components/schemas/QueryIntent'
 *                               success:
 *                                 type: boolean
 *                         totalQueries:
 *                           type: integer
 *                         successfulClassifications:
 *                           type: integer
 *                         failedClassifications:
 *                           type: integer
 *       400:
 *         description: Bad request - missing or invalid queries
 *       500:
 *         description: Internal server error
 */
router.post('/classify-batch', intentClassifierController.classifyQueriesBatch);

/**
 * @swagger
 * /api/intent-classifier/test:
 *   post:
 *     summary: Test intent classification with sample queries
 *     description: Run a comprehensive test with predefined sample queries for each intent type
 *     tags: [Intent Classification]
 *     responses:
 *       200:
 *         description: Test completed successfully
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
 *                         testResults:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               query:
 *                                 type: string
 *                               expectedType:
 *                                 type: string
 *                               actualType:
 *                                 type: string
 *                               confidence:
 *                                 type: number
 *                               correct:
 *                                 type: boolean
 *                               reasoning:
 *                                 type: string
 *                               requiredTools:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               memoryContext:
 *                                 type: boolean
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalTests:
 *                               type: integer
 *                             correctClassifications:
 *                               type: integer
 *                             accuracy:
 *                               type: number
 *                             averageConfidence:
 *                               type: number
 *       500:
 *         description: Internal server error
 */
router.post('/test', intentClassifierController.testClassification);

/**
 * @swagger
 * /api/intent-classifier/intent-types:
 *   get:
 *     summary: Get available intent types and descriptions
 *     description: Retrieve all available intent types with their descriptions
 *     tags: [Intent Classification]
 *     responses:
 *       200:
 *         description: Intent types retrieved successfully
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
 *                         intentTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                         descriptions:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
router.get('/intent-types', intentClassifierController.getIntentTypes);

export default router;
