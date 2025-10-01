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
    // Additional fields for working memory
    [key: string]: any;
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
  clearSessionMemories(userId: string, sessionId: string): Promise<boolean>;
  clearSemanticMemories(userId: string): Promise<boolean>;
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

// Working Memory Service Types
export interface WorkingMemoryContext {
  conversationId: string;
  currentTopic: string;
  conversationState: ConversationState;
  activeGoals: Goal[];
  contextWindow: ContextWindow;
  userProfile: UserProfile;
  sessionMetadata: SessionMetadata;
  lastInteraction: Interaction;
  conversationHistory: ConversationTurn[];
}

export interface ConversationState {
  state: 'greeting' | 'active' | 'planning' | 'waiting' | 'error_recovery';
  topic: string;
  activeGoals: Goal[];
  lastInteraction: Date;
  contextRelevance: number;
}

export interface Goal {
  id: string;
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  subgoals: string[];
  successCriteria: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextWindow {
  startTime: Date;
  endTime: Date;
  relevanceScore: number;
  maxTokens: number;
  currentTokens: number;
  compressionRatio: number;
}

export interface UserProfile {
  preferences: string[];
  communicationStyle: 'conversational' | 'formal' | 'technical' | 'casual';
  formality: 'low' | 'medium' | 'high';
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  interests: string[];
  expertise: string[];
  personality: 'helpful' | 'analytical' | 'creative' | 'practical';
}

export interface SessionMetadata {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  totalInteractions: number;
  averageResponseTime: number;
  sessionGoals: string[];
  contextSwitches: number;
}

export interface Interaction {
  id: string;
  timestamp: Date;
  userInput: string;
  assistantResponse: string;
  intent: string;
  confidence: number;
  toolsUsed: string[];
  memoryRetrieved: number;
}

export interface ConversationTurn {
  turnNumber: number;
  timestamp: Date;
  userInput: string;
  assistantResponse: string;
  intent: string;
  confidence: number;
  contextRelevance: number;
  toolsUsed: string[];
  memoryRetrieved: number;
}

export interface WorkingMemoryServiceConfig {
  cacheEnabled: boolean;
  cacheTTL: number; // in milliseconds
  maxContextHistory: number;
  maxActiveGoals: number;
  topicExtractionModel: string;
  topicExtractionTemperature: number;
  maxTokens: number;
  compressionThreshold: number;
}

export interface WorkingMemoryService {
  // Core methods
  getWorkingMemory(userId: string, sessionId: string): Promise<WorkingMemoryContext>;
  updateWorkingMemory(context: WorkingMemoryContext): Promise<void>;

  // Topic and state management
  extractCurrentTopic(memoryContext: MemoryContext): Promise<string>;
  determineConversationState(memoryContext: MemoryContext): Promise<ConversationState>;

  // Goal management
  extractActiveGoals(memoryContext: MemoryContext): Promise<Goal[]>;
  updateActiveGoals(goals: Goal[]): Promise<void>;
  createGoal(description: string, priority: number, userId: string): Promise<Goal>;
  updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal>;
  completeGoal(goalId: string): Promise<boolean>;

  // User profile management
  buildUserProfile(userId: string, memoryContext: MemoryContext): Promise<UserProfile>;
  updateUserProfile(profile: UserProfile): Promise<void>;

  // Context window management
  buildContextWindow(memoryContext: MemoryContext): Promise<ContextWindow>;
  updateContextWindow(contextWindow: ContextWindow): Promise<void>;
  compressContextWindow(contextWindow: ContextWindow): Promise<ContextWindow>;

  // Session management
  buildSessionMetadata(sessionId: string): Promise<SessionMetadata>;
  storeSessionMetadata(metadata: SessionMetadata): Promise<void>;

  // Interaction tracking
  getLastInteraction(memoryContext: MemoryContext): Promise<Interaction>;
  getConversationHistory(memoryContext: MemoryContext): Promise<ConversationTurn[]>;
  recordInteraction(interaction: Interaction): Promise<void>;

  // Debug and monitoring
  getDebugInfo(userId: string, sessionId: string): Promise<any>;
  getPerformanceMetrics(): Promise<{
    averageRetrievalTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    activeSessions: number;
  }>;
}
