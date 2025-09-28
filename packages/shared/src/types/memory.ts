/**
 * Memory system types for episodic and semantic memory storage
 */

export interface EpisodicMemory {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  content: string;
  context: Record<string, any>;
  metadata: {
    source: string;
    importance: number; // 0-1 scale
    tags: string[];
    location?: string;
    participants?: string[];
  };
  relationships: {
    previous?: string | undefined; // ID of previous memory in sequence
    next?: string | undefined; // ID of next memory in sequence
    related?: string[]; // IDs of related memories
  };
}

export interface SemanticMemory {
  id: string;
  userId: string;
  concept: string;
  description: string;
  vector: number[];
  metadata: {
    category: string;
    confidence: number; // 0-1 scale
    source: string;
    lastAccessed: Date;
    accessCount: number;
    // New fields for semantic extraction
    extractionMetadata?: {
      sourceMemoryIds: string[]; // IDs of episodic memories this was extracted from
      extractionTimestamp: Date;
      extractionConfidence: number;
      keywords: string[];
      processingTime: number;
    };
  };
  relationships: {
    similar?: string[]; // IDs of similar concepts
    parent?: string | undefined; // ID of parent concept
    children?: string[]; // IDs of child concepts
    // New relationship types from semantic extraction
    related?: string[]; // IDs of related concepts
    causes?: string[]; // IDs of concepts this causes
    causedBy?: string[]; // IDs of concepts that cause this
    partOf?: string[]; // IDs of concepts this is part of
    hasParts?: string[]; // IDs of concepts that are parts of this
    opposite?: string[]; // IDs of opposite concepts
    instanceOf?: string[]; // IDs of concepts this is an instance of
  };
}

export interface MemoryContext {
  userId: string;
  sessionId: string;
  episodicMemories: EpisodicMemory[];
  semanticMemories: SemanticMemory[];
  contextWindow: {
    startTime: Date;
    endTime: Date;
    relevanceScore: number;
  };
}

export interface MemorySearchQuery {
  userId: string;
  query: string;
  type: 'episodic' | 'semantic' | 'both';
  filters?: {
    timeRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
    importance?: {
      min: number;
      max: number;
    };
    categories?: string[];
  };
  limit?: number;
  threshold?: number; // Similarity threshold for semantic search
}

export interface MemorySearchResult {
  episodic: {
    memories: EpisodicMemory[];
    scores: number[];
  };
  semantic: {
    memories: SemanticMemory[];
    scores: number[];
  };
  context: MemoryContext;
}

export interface MemoryServiceConfig {
  neo4j: {
    uri: string;
    username: string;
    password: string;
    database?: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  embedding: {
    model: string;
    dimensions: number;
  };
  semanticExtraction: {
    enabled: boolean;
    minConfidence: number;
    maxConceptsPerMemory: number;
    enableRelationshipExtraction: boolean;
    categories: string[];
    batchSize: number;
  };
}

export interface MemoryService {
  // Episodic memory operations
  storeEpisodicMemory(memory: Omit<EpisodicMemory, 'id'>): Promise<EpisodicMemory>;
  getEpisodicMemory(id: string): Promise<EpisodicMemory | null>;
  searchEpisodicMemories(query: MemorySearchQuery): Promise<EpisodicMemory[]>;
  updateEpisodicMemory(id: string, updates: Partial<EpisodicMemory>): Promise<EpisodicMemory>;
  deleteEpisodicMemory(id: string): Promise<boolean>;

  // Semantic memory operations
  storeSemanticMemory(memory: Omit<SemanticMemory, 'id' | 'vector'>): Promise<SemanticMemory>;
  getSemanticMemory(id: string): Promise<SemanticMemory | null>;
  searchSemanticMemories(query: MemorySearchQuery): Promise<SemanticMemory[]>;
  updateSemanticMemory(id: string, updates: Partial<SemanticMemory>): Promise<SemanticMemory>;
  deleteSemanticMemory(id: string): Promise<boolean>;

  // Context operations
  getMemoryContext(userId: string, sessionId: string): Promise<MemoryContext>;
  searchMemories(query: MemorySearchQuery): Promise<MemorySearchResult>;
  
  // Relationship operations
  createMemoryRelationship(
    sourceId: string, 
    targetId: string, 
    relationshipType: string
  ): Promise<boolean>;
  getRelatedMemories(memoryId: string, relationshipType?: string): Promise<{
    episodic: EpisodicMemory[];
    semantic: SemanticMemory[];
  }>;

  // Utility operations
  clearUserMemories(userId: string): Promise<boolean>;
  getMemoryStats(userId: string): Promise<{
    episodic: { count: number; oldest: Date | null; newest: Date | null };
    semantic: { count: number; categories: string[] };
  }>;

  // Semantic extraction operations
  extractSemanticFromEpisodic(userId: string, sessionId?: string): Promise<{
    extractedConcepts: number;
    extractedRelationships: number;
    processingTime: number;
  }>;
  getSemanticExtractionStats(userId: string): Promise<{
    totalExtractions: number;
    averageConfidence: number;
    conceptsByCategory: Record<string, number>;
    lastExtraction: Date | null;
  }>;
}
