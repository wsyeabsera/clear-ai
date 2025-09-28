import { Router } from 'express';
import { memoryController } from '../controllers/memoryController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EpisodicMemory:
 *       type: object
 *       required:
 *         - userId
 *         - sessionId
 *         - content
 *         - metadata
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the memory
 *         userId:
 *           type: string
 *           description: ID of the user who owns this memory
 *         sessionId:
 *           type: string
 *           description: ID of the session this memory belongs to
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When this memory was created
 *         content:
 *           type: string
 *           description: The actual content of the memory
 *         context:
 *           type: object
 *           description: Additional context information
 *         metadata:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *             importance:
 *               type: number
 *               minimum: 0
 *               maximum: 1
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             location:
 *               type: string
 *             participants:
 *               type: array
 *               items:
 *                 type: string
 *         relationships:
 *           type: object
 *           properties:
 *             previous:
 *               type: string
 *             next:
 *               type: string
 *             related:
 *               type: array
 *               items:
 *                 type: string
 *     
 *     SemanticMemory:
 *       type: object
 *       required:
 *         - userId
 *         - concept
 *         - description
 *         - metadata
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the memory
 *         userId:
 *           type: string
 *           description: ID of the user who owns this memory
 *         concept:
 *           type: string
 *           description: The main concept or topic
 *         description:
 *           type: string
 *           description: Detailed description of the concept
 *         vector:
 *           type: array
 *           items:
 *             type: number
 *           description: Vector embedding for semantic search
 *         metadata:
 *           type: object
 *           properties:
 *             category:
 *               type: string
 *             confidence:
 *               type: number
 *               minimum: 0
 *               maximum: 1
 *             source:
 *               type: string
 *             lastAccessed:
 *               type: string
 *               format: date-time
 *             accessCount:
 *               type: number
 *         relationships:
 *           type: object
 *           properties:
 *             similar:
 *               type: array
 *               items:
 *                 type: string
 *             parent:
 *               type: string
 *             children:
 *               type: array
 *               items:
 *                 type: string
 *     
 *     MemoryContext:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         sessionId:
 *           type: string
 *         episodicMemories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EpisodicMemory'
 *         semanticMemories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SemanticMemory'
 *         contextWindow:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               format: date-time
 *             endTime:
 *               type: string
 *               format: date-time
 *             relevanceScore:
 *               type: number
 *     
 *     MemorySearchQuery:
 *       type: object
 *       required:
 *         - userId
 *         - query
 *         - type
 *       properties:
 *         userId:
 *           type: string
 *         query:
 *           type: string
 *         type:
 *           type: string
 *           enum: [episodic, semantic, both]
 *         filters:
 *           type: object
 *           properties:
 *             timeRange:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                   format: date-time
 *                 end:
 *                   type: string
 *                   format: date-time
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             importance:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *         limit:
 *           type: number
 *         threshold:
 *           type: number
 *     
 *     MemorySearchResult:
 *       type: object
 *       properties:
 *         episodic:
 *           type: object
 *           properties:
 *             memories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EpisodicMemory'
 *             scores:
 *               type: array
 *               items:
 *                 type: number
 *         semantic:
 *           type: object
 *           properties:
 *             memories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SemanticMemory'
 *             scores:
 *               type: array
 *               items:
 *                 type: number
 *         context:
 *           $ref: '#/components/schemas/MemoryContext'
 */

// Episodic Memory Routes

/**
 * @swagger
 * /api/memory/episodic:
 *   post:
 *     summary: Store episodic memory
 *     description: Store a new episodic memory in the system
 *     tags: [Memory - Episodic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - sessionId
 *               - content
 *               - metadata
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               sessionId:
 *                 type: string
 *                 example: "session456"
 *               content:
 *                 type: string
 *                 example: "User asked about machine learning algorithms"
 *               context:
 *                 type: object
 *                 example: {"conversation_turn": 3, "topic": "AI"}
 *               metadata:
 *                 type: object
 *                 properties:
 *                   source:
 *                     type: string
 *                     example: "chat"
 *                   importance:
 *                     type: number
 *                     example: 0.8
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["AI", "machine learning"]
 *                   location:
 *                     type: string
 *                     example: "web interface"
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["user123", "assistant"]
 *               relationships:
 *                 type: object
 *                 properties:
 *                   previous:
 *                     type: string
 *                   next:
 *                     type: string
 *                   related:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Episodic memory stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EpisodicMemory'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/episodic', memoryController.storeEpisodicMemory);

/**
 * @swagger
 * /api/memory/episodic/{id}:
 *   get:
 *     summary: Get episodic memory by ID
 *     description: Retrieve a specific episodic memory by its ID
 *     tags: [Memory - Episodic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *         example: "mem123"
 *     responses:
 *       200:
 *         description: Episodic memory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EpisodicMemory'
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.get('/episodic/:id', memoryController.getEpisodicMemory);

/**
 * @swagger
 * /api/memory/episodic/search:
 *   post:
 *     summary: Search episodic memories
 *     description: Search for episodic memories based on various criteria
 *     tags: [Memory - Episodic]
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
 *               query:
 *                 type: string
 *                 example: "machine learning"
 *               filters:
 *                 type: object
 *                 properties:
 *                   timeRange:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   importance:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *               limit:
 *                 type: number
 *                 example: 20
 *     responses:
 *       200:
 *         description: Episodic memories found
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
 *                         $ref: '#/components/schemas/EpisodicMemory'
 *       500:
 *         description: Internal server error
 */
router.post('/episodic/search', memoryController.searchEpisodicMemories);

/**
 * @swagger
 * /api/memory/episodic/{id}:
 *   put:
 *     summary: Update episodic memory
 *     description: Update an existing episodic memory
 *     tags: [Memory - Episodic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               context:
 *                 type: object
 *               metadata:
 *                 type: object
 *               relationships:
 *                 type: object
 *     responses:
 *       200:
 *         description: Episodic memory updated successfully
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.put('/episodic/:id', memoryController.updateEpisodicMemory);

/**
 * @swagger
 * /api/memory/episodic/{id}:
 *   delete:
 *     summary: Delete episodic memory
 *     description: Delete a specific episodic memory
 *     tags: [Memory - Episodic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Episodic memory deleted successfully
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.delete('/episodic/:id', memoryController.deleteEpisodicMemory);

// Semantic Memory Routes

/**
 * @swagger
 * /api/memory/semantic:
 *   post:
 *     summary: Store semantic memory
 *     description: Store a new semantic memory in the system
 *     tags: [Memory - Semantic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - concept
 *               - description
 *               - metadata
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               concept:
 *                 type: string
 *                 example: "Machine Learning"
 *               description:
 *                 type: string
 *                 example: "A subset of artificial intelligence that focuses on algorithms that can learn from data"
 *               metadata:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     example: "AI"
 *                   confidence:
 *                     type: number
 *                     example: 0.9
 *                   source:
 *                     type: string
 *                     example: "wikipedia"
 *                   lastAccessed:
 *                     type: string
 *                     format: date-time
 *                   accessCount:
 *                     type: number
 *                     example: 5
 *               relationships:
 *                 type: object
 *                 properties:
 *                   similar:
 *                     type: array
 *                     items:
 *                       type: string
 *                   parent:
 *                     type: string
 *                   children:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Semantic memory stored successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/semantic', memoryController.storeSemanticMemory);

/**
 * @swagger
 * /api/memory/semantic/{id}:
 *   get:
 *     summary: Get semantic memory by ID
 *     description: Retrieve a specific semantic memory by its ID
 *     tags: [Memory - Semantic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Semantic memory retrieved successfully
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.get('/semantic/:id', memoryController.getSemanticMemory);

/**
 * @swagger
 * /api/memory/semantic/search:
 *   post:
 *     summary: Search semantic memories
 *     description: Search for semantic memories using vector similarity
 *     tags: [Memory - Semantic]
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
 *                 example: "artificial intelligence algorithms"
 *               filters:
 *                 type: object
 *                 properties:
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *               limit:
 *                 type: number
 *                 example: 10
 *               threshold:
 *                 type: number
 *                 example: 0.7
 *     responses:
 *       200:
 *         description: Semantic memories found
 *       500:
 *         description: Internal server error
 */
router.post('/semantic/search', memoryController.searchSemanticMemories);

/**
 * @swagger
 * /api/memory/semantic/{id}:
 *   put:
 *     summary: Update semantic memory
 *     description: Update an existing semantic memory
 *     tags: [Memory - Semantic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *               relationships:
 *                 type: object
 *     responses:
 *       200:
 *         description: Semantic memory updated successfully
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.put('/semantic/:id', memoryController.updateSemanticMemory);

/**
 * @swagger
 * /api/memory/semantic/{id}:
 *   delete:
 *     summary: Delete semantic memory
 *     description: Delete a specific semantic memory
 *     tags: [Memory - Semantic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Semantic memory deleted successfully
 *       404:
 *         description: Memory not found
 *       500:
 *         description: Internal server error
 */
router.delete('/semantic/:id', memoryController.deleteSemanticMemory);

// Context and Search Routes

/**
 * @swagger
 * /api/memory/context/{userId}/{sessionId}:
 *   get:
 *     summary: Get memory context
 *     description: Retrieve the memory context for a specific user and session
 *     tags: [Memory - Context]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Memory context retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MemoryContext'
 *       500:
 *         description: Internal server error
 */
router.get('/context/:userId/:sessionId', memoryController.getMemoryContext);

/**
 * @swagger
 * /api/memory/search:
 *   post:
 *     summary: Search all memories
 *     description: Search across both episodic and semantic memories
 *     tags: [Memory - Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemorySearchQuery'
 *     responses:
 *       200:
 *         description: Memories found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MemorySearchResult'
 *       500:
 *         description: Internal server error
 */
router.post('/search', memoryController.searchMemories);

// Relationship Routes

/**
 * @swagger
 * /api/memory/relationships:
 *   post:
 *     summary: Create memory relationship
 *     description: Create a relationship between two memories
 *     tags: [Memory - Relationships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceId
 *               - targetId
 *               - relationshipType
 *             properties:
 *               sourceId:
 *                 type: string
 *                 example: "mem123"
 *               targetId:
 *                 type: string
 *                 example: "mem456"
 *               relationshipType:
 *                 type: string
 *                 example: "related"
 *     responses:
 *       200:
 *         description: Relationship created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/relationships', memoryController.createMemoryRelationship);

/**
 * @swagger
 * /api/memory/relationships/{memoryId}:
 *   get:
 *     summary: Get related memories
 *     description: Get memories related to a specific memory
 *     tags: [Memory - Relationships]
 *     parameters:
 *       - in: path
 *         name: memoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *       - in: query
 *         name: relationshipType
 *         schema:
 *           type: string
 *         description: Type of relationship to filter by
 *     responses:
 *       200:
 *         description: Related memories retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/relationships/:memoryId', memoryController.getRelatedMemories);

// Utility Routes

/**
 * @swagger
 * /api/memory/clear/{userId}:
 *   delete:
 *     summary: Clear user memories
 *     description: Clear all memories for a specific user
 *     tags: [Memory - Utility]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User memories cleared successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/clear/:userId', memoryController.clearUserMemories);

/**
 * @swagger
 * /api/memory/clear/{userId}/{sessionId}:
 *   delete:
 *     summary: Clear session memories
 *     description: Clear all memories for a specific user session
 *     tags: [Memory - Utility]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session memories cleared successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/clear/:userId/:sessionId', memoryController.clearSessionMemories);
router.delete('/clear-semantic/:userId', memoryController.clearSemanticMemories);

/**
 * @swagger
 * /api/memory/stats/{userId}:
 *   get:
 *     summary: Get memory statistics
 *     description: Get statistics about a user's memories
 *     tags: [Memory - Utility]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Memory statistics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/stats/:userId', memoryController.getMemoryStats);

/**
 * @swagger
 * /api/memory/enhance-context:
 *   post:
 *     summary: Enhance context with memories
 *     description: Enhance a query context with relevant memories for LangChain integration
 *     tags: [Memory - Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - sessionId
 *               - query
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               sessionId:
 *                 type: string
 *                 example: "session456"
 *               query:
 *                 type: string
 *                 example: "Tell me about machine learning"
 *     responses:
 *       200:
 *         description: Context enhanced successfully
 *       500:
 *         description: Internal server error
 */
router.post('/enhance-context', memoryController.enhanceContextWithMemories);

export default router;
