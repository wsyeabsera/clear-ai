import { Request, Response } from 'express';
import { 
  MemoryContextService, 
  MemoryServiceConfig, 
  CoreKeysAndModels,
  ApiResponse
} from '@clear-ai/shared';
import { initializeMemoryService } from './memoryController';
import dotenv from 'dotenv';
dotenv.config({path: './packages/server/.env'});

export const memoryChatController = {
  // Initialize memory service for chat
  async initializeMemoryService(req: Request, res: Response): Promise<void> {
    try {
      const config: MemoryServiceConfig = {
        neo4j: {
          uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
          username: process.env.NEO4J_USERNAME || 'neo4j',
          password: process.env.NEO4J_PASSWORD || 'samplepassword',
          database: process.env.NEO4J_DATABASE || 'neo4j'
        },
        pinecone: {
          apiKey: process.env.PINECONE_API_KEY || '',
          environment: process.env.PINECONE_ENVIRONMENT || 'clear-ai',
          indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
        },
        embedding: {
          model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
          dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
        },
        semanticExtraction: {
          enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
          minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
          maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
          enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
          categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
          batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
        }
      };

      const langchainConfig: CoreKeysAndModels = {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        openaiModel: 'gpt-3.5-turbo',
        mistralApiKey: process.env.MISTRAL_API_KEY || '',
        mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.1-8b-instant',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
      };

      await initializeMemoryService(config, langchainConfig);
      
      const response: ApiResponse = {
        success: true,
        data: { initialized: true },
        message: 'Memory service initialized successfully for chat',
        tools: ['MemoryContextService.initialize']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to initialize memory service',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.initialize']
      };
      res.status(500).json(response);
    }
  },

  // Chat with memory context
  async chatWithMemory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, sessionId, message, includeMemories = true } = req.body;
      
      if (!userId || !sessionId || !message) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
          message: 'userId, sessionId, and message are required',
          tools: ['MemoryContextService.enhanceContextWithMemories']
        };
        res.status(400).json(response);
        return;
      }

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.1-8b-instant',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
        }
      );

      let enhancedContext = '';
      let relevantMemories: { episodic: any[]; semantic: any[] } = { episodic: [], semantic: [] };

      if (includeMemories) {
        const enhanced = await memoryService.enhanceContextWithMemories(userId, sessionId, message);
        enhancedContext = enhanced.enhancedContext;
        relevantMemories = enhanced.relevantMemories;
      }

      // Store the current message as episodic memory
      const episodicMemory = await memoryService.storeEpisodicMemory({
        userId,
        sessionId,
        timestamp: new Date(),
        content: message,
        context: {
          conversation_turn: Date.now(),
          source: 'chat_interface'
        },
        metadata: {
          source: 'chat',
          importance: 0.7,
          tags: ['chat', 'user_message'],
          location: 'web_interface'
        },
        relationships: {
          previous: undefined,
          next: undefined,
          related: []
        }
      });

      // Generate a simple response (in a real implementation, this would use LangChain)
      const response = {
        message: `I received your message: "${message}"`,
        context: enhancedContext,
        memories: {
          episodic: relevantMemories.episodic.slice(0, 3) as any[], // Show top 3 episodic memories
          semantic: relevantMemories.semantic.slice(0, 3) as any[]  // Show top 3 semantic memories
        },
        storedMemory: episodicMemory,
        timestamp: new Date().toISOString()
      };

      const apiResponse: ApiResponse = {
        success: true,
        data: response,
        message: 'Chat response generated with memory context',
        tools: ['MemoryContextService.enhanceContextWithMemories', 'MemoryContextService.storeEpisodicMemory']
      };

      res.json(apiResponse);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process chat with memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.enhanceContextWithMemories']
      };
      res.status(500).json(response);
    }
  },

  // Get conversation history
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, sessionId } = req.params;
      const { limit = 20 } = req.query;

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.1-8b-instant',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
        }
      );

      const context = await memoryService.getMemoryContext(userId!, sessionId!);
      
      const response: ApiResponse = {
        success: true,
        data: {
          userId,
          sessionId,
          conversation: context.episodicMemories
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .slice(0, parseInt(limit as string))
            .map(memory => ({
              id: memory.id,
              content: memory.content,
              timestamp: memory.timestamp,
              metadata: memory.metadata
            })),
          totalMemories: context.episodicMemories.length,
          contextWindow: context.contextWindow
        },
        message: 'Conversation history retrieved successfully',
        tools: ['MemoryContextService.getMemoryContext']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve conversation history',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getMemoryContext']
      };
      res.status(500).json(response);
    }
  },

  // Search memories during chat
  async searchMemoriesInChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, query, type = 'both', limit = 10 } = req.body;

      if (!userId || !query) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
          message: 'userId and query are required',
          tools: ['MemoryContextService.searchMemories']
        };
        res.status(400).json(response);
        return;
      }

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.1-8b-instant',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
        }
      );

      const searchResults = await memoryService.searchMemories({
        userId,
        query,
        type: type as 'episodic' | 'semantic' | 'both',
        limit: parseInt(limit)
      });

      const response: ApiResponse = {
        success: true,
        data: {
          query,
          results: {
            episodic: searchResults.episodic.memories.map(memory => ({
              id: memory.id,
              content: memory.content,
              timestamp: memory.timestamp,
              importance: memory.metadata.importance,
              tags: memory.metadata.tags
            })),
            semantic: searchResults.semantic.memories.map(memory => ({
              id: memory.id,
              concept: memory.concept,
              description: memory.description,
              category: memory.metadata.category,
              confidence: memory.metadata.confidence
            }))
          },
          context: searchResults.context
        },
        message: `Found ${searchResults.episodic.memories.length} episodic and ${searchResults.semantic.memories.length} semantic memories`,
        tools: ['MemoryContextService.searchMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to search memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.searchMemories']
      };
      res.status(500).json(response);
    }
  },

  // Store knowledge during chat
  async storeKnowledgeInChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, concept, description, category = 'general' } = req.body;

      if (!userId || !concept || !description) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
          message: 'userId, concept, and description are required',
          tools: ['MemoryContextService.storeSemanticMemory']
        };
        res.status(400).json(response);
        return;
      }

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.1-8b-instant',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
        }
      );

      const semanticMemory = await memoryService.storeSemanticMemory({
        userId,
        concept,
        description,
        metadata: {
          category,
          confidence: 0.8,
          source: 'chat_interface',
          lastAccessed: new Date(),
          accessCount: 0
        },
        relationships: {
          similar: [],
          parent: undefined,
          children: []
        }
      });

      const response: ApiResponse = {
        success: true,
        data: {
          memory: semanticMemory,
          message: `Knowledge about "${concept}" stored successfully`
        },
        message: 'Knowledge stored successfully',
        tools: ['MemoryContextService.storeSemanticMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to store knowledge',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.storeSemanticMemory']
      };
      res.status(500).json(response);
    }
  },

  // Extract semantic information from episodic memories
  async extractSemanticMemories(req: Request, res: Response): Promise<void> {
    try {
      const { userId, sessionId } = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
          message: 'userId is required',
          tools: ['MemoryContextService.extractSemanticFromEpisodic']
        };
        res.status(400).json(response);
        return;
      }

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
          langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
          groqApiKey: process.env.GROQ_API_KEY || '',
          groqModel: 'llama-3.1-8b-instant',
          ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          ollamaModel: 'mistral'
        }
      );

      const result = await memoryService.extractSemanticFromEpisodic(userId, sessionId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Semantic extraction completed: ${result.extractedConcepts} concepts, ${result.extractedRelationships} relationships`,
        tools: ['MemoryContextService.extractSemanticFromEpisodic']
      };
      res.json(response);
    } catch (error) {
      console.error('Semantic extraction error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to extract semantic memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.extractSemanticFromEpisodic']
      };
      res.status(500).json(response);
    }
  },

  // Get semantic extraction statistics
  async getSemanticExtractionStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
          message: 'userId is required',
          tools: ['MemoryContextService.getSemanticExtractionStats']
        };
        res.status(400).json(response);
        return;
      }

      const memoryService = await initializeMemoryService(
        {
          neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'samplepassword',
            database: process.env.NEO4J_DATABASE || 'neo4j'
          },
          pinecone: {
            apiKey: process.env.PINECONE_API_KEY || '',
            environment: process.env.PINECONE_ENVIRONMENT || '',
            indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
          },
          embedding: {
            model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
            dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
          },
          semanticExtraction: {
            enabled: process.env.SEMANTIC_EXTRACTION_ENABLED === 'true',
            minConfidence: parseFloat(process.env.SEMANTIC_EXTRACTION_MIN_CONFIDENCE || '0.7'),
            maxConceptsPerMemory: parseInt(process.env.SEMANTIC_EXTRACTION_MAX_CONCEPTS || '3'),
            enableRelationshipExtraction: process.env.SEMANTIC_EXTRACTION_RELATIONSHIPS === 'true',
            categories: (process.env.SEMANTIC_EXTRACTION_CATEGORIES || 'AI,Technology,Programming,Science,General').split(','),
            batchSize: parseInt(process.env.SEMANTIC_EXTRACTION_BATCH_SIZE || '5')
          }
        },
        {
          langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
          langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          openaiModel: 'gpt-3.5-turbo',
          mistralApiKey: process.env.MISTRAL_API_KEY || '',
          mistralModel: 'mistral-small',
          groqApiKey: process.env.GROQ_API_KEY || '',
          groqModel: 'llama-3.1-8b-instant',
          ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          ollamaModel: 'mistral'
        }
      );

      const stats = await memoryService.getSemanticExtractionStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Semantic extraction statistics retrieved successfully',
        tools: ['MemoryContextService.getSemanticExtractionStats']
      };
      res.json(response);
    } catch (error) {
      console.error('Semantic extraction stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get semantic extraction statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getSemanticExtractionStats']
      };
      res.status(500).json(response);
    }
  }
};
