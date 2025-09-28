import { Router } from 'express';
import { memoryChatController } from '../controllers/memoryChatController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       required:
 *         - userId
 *         - sessionId
 *         - message
 *       properties:
 *         userId:
 *           type: string
 *           example: "user123"
 *         sessionId:
 *           type: string
 *           example: "session456"
 *         message:
 *           type: string
 *           example: "Tell me about machine learning"
 *         includeMemories:
 *           type: boolean
 *           default: true
 *     
 *     ChatResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         context:
 *           type: string
 *         memories:
 *           type: object
 *           properties:
 *             episodic:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EpisodicMemory'
 *             semantic:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SemanticMemory'
 *         storedMemory:
 *           $ref: '#/components/schemas/EpisodicMemory'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     KnowledgeInput:
 *       type: object
 *       required:
 *         - userId
 *         - concept
 *         - description
 *       properties:
 *         userId:
 *           type: string
 *           example: "user123"
 *         concept:
 *           type: string
 *           example: "Neural Networks"
 *         description:
 *           type: string
 *           example: "Computing systems inspired by biological neural networks"
 *         category:
 *           type: string
 *           example: "AI"
 *           default: "general"
 */

/**
 * @swagger
 * /api/memory-chat/initialize:
 *   post:
 *     summary: Initialize memory service for chat
 *     description: Initialize the memory service with Ollama embeddings for chat functionality
 *     tags: [Memory - Chat]
 *     responses:
 *       200:
 *         description: Memory service initialized successfully
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
 *       500:
 *         description: Internal server error
 */
router.post('/initialize', memoryChatController.initializeMemoryService);

/**
 * @swagger
 * /api/memory-chat/chat:
 *   post:
 *     summary: Chat with memory context
 *     description: Send a message and get a response enhanced with relevant memories
 *     tags: [Memory - Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 *     example:
 *       request:
 *         userId: "user123"
 *         sessionId: "session456"
 *         message: "What did we discuss about AI yesterday?"
 *         includeMemories: true
 *       response:
 *         success: true
 *         data:
 *           message: "I received your message: \"What did we discuss about AI yesterday?\""
 *           context: "Previous conversation context:\n[2024-01-15T10:30:00.000Z] User asked about machine learning algorithms\n\nRelevant knowledge:\nMachine Learning: A subset of artificial intelligence that focuses on algorithms that can learn from data\n\nCurrent query: What did we discuss about AI yesterday?"
 *           memories:
 *             episodic:
 *               - id: "mem123"
 *                 content: "User asked about machine learning algorithms"
 *                 timestamp: "2024-01-15T10:30:00.000Z"
 *             semantic:
 *               - id: "sem456"
 *                 concept: "Machine Learning"
 *                 description: "A subset of artificial intelligence that focuses on algorithms that can learn from data"
 *           storedMemory:
 *             id: "mem789"
 *             content: "What did we discuss about AI yesterday?"
 *             timestamp: "2024-01-15T11:00:00.000Z"
 *           timestamp: "2024-01-15T11:00:00.000Z"
 */
router.post('/chat', memoryChatController.chatWithMemory);

/**
 * @swagger
 * /api/memory-chat/history/{userId}/{sessionId}:
 *   get:
 *     summary: Get conversation history
 *     description: Retrieve the conversation history for a specific user and session
 *     tags: [Memory - Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user123"
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: "session456"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of messages to return
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
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
 *                         userId:
 *                           type: string
 *                         sessionId:
 *                           type: string
 *                         conversation:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               content:
 *                                 type: string
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                               metadata:
 *                                 type: object
 *                         totalMemories:
 *                           type: integer
 *                         contextWindow:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
router.get('/history/:userId/:sessionId', memoryChatController.getConversationHistory);

/**
 * @swagger
 * /api/memory-chat/search:
 *   post:
 *     summary: Search memories during chat
 *     description: Search for relevant memories while in a chat session
 *     tags: [Memory - Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - query
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               query:
 *                 type: string
 *                 example: "machine learning algorithms"
 *               type:
 *                 type: string
 *                 enum: [episodic, semantic, both]
 *                 default: "both"
 *               limit:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       200:
 *         description: Memories found successfully
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
 *                         query:
 *                           type: string
 *                         results:
 *                           type: object
 *                           properties:
 *                             episodic:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   content:
 *                                     type: string
 *                                   timestamp:
 *                                     type: string
 *                                     format: date-time
 *                                   importance:
 *                                     type: number
 *                                   tags:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *                             semantic:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   concept:
 *                                     type: string
 *                                   description:
 *                                     type: string
 *                                   category:
 *                                     type: string
 *                                   confidence:
 *                                     type: number
 *                         context:
 *                           $ref: '#/components/schemas/MemoryContext'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/search', memoryChatController.searchMemoriesInChat);

/**
 * @swagger
 * /api/memory-chat/knowledge:
 *   post:
 *     summary: Store knowledge during chat
 *     description: Store new knowledge/concepts learned during a chat session
 *     tags: [Memory - Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KnowledgeInput'
 *     responses:
 *       200:
 *         description: Knowledge stored successfully
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
 *                         memory:
 *                           $ref: '#/components/schemas/SemanticMemory'
 *                         message:
 *                           type: string
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 *     example:
 *       request:
 *         userId: "user123"
 *         concept: "Neural Networks"
 *         description: "Computing systems inspired by biological neural networks"
 *         category: "AI"
 *       response:
 *         success: true
 *         data:
 *           memory:
 *             id: "sem789"
 *             userId: "user123"
 *             concept: "Neural Networks"
 *             description: "Computing systems inspired by biological neural networks"
 *             metadata:
 *               category: "AI"
 *               confidence: 0.8
 *               source: "chat_interface"
 *               lastAccessed: "2024-01-15T11:00:00.000Z"
 *               accessCount: 0
 *           message: "Knowledge about \"Neural Networks\" stored successfully"
 */
router.post('/knowledge', memoryChatController.storeKnowledgeInChat);

/**
 * @swagger
 * /api/memory-chat/extract-semantic:
 *   post:
 *     summary: Extract semantic information from episodic memories
 *     description: Use LLM to extract semantic concepts and relationships from episodic memories
 *     tags: [Memory - Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               sessionId:
 *                 type: string
 *                 example: "session456"
 *                 description: "Optional session ID to limit extraction to specific session"
 *     responses:
 *       200:
 *         description: Semantic extraction completed successfully
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
 *                         extractedConcepts:
 *                           type: integer
 *                           description: "Number of concepts extracted"
 *                         extractedRelationships:
 *                           type: integer
 *                           description: "Number of relationships identified"
 *                         processingTime:
 *                           type: integer
 *                           description: "Processing time in milliseconds"
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/extract-semantic', memoryChatController.extractSemanticMemories);

/**
 * @swagger
 * /api/memory-chat/semantic-stats/{userId}:
 *   get:
 *     summary: Get semantic extraction statistics
 *     description: Retrieve statistics about semantic extraction for a user
 *     tags: [Memory - Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user123"
 *     responses:
 *       200:
 *         description: Semantic extraction statistics retrieved successfully
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
 *                         totalExtractions:
 *                           type: integer
 *                           description: "Total number of extracted concepts"
 *                         averageConfidence:
 *                           type: number
 *                           description: "Average confidence score of extractions"
 *                         conceptsByCategory:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *                           description: "Number of concepts per category"
 *                         lastExtraction:
 *                           type: string
 *                           format: date-time
 *                           description: "Timestamp of last extraction"
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/semantic-stats/:userId', memoryChatController.getSemanticExtractionStats);

export default router;
