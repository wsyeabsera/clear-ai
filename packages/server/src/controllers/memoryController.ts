import { Request, Response } from 'express';
import {
  MemoryContextService,
  MemoryServiceConfig,
  CoreKeysAndModels,
  EpisodicMemory,
  SemanticMemory,
  MemorySearchQuery,
  MemorySearchResult,
  MemoryContext,
  ApiResponse
} from '@clear-ai/shared';

// Global memory service instance
let memoryService: MemoryContextService | null = null;

// Initialize memory service
export const initializeMemoryService = async (config: MemoryServiceConfig, langchainConfig: CoreKeysAndModels) => {
  if (!memoryService) {
    memoryService = new MemoryContextService(config, langchainConfig);
    await memoryService.initialize();
  }
  return memoryService;
};

// Get memory service instance
const getMemoryService = (): MemoryContextService => {
  if (!memoryService) {
    throw new Error('Memory service not initialized. Call initializeMemoryService first.');
  }
  return memoryService;
};

export const memoryController = {
  // Episodic Memory Operations
  async storeEpisodicMemory(req: Request, res: Response): Promise<void> {
    try {
      const service = getMemoryService();

      // Convert timestamp string to Date object if needed
      // Also ensure nested objects are properly handled for Neo4j
      const memoryData = {
        ...req.body,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        context: req.body.context || {},
        metadata: req.body.metadata || {},
        relationships: req.body.relationships || {}
      };

      const memory = await service.storeEpisodicMemory(memoryData);

      const response: ApiResponse<EpisodicMemory> = {
        success: true,
        data: memory,
        message: 'Episodic memory stored successfully',
        tools: ['MemoryContextService.storeEpisodicMemory']
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to store episodic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.storeEpisodicMemory']
      };
      res.status(500).json(response);
    }
  },

  async getEpisodicMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = getMemoryService();
      const memory = await service.getEpisodicMemory(id!);

      if (!memory) {
        const response: ApiResponse = {
          success: false,
          error: 'Episodic memory not found',
          message: `No episodic memory found with ID: ${id}`,
          tools: ['MemoryContextService.getEpisodicMemory']
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<EpisodicMemory> = {
        success: true,
        data: memory,
        message: 'Episodic memory retrieved successfully',
        tools: ['MemoryContextService.getEpisodicMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve episodic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getEpisodicMemory']
      };
      res.status(500).json(response);
    }
  },

  async searchEpisodicMemories(req: Request, res: Response): Promise<void> {
    try {
      const query: MemorySearchQuery = {
        userId: req.body.userId,
        query: req.body.query || '',
        type: 'episodic',
        filters: req.body.filters,
        limit: req.body.limit || 20,
        threshold: req.body.threshold
      };

      const service = getMemoryService();
      const memories = await service.searchEpisodicMemories(query);

      const response: ApiResponse<EpisodicMemory[]> = {
        success: true,
        data: memories,
        message: `Found ${memories.length} episodic memories`,
        tools: ['MemoryContextService.searchEpisodicMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to search episodic memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.searchEpisodicMemories']
      };
      res.status(500).json(response);
    }
  },

  async updateEpisodicMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = getMemoryService();
      const memory = await service.updateEpisodicMemory(id!, updates);

      const response: ApiResponse<EpisodicMemory> = {
        success: true,
        data: memory,
        message: 'Episodic memory updated successfully',
        tools: ['MemoryContextService.updateEpisodicMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update episodic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.updateEpisodicMemory']
      };
      res.status(500).json(response);
    }
  },

  async deleteEpisodicMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = getMemoryService();
      const deleted = await service.deleteEpisodicMemory(id!);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Episodic memory not found',
          message: `No episodic memory found with ID: ${id}`,
          tools: ['MemoryContextService.deleteEpisodicMemory']
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { deleted: true },
        message: 'Episodic memory deleted successfully',
        tools: ['MemoryContextService.deleteEpisodicMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete episodic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.deleteEpisodicMemory']
      };
      res.status(500).json(response);
    }
  },

  // Semantic Memory Operations
  async storeSemanticMemory(req: Request, res: Response): Promise<void> {
    try {
      const service = getMemoryService();
      const memory = await service.storeSemanticMemory(req.body);

      const response: ApiResponse<SemanticMemory> = {
        success: true,
        data: memory,
        message: 'Semantic memory stored successfully',
        tools: ['MemoryContextService.storeSemanticMemory']
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to store semantic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.storeSemanticMemory']
      };
      res.status(500).json(response);
    }
  },

  async getSemanticMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = getMemoryService();
      const memory = await service.getSemanticMemory(id!);

      if (!memory) {
        const response: ApiResponse = {
          success: false,
          error: 'Semantic memory not found',
          message: `No semantic memory found with ID: ${id}`,
          tools: ['MemoryContextService.getSemanticMemory']
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<SemanticMemory> = {
        success: true,
        data: memory,
        message: 'Semantic memory retrieved successfully',
        tools: ['MemoryContextService.getSemanticMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve semantic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getSemanticMemory']
      };
      res.status(500).json(response);
    }
  },

  async searchSemanticMemories(req: Request, res: Response): Promise<void> {
    try {
      const query: MemorySearchQuery = {
        userId: req.body.userId,
        query: req.body.query || '',
        type: 'semantic',
        filters: req.body.filters,
        limit: req.body.limit || 20,
        threshold: req.body.threshold
      };

      const service = getMemoryService();
      const memories = await service.searchSemanticMemories(query);

      const response: ApiResponse<SemanticMemory[]> = {
        success: true,
        data: memories,
        message: `Found ${memories.length} semantic memories`,
        tools: ['MemoryContextService.searchSemanticMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to search semantic memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.searchSemanticMemories']
      };
      res.status(500).json(response);
    }
  },

  async updateSemanticMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = getMemoryService();
      const memory = await service.updateSemanticMemory(id!, updates);

      const response: ApiResponse<SemanticMemory> = {
        success: true,
        data: memory,
        message: 'Semantic memory updated successfully',
        tools: ['MemoryContextService.updateSemanticMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update semantic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.updateSemanticMemory']
      };
      res.status(500).json(response);
    }
  },

  async deleteSemanticMemory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = getMemoryService();
      const deleted = await service.deleteSemanticMemory(id!);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Semantic memory not found',
          message: `No semantic memory found with ID: ${id}`,
          tools: ['MemoryContextService.deleteSemanticMemory']
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { deleted: true },
        message: 'Semantic memory deleted successfully',
        tools: ['MemoryContextService.deleteSemanticMemory']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete semantic memory',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.deleteSemanticMemory']
      };
      res.status(500).json(response);
    }
  },

  // Context Operations
  async getMemoryContext(req: Request, res: Response): Promise<void> {
    try {
      const { userId, sessionId } = req.params;
      const service = getMemoryService();
      const context = await service.getMemoryContext(userId!, sessionId!);

      const response: ApiResponse<MemoryContext> = {
        success: true,
        data: context,
        message: 'Memory context retrieved successfully',
        tools: ['MemoryContextService.getMemoryContext']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve memory context',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getMemoryContext']
      };
      res.status(500).json(response);
    }
  },

  async searchMemories(req: Request, res: Response): Promise<void> {
    try {
      const query: MemorySearchQuery = {
        userId: req.body.userId,
        query: req.body.query || '',
        type: req.body.type || 'both',
        filters: req.body.filters,
        limit: req.body.limit || 20,
        threshold: req.body.threshold
      };

      const service = getMemoryService();
      const results = await service.searchMemories(query);

      const response: ApiResponse<MemorySearchResult> = {
        success: true,
        data: results,
        message: `Found ${results.episodic.memories.length} episodic and ${results.semantic.memories.length} semantic memories`,
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

  // Relationship Operations
  async createMemoryRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { sourceId, targetId, relationshipType } = req.body;
      const service = getMemoryService();
      const created = await service.createMemoryRelationship(sourceId, targetId, relationshipType);

      const response: ApiResponse = {
        success: true,
        data: { created },
        message: 'Memory relationship created successfully',
        tools: ['MemoryContextService.createMemoryRelationship']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create memory relationship',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.createMemoryRelationship']
      };
      res.status(500).json(response);
    }
  },

  async getRelatedMemories(req: Request, res: Response): Promise<void> {
    try {
      const { memoryId } = req.params;
      const { relationshipType } = req.query;
      const service = getMemoryService();
      const related = await service.getRelatedMemories(memoryId!, relationshipType as string);

      const response: ApiResponse = {
        success: true,
        data: related,
        message: `Found ${related.episodic.length} episodic and ${related.semantic.length} semantic related memories`,
        tools: ['MemoryContextService.getRelatedMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get related memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getRelatedMemories']
      };
      res.status(500).json(response);
    }
  },

  // Utility Operations
  async clearUserMemories(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const service = getMemoryService();
      const cleared = await service.clearUserMemories(userId!);

      const response: ApiResponse = {
        success: true,
        data: { cleared },
        message: 'User memories cleared successfully',
        tools: ['MemoryContextService.clearUserMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to clear user memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.clearUserMemories']
      };
      res.status(500).json(response);
    }
  },

  async getMemoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const service = getMemoryService();
      const stats = await service.getMemoryStats(userId!);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Memory statistics retrieved successfully',
        tools: ['MemoryContextService.getMemoryStats']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve memory statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.getMemoryStats']
      };
      res.status(500).json(response);
    }
  },

  // Enhanced Context for LangChain Integration
  async enhanceContextWithMemories(req: Request, res: Response): Promise<void> {
    try {
      const { userId, sessionId, query } = req.body;
      const service = getMemoryService();
      const enhanced = await service.enhanceContextWithMemories(userId, sessionId, query);

      const response: ApiResponse = {
        success: true,
        data: enhanced,
        message: 'Context enhanced with memories successfully',
        tools: ['MemoryContextService.enhanceContextWithMemories']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to enhance context with memories',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['MemoryContextService.enhanceContextWithMemories']
      };
      res.status(500).json(response);
    }
  }
};
