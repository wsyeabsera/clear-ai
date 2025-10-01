import { v4 as uuidv4 } from 'uuid';
import {
  EpisodicMemory,
  SemanticMemory,
  MemoryContext,
  MemorySearchQuery,
  MemorySearchResult,
  MemoryService,
  MemoryServiceConfig
} from '../types/memory';
import { Neo4jMemoryService } from './Neo4jMemoryService';
import { PineconeMemoryService } from './PineconeMemoryService';
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService';
import { SemanticExtractorService, SemanticExtractionConfig } from './SemanticExtractorService';

export class MemoryContextService implements MemoryService {
  private neo4jService: Neo4jMemoryService;
  private pineconeService: PineconeMemoryService;
  private langchainService: SimpleLangChainService;
  private semanticExtractor: SemanticExtractorService;
  private config: MemoryServiceConfig;

  constructor(config: MemoryServiceConfig, langchainConfig: CoreKeysAndModels) {
    this.config = config;
    this.neo4jService = new Neo4jMemoryService(config.neo4j);
    this.pineconeService = new PineconeMemoryService(config.pinecone);
    this.langchainService = new SimpleLangChainService(langchainConfig);

    // Initialize semantic extractor with configuration
    const extractionConfig: SemanticExtractionConfig = {
      minConfidence: config.semanticExtraction.minConfidence,
      maxConceptsPerMemory: config.semanticExtraction.maxConceptsPerMemory,
      enableRelationshipExtraction: config.semanticExtraction.enableRelationshipExtraction,
      categories: config.semanticExtraction.categories
    };
    this.semanticExtractor = new SemanticExtractorService(extractionConfig);
  }

  async initialize(): Promise<void> {
    await this.neo4jService.initialize();
    console.log('Neo4j memory service initialized successfully');

    // Initialize Pinecone service only if API key is provided
    if (this.config.pinecone.apiKey && this.config.pinecone.apiKey !== '') {
      try {
        // Use Ollama for embeddings - no need to pass a model since we'll use direct API calls
        await this.pineconeService.initialize(null);
        console.log('Pinecone memory service initialized successfully');
      } catch (error) {
        console.warn('⚠️ Pinecone initialization failed, continuing without semantic memory:', (error as Error).message);
        this.pineconeService = null as any; // Disable Pinecone if it fails
      }
    } else {
      console.log('⚠️ Pinecone API key not provided, skipping semantic memory initialization');
      this.pineconeService = null as any; // Disable Pinecone if no API key
    }

    console.log('Memory context service initialized successfully with Ollama embeddings');
  }

  // Episodic memory operations
  async storeEpisodicMemory(memory: Omit<EpisodicMemory, 'id'>): Promise<EpisodicMemory> {
    return await this.neo4jService.storeEpisodicMemory(memory);
  }

  async getEpisodicMemory(id: string): Promise<EpisodicMemory | null> {
    return await this.neo4jService.getEpisodicMemory(id);
  }

  async searchEpisodicMemories(query: MemorySearchQuery): Promise<EpisodicMemory[]> {
    const neo4jQuery = {
      userId: query.userId,
      sessionId: query.filters?.timeRange ? undefined : undefined, // Add sessionId if needed
      timeRange: query.filters?.timeRange,
      tags: query.filters?.tags,
      importance: query.filters?.importance,
      limit: query.limit
    };

    return await this.neo4jService.searchEpisodicMemories(neo4jQuery);
  }

  async updateEpisodicMemory(id: string, updates: Partial<EpisodicMemory>): Promise<EpisodicMemory> {
    return await this.neo4jService.updateEpisodicMemory(id, updates);
  }

  async deleteEpisodicMemory(id: string): Promise<boolean> {
    return await this.neo4jService.deleteEpisodicMemory(id);
  }

  // Semantic memory operations
  async storeSemanticMemory(memory: Omit<SemanticMemory, 'id' | 'vector'>): Promise<SemanticMemory> {
    if (!this.pineconeService) {
      throw new Error('Pinecone service not available. Please provide a valid Pinecone API key.');
    }
    return await this.pineconeService.storeSemanticMemory(memory);
  }

  async getSemanticMemory(id: string): Promise<SemanticMemory | null> {
    if (!this.pineconeService) {
      throw new Error('Pinecone service not available. Please provide a valid Pinecone API key.');
    }
    return await this.pineconeService.getSemanticMemory(id);
  }

  async searchSemanticMemories(query: MemorySearchQuery): Promise<SemanticMemory[]> {
    if (!this.pineconeService) {
      console.warn('Pinecone service not available, returning empty semantic memory results');
      return [];
    }

    const pineconeQuery = {
      userId: query.userId,
      query: query.query,
      categories: query.filters?.categories,
      threshold: query.threshold,
      limit: query.limit
    };

    const result = await this.pineconeService.searchSemanticMemories(pineconeQuery);
    return result.memories;
  }

  async updateSemanticMemory(id: string, updates: Partial<SemanticMemory>): Promise<SemanticMemory> {
    if (!this.pineconeService) {
      throw new Error('Pinecone service not available. Please provide a valid Pinecone API key.');
    }
    return await this.pineconeService.updateSemanticMemory(id, updates);
  }

  async deleteSemanticMemory(id: string): Promise<boolean> {
    if (!this.pineconeService) {
      throw new Error('Pinecone service not available. Please provide a valid Pinecone API key.');
    }
    return await this.pineconeService.deleteSemanticMemory(id);
  }

  // Context operations
  async getMemoryContext(userId: string, sessionId: string): Promise<MemoryContext> {
    // Get recent episodic memories for the session
    const episodicMemories = await this.neo4jService.searchEpisodicMemories({
      userId,
      sessionId,
      limit: 50
    });

    // Get relevant semantic memories based on recent episodic content
    const recentContent = episodicMemories
      .slice(0, 10)
      .map(m => m.content)
      .join(' ');

    let semanticMemories: SemanticMemory[] = [];
    if (recentContent && this.pineconeService) {
      try {
        const semanticResult = await this.pineconeService.searchSemanticMemories({
          userId,
          query: recentContent,
          limit: 20
        });
        semanticMemories = semanticResult.memories;
      } catch (error) {
        console.warn('Failed to search semantic memories:', error);
      }
    }

    // Calculate context window
    const timestamps = episodicMemories.map(m => m.timestamp);
    const startTime = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : new Date();
    const endTime = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date();

    // Calculate relevance score based on recency and importance
    const relevanceScore = this.calculateRelevanceScore(episodicMemories, semanticMemories);

    return {
      userId,
      sessionId,
      episodicMemories,
      semanticMemories,
      contextWindow: {
        startTime,
        endTime,
        relevanceScore
      }
    };
  }

  async searchMemories(query: MemorySearchQuery): Promise<MemorySearchResult> {
    const results: MemorySearchResult = {
      episodic: { memories: [], scores: [] },
      semantic: { memories: [], scores: [] },
      context: {
        userId: query.userId,
        sessionId: '',
        episodicMemories: [],
        semanticMemories: [],
        contextWindow: {
          startTime: new Date(),
          endTime: new Date(),
          relevanceScore: 0
        }
      }
    };

    if (query.type === 'episodic' || query.type === 'both') {
      results.episodic.memories = await this.searchEpisodicMemories(query);
      // For episodic memories, we don't have similarity scores from Neo4j
      results.episodic.scores = results.episodic.memories.map(() => 1.0);
    }

    if (query.type === 'semantic' || query.type === 'both') {
      const semanticResult = await this.pineconeService.searchSemanticMemories({
        userId: query.userId,
        query: query.query,
        categories: query.filters?.categories,
        threshold: query.threshold,
        limit: query.limit
      });
      results.semantic.memories = semanticResult.memories;
      results.semantic.scores = semanticResult.scores;
    }

    // Generate context from results
    if (results.episodic.memories.length > 0 || results.semantic.memories.length > 0) {
      const sessionId = results.episodic.memories[0]?.sessionId || uuidv4();
      results.context = await this.getMemoryContext(query.userId, sessionId);
    }

    return results;
  }

  // Relationship operations
  async createMemoryRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string
  ): Promise<boolean> {
    // Determine if memories are episodic or semantic
    const sourceEpisodic = await this.getEpisodicMemory(sourceId);
    const targetEpisodic = await this.getEpisodicMemory(targetId);

    if (sourceEpisodic && targetEpisodic) {
      // Both are episodic - use Neo4j
      return await this.createEpisodicRelationship(sourceId, targetId, relationshipType);
    } else {
      // At least one is semantic - store relationship in metadata
      return await this.createSemanticRelationship(sourceId, targetId, relationshipType);
    }
  }

  private async createEpisodicRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string
  ): Promise<boolean> {
    // This would require extending Neo4j service to support custom relationships
    // For now, we'll update the relationships field
    const source = await this.getEpisodicMemory(sourceId);
    const target = await this.getEpisodicMemory(targetId);

    if (!source || !target) return false;

    // Update source memory
    const updatedSource = {
      ...source,
      relationships: {
        ...source.relationships,
        related: [...(source.relationships.related || []), targetId]
      }
    };
    await this.updateEpisodicMemory(sourceId, updatedSource);

    return true;
  }

  private async createSemanticRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string
  ): Promise<boolean> {
    // Update both memories' relationship metadata
    const source = await this.getSemanticMemory(sourceId);
    const target = await this.getSemanticMemory(targetId);

    if (!source || !target) return false;

    // Update source memory
    const updatedSource = {
      ...source,
      relationships: {
        ...source.relationships,
        similar: [...(source.relationships.similar || []), targetId]
      }
    };
    await this.updateSemanticMemory(sourceId, updatedSource);

    return true;
  }

  async getRelatedMemories(memoryId: string, relationshipType?: string): Promise<{
    episodic: EpisodicMemory[];
    semantic: SemanticMemory[];
  }> {
    const episodic = await this.neo4jService.getRelatedMemories(memoryId, relationshipType);
    const semantic = await this.pineconeService.getRelatedMemories(memoryId, relationshipType);

    return { episodic, semantic };
  }

  // Utility operations
  async clearUserMemories(userId: string): Promise<boolean> {
    const episodicCleared = await this.neo4jService.clearUserMemories(userId);

    let semanticCleared = true;
    if (this.pineconeService) {
      try {
        semanticCleared = await this.pineconeService.clearUserMemories(userId);
      } catch (error) {
        console.warn('Failed to clear semantic memories:', (error as Error).message);
        semanticCleared = false;
      }
    }

    return episodicCleared && semanticCleared;
  }

  async clearSessionMemories(userId: string, sessionId: string): Promise<boolean> {
    // Only clear episodic memories (session-specific)
    // Semantic memories are user-level knowledge and should persist across sessions
    const episodicCleared = await this.neo4jService.clearSessionMemories(userId, sessionId);

    // Don't clear semantic memories as they represent persistent user knowledge
    // that should carry over between sessions

    return episodicCleared;
  }

  async clearSemanticMemories(userId: string): Promise<boolean> {
    // Clear all semantic memories for a user (their knowledge base)
    console.log(`Clearing semantic memories for user: ${userId}`);
    let semanticCleared = true;
    if (this.pineconeService) {
      try {
        console.log('Calling pineconeService.clearUserMemories...');
        semanticCleared = await this.pineconeService.clearUserMemories(userId);
        console.log(`Pinecone clear result: ${semanticCleared}`);
      } catch (error) {
        console.warn('Failed to clear semantic memories:', (error as Error).message);
        semanticCleared = false;
      }
    } else {
      console.log('Pinecone service not available');
    }

    return semanticCleared;
  }

  async getMemoryStats(userId: string): Promise<{
    episodic: { count: number; oldest: Date | null; newest: Date | null };
    semantic: { count: number; categories: string[] };
  }> {
    const episodicStats = await this.neo4jService.getMemoryStats(userId);

    let semanticStats = { count: 0, categories: [] as string[] };
    if (this.pineconeService) {
      try {
        semanticStats = await this.pineconeService.getMemoryStats(userId);
      } catch (error) {
        console.warn('Failed to get semantic memory stats:', (error as Error).message);
      }
    }

    return {
      episodic: episodicStats,
      semantic: semanticStats
    };
  }

  // Helper methods
  private calculateRelevanceScore(
    episodicMemories: EpisodicMemory[],
    semanticMemories: SemanticMemory[]
  ): number {
    if (episodicMemories.length === 0 && semanticMemories.length === 0) {
      return 0;
    }

    // Calculate episodic relevance (based on recency and importance)
    const episodicScore = episodicMemories.reduce((sum, memory) => {
      const recency = Math.exp(-(Date.now() - memory.timestamp.getTime()) / (24 * 60 * 60 * 1000)); // Decay over days
      const importance = memory.metadata.importance || 0.5;
      return sum + (recency * importance);
    }, 0) / Math.max(episodicMemories.length, 1);

    // Calculate semantic relevance (based on confidence and access count)
    const semanticScore = semanticMemories.reduce((sum, memory) => {
      const confidence = memory.metadata.confidence || 0.5;
      const accessWeight = Math.log(1 + memory.metadata.accessCount);
      return sum + (confidence * accessWeight);
    }, 0) / Math.max(semanticMemories.length, 1);

    // Combine scores (weighted average)
    const totalMemories = episodicMemories.length + semanticMemories.length;
    const episodicWeight = episodicMemories.length / totalMemories;
    const semanticWeight = semanticMemories.length / totalMemories;

    return (episodicScore * episodicWeight + semanticScore * semanticWeight);
  }

  // Integration with LangChain/LangGraph
  async enhanceContextWithMemories(
    userId: string,
    sessionId: string,
    currentQuery: string
  ): Promise<{
    enhancedContext: string;
    relevantMemories: {
      episodic: EpisodicMemory[];
      semantic: SemanticMemory[];
    };
  }> {
    // Get memory context
    const context = await this.getMemoryContext(userId, sessionId);

    // Search for additional relevant memories based on current query
    const searchResults = await this.searchMemories({
      userId,
      query: currentQuery,
      type: 'both',
      limit: 10
    });

    // Combine context memories with search results
    const allEpisodic = [...context.episodicMemories, ...searchResults.episodic.memories];
    const allSemantic = [...context.semanticMemories, ...searchResults.semantic.memories];

    // Remove duplicates
    const uniqueEpisodic = allEpisodic.filter((memory, index, self) =>
      index === self.findIndex(m => m.id === memory.id)
    );
    const uniqueSemantic = allSemantic.filter((memory, index, self) =>
      index === self.findIndex(m => m.id === memory.id)
    );

    // Generate enhanced context
    const episodicContext = uniqueEpisodic
      .slice(0, 5) // Limit to most recent 5
      .map(m => `[${m.timestamp.toISOString()}] ${m.content}`)
      .join('\n');

    const semanticContext = uniqueSemantic
      .slice(0, 5) // Limit to most relevant 5
      .map(m => `${m.concept}: ${m.description}`)
      .join('\n');

    const enhancedContext = `
Previous conversation context:
${episodicContext}

Relevant knowledge:
${semanticContext}

Current query: ${currentQuery}
    `.trim();

    return {
      enhancedContext,
      relevantMemories: {
        episodic: uniqueEpisodic,
        semantic: uniqueSemantic
      }
    };
  }

  // Semantic extraction operations
  async extractSemanticFromEpisodic(userId: string, sessionId?: string): Promise<{
    extractedConcepts: number;
    extractedRelationships: number;
    processingTime: number;
  }> {
    if (!this.config.semanticExtraction.enabled) {
      throw new Error('Semantic extraction is disabled in configuration');
    }

    if (!this.pineconeService) {
      throw new Error('Pinecone service not available for semantic extraction');
    }

    try {
      // Get episodic memories for the user (and optionally specific session)
      const query: MemorySearchQuery = {
        userId,
        query: '',
        type: 'episodic',
        limit: 100 // Process up to 100 recent memories
      };

      if (sessionId) {
        query.filters = { ...query.filters, tags: [sessionId] };
      }

      const episodicMemories = await this.searchEpisodicMemories(query);

      if (episodicMemories.length === 0) {
        return {
          extractedConcepts: 0,
          extractedRelationships: 0,
          processingTime: 0
        };
      }

      // Extract semantic information using LLM
      const extractionResult = await this.semanticExtractor.extractSemanticInfo(episodicMemories, this.langchainService);

      if (extractionResult.concepts.length === 0) {
        return {
          extractedConcepts: 0,
          extractedRelationships: 0,
          processingTime: extractionResult.processingTime
        };
      }

      // Convert extracted concepts to semantic memories
      const semanticMemories = this.semanticExtractor.convertToSemanticMemories(
        extractionResult.concepts,
        userId
      );

      // Add extraction metadata to each semantic memory
      semanticMemories.forEach((memory, index) => {
        const concept = extractionResult.concepts[index];
        memory.metadata.extractionMetadata = {
          sourceMemoryIds: [concept.sourceMemoryId],
          extractionTimestamp: new Date(),
          extractionConfidence: concept.confidence,
          keywords: concept.keywords,
          processingTime: extractionResult.processingTime
        };
      });

      // Store semantic memories in Pinecone
      const storedMemories: SemanticMemory[] = [];
      for (const memory of semanticMemories) {
        try {
          const stored = await this.pineconeService.storeSemanticMemory(memory);
          storedMemories.push(stored);
        } catch (error) {
          console.error(`Failed to store semantic memory for concept "${memory.concept}":`, error);
        }
      }

      // Build relationships between semantic memories
      if (extractionResult.relationships.length > 0) {
        const relationshipUpdates = this.semanticExtractor.buildSemanticRelationships(
          storedMemories,
          extractionResult.relationships
        );

        // Apply relationship updates
        for (const [memoryId, updates] of relationshipUpdates) {
          try {
            await this.pineconeService.updateSemanticMemory(memoryId, updates);
          } catch (error) {
            console.error(`Failed to update relationships for memory ${memoryId}:`, error);
          }
        }
      }

      console.log(`✅ Semantic extraction completed: ${storedMemories.length} concepts, ${extractionResult.relationships.length} relationships`);

      return {
        extractedConcepts: storedMemories.length,
        extractedRelationships: extractionResult.relationships.length,
        processingTime: extractionResult.processingTime
      };
    } catch (error) {
      console.error('Failed to extract semantic information from episodic memories:', error);
      throw error;
    }
  }

  async getSemanticExtractionStats(userId: string): Promise<{
    totalExtractions: number;
    averageConfidence: number;
    conceptsByCategory: Record<string, number>;
    lastExtraction: Date | null;
  }> {
    if (!this.pineconeService) {
      throw new Error('Pinecone service not available');
    }

    try {
      // Search for semantic memories with extraction metadata
      const searchResult = await this.pineconeService.searchSemanticMemories({
        userId,
        query: '',
        threshold: 0
      });

      const extractedMemories = searchResult.memories.filter(
        memory => memory.metadata.extractionMetadata
      );

      if (extractedMemories.length === 0) {
        return {
          totalExtractions: 0,
          averageConfidence: 0,
          conceptsByCategory: {},
          lastExtraction: null
        };
      }

      // Calculate statistics
      const totalConfidence = extractedMemories.reduce(
        (sum, memory) => sum + memory.metadata.confidence, 0
      );
      const averageConfidence = totalConfidence / extractedMemories.length;

      const conceptsByCategory = extractedMemories.reduce((acc, memory) => {
        const category = memory.metadata.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const lastExtraction = extractedMemories
        .map(memory => memory.metadata.extractionMetadata?.extractionTimestamp)
        .filter(Boolean)
        .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

      return {
        totalExtractions: extractedMemories.length,
        averageConfidence,
        conceptsByCategory,
        lastExtraction
      };
    } catch (error) {
      console.error('Failed to get semantic extraction stats:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.neo4jService.close();
    // Pinecone doesn't need explicit closing
  }
}
