import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import { SemanticMemory, MemoryServiceConfig } from '../types/memory';

export class PineconeMemoryService {
  private pinecone: Pinecone;
  private index: any;
  private config: MemoryServiceConfig['pinecone'];
  private embeddingModel: any; // Will be injected from LangChain service

  constructor(config: MemoryServiceConfig['pinecone']) {
    this.config = config;
    
    // Only initialize Pinecone client if we have valid credentials
    if (config.apiKey && config.apiKey !== '') {
      try {
        this.pinecone = new Pinecone({
          apiKey: config.apiKey
        });
        console.log('✅ Pinecone client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Pinecone client:', error);
        this.pinecone = null as any;
      }
    } else {
      console.log('⚠️ Pinecone API key not provided, Pinecone client not initialized');
      this.pinecone = null as any;
    }
  }

  async initialize(embeddingModel: any): Promise<void> {
    try {
      // Check if we have valid Pinecone credentials
      if (!this.pinecone) {
        console.log('⚠️ Pinecone client not initialized, skipping Pinecone initialization');
        return;
      }

      // embeddingModel can be null if using Ollama directly
      this.embeddingModel = embeddingModel;
      this.index = this.pinecone.index(this.config.indexName);
      
      // Check if index exists, create if not
      try {
        const indexList = await this.pinecone.listIndexes();
        const indexExists = (indexList as any).indexes?.some((index: any) => index.name === this.config.indexName);
        
        if (!indexExists) {
          console.log(`Creating Pinecone index: ${this.config.indexName}`);
          await this.pinecone.createIndex({
            name: this.config.indexName,
            dimension: 768, // Nomic embed text dimension
            metric: 'cosine',
            spec: {
              serverless: {
                cloud: 'aws',
                region: 'us-east-1'
              }
            }
          });

          // Wait for index to be ready
          await this.waitForIndexReady();
        }
      } catch (error) {
        console.log(`Index ${this.config.indexName} may already exist or there was an error checking:`, error);
        // Continue anyway - the index might exist
      }
      
      console.log('Pinecone memory service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pinecone memory service:', error);
      throw error;
    }
  }

  private async waitForIndexReady(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const indexDescription = await this.pinecone.describeIndex(this.config.indexName);
        if (indexDescription.status?.ready) {
          return;
        }
      } catch (error) {
        // Index might not be ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Pinecone index did not become ready in time');
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Ollama's embedding endpoint directly
      const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Failed to generate embedding with Ollama:', error);
      throw error;
    }
  }

  async storeSemanticMemory(memory: Omit<SemanticMemory, 'id' | 'vector'>): Promise<SemanticMemory> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    const id = uuidv4();
    
    // Generate embedding for the concept and description
    const embeddingText = `${memory.concept}: ${memory.description}`;
    const vector = await this.generateEmbedding(embeddingText);
    
    const semanticMemory: SemanticMemory = {
      ...memory,
      id,
      vector
    };

    try {
      // Store in Pinecone
      await this.index.upsert([{
        id,
        values: vector,
        metadata: {
          userId: memory.userId,
          concept: memory.concept,
          description: memory.description,
          category: memory.metadata.category,
          confidence: memory.metadata.confidence,
          source: memory.metadata.source,
          lastAccessed: new Date(memory.metadata.lastAccessed).toISOString(),
          accessCount: memory.metadata.accessCount,
          relationships: JSON.stringify(memory.relationships),
          extractionMetadata: memory.metadata.extractionMetadata ? JSON.stringify(memory.metadata.extractionMetadata) : "{}"
        }
      }]);

      return semanticMemory;
    } catch (error) {
      console.error('Failed to store semantic memory:', error);
      throw error;
    }
  }

  async getSemanticMemory(id: string): Promise<SemanticMemory | null> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      const result = await this.index.fetch([id]);
      
      if (!result.vectors || !result.vectors[id]) {
        return null;
      }

      const vectorData = result.vectors[id];
      const metadata = vectorData.metadata;

      return {
        id,
        userId: metadata.userId,
        concept: metadata.concept,
        description: metadata.description,
        vector: vectorData.values,
        metadata: {
          category: metadata.category,
          confidence: metadata.confidence,
          source: metadata.source,
          lastAccessed: new Date(metadata.lastAccessed),
          accessCount: metadata.accessCount,
          extractionMetadata: metadata.extractionMetadata ? JSON.parse(metadata.extractionMetadata) : undefined
        },
        relationships: JSON.parse(metadata.relationships)
      };
    } catch (error) {
      console.error('Failed to get semantic memory:', error);
      throw error;
    }
  }

  async searchSemanticMemories(query: {
    userId: string;
    query: string;
    categories?: string[];
    threshold?: number;
    limit?: number;
  }): Promise<{ memories: SemanticMemory[]; scores: number[] }> {
    try {
      // Generate embedding for the search query
      const queryVector = await this.generateEmbedding(query.query);
      
      // Build filter for user and categories
      const filter: any = { userId: { $eq: query.userId } };
      if (query.categories && query.categories.length > 0) {
        filter.category = { $in: query.categories };
      }

      // Search in Pinecone
      const searchResult = await this.index.query({
        vector: queryVector,
        filter,
        topK: query.limit || 10,
        includeMetadata: true,
        includeValues: true
      });

      const memories: SemanticMemory[] = [];
      const scores: number[] = [];

      if (searchResult.matches) {
        for (const match of searchResult.matches) {
          // Apply threshold filter
          if (query.threshold && match.score < query.threshold) {
            continue;
          }

          const metadata = match.metadata;
          memories.push({
            id: match.id,
            userId: metadata.userId,
            concept: metadata.concept,
            description: metadata.description,
            vector: match.values || [],
            metadata: {
              category: metadata.category,
              confidence: metadata.confidence,
              source: metadata.source,
              lastAccessed: new Date(metadata.lastAccessed),
              accessCount: metadata.accessCount,
              extractionMetadata: metadata.extractionMetadata ? JSON.parse(metadata.extractionMetadata) : undefined
            },
            relationships: JSON.parse(metadata.relationships)
          });
          scores.push(match.score || 0);
        }
      }

      return { memories, scores };
    } catch (error) {
      console.error('Failed to search semantic memories:', error);
      throw error;
    }
  }

  async updateSemanticMemory(id: string, updates: Partial<SemanticMemory>): Promise<SemanticMemory> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      // Get existing memory
      const existing = await this.getSemanticMemory(id);
      if (!existing) {
        throw new Error('Semantic memory not found');
      }

      // Update fields
      const updated: SemanticMemory = {
        ...existing,
        ...updates,
        id // Ensure ID doesn't change
      };

      // If concept or description changed, regenerate embedding
      if (updates.concept || updates.description) {
        const embeddingText = `${updated.concept}: ${updated.description}`;
        updated.vector = await this.generateEmbedding(embeddingText);
      }

      // Update in Pinecone
      await this.index.upsert([{
        id,
        values: updated.vector,
        metadata: {
          userId: updated.userId,
          concept: updated.concept,
          description: updated.description,
          category: updated.metadata.category,
          confidence: updated.metadata.confidence,
          source: updated.metadata.source,
          lastAccessed: new Date(updated.metadata.lastAccessed).toISOString(),
          accessCount: updated.metadata.accessCount,
          relationships: JSON.stringify(updated.relationships),
          extractionMetadata: updated.metadata.extractionMetadata ? JSON.stringify(updated.metadata.extractionMetadata) : "{}"
        }
      }]);

      return updated;
    } catch (error) {
      console.error('Failed to update semantic memory:', error);
      throw error;
    }
  }

  async deleteSemanticMemory(id: string): Promise<boolean> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      await this.index.deleteOne(id);
      return true;
    } catch (error) {
      console.error('Failed to delete semantic memory:', error);
      return false;
    }
  }

  async getRelatedMemories(memoryId: string, relationshipType?: string): Promise<SemanticMemory[]> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      // Get the memory first
      const memory = await this.getSemanticMemory(memoryId);
      if (!memory) {
        return [];
      }

      // Search for similar memories using the vector
      const searchResult = await this.index.query({
        vector: memory.vector,
        filter: { 
          userId: { $eq: memory.userId },
          id: { $ne: memoryId } // Exclude the original memory
        },
        topK: 10,
        includeMetadata: true,
        includeValues: true
      });

      const memories: SemanticMemory[] = [];

      if (searchResult.matches) {
        for (const match of searchResult.matches) {
          const metadata = match.metadata;
          memories.push({
            id: match.id,
            userId: metadata.userId,
            concept: metadata.concept,
            description: metadata.description,
            vector: match.values || [],
            metadata: {
              category: metadata.category,
              confidence: metadata.confidence,
              source: metadata.source,
              lastAccessed: new Date(metadata.lastAccessed),
              accessCount: metadata.accessCount,
              extractionMetadata: metadata.extractionMetadata ? JSON.parse(metadata.extractionMetadata) : undefined
            },
            relationships: JSON.parse(metadata.relationships)
          });
        }
      }

      return memories;
    } catch (error) {
      console.error('Failed to get related semantic memories:', error);
      throw error;
    }
  }

  async clearUserMemories(userId: string): Promise<boolean> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      await this.index.deleteMany({
        filter: { userId: { $eq: userId } }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear user semantic memories:', error);
      return false;
    }
  }

  async getMemoryStats(userId: string): Promise<{
    count: number;
    categories: string[];
  }> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please provide valid Pinecone credentials.');
    }
    
    try {
      // Get all memories for the user
      const searchResult = await this.index.query({
        vector: new Array(768).fill(0), // Dummy vector for metadata-only search (768 = nomic-embed-text dimension)
        filter: { userId: { $eq: userId } },
        topK: 10000, // Large number to get all
        includeMetadata: true
      });

      const categories = new Set<string>();
      let count = 0;

      if (searchResult.matches) {
        count = searchResult.matches.length;
        for (const match of searchResult.matches) {
          if (match.metadata?.category) {
            categories.add(match.metadata.category);
          }
        }
      }

      return {
        count,
        categories: Array.from(categories)
      };
    } catch (error) {
      console.error('Failed to get semantic memory stats:', error);
      return { count: 0, categories: [] };
    }
  }
}
