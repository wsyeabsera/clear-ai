import { EpisodicMemory, SemanticMemory } from '../types/memory';

export interface SemanticExtractionResult {
  concepts: ExtractedConcept[];
  relationships: ExtractedRelationship[];
  confidence: number;
  processingTime: number;
}

export interface ExtractedConcept {
  concept: string;
  description: string;
  category: string;
  confidence: number;
  sourceMemoryId: string;
  keywords: string[];
}

export interface ExtractedRelationship {
  sourceConcept: string;
  targetConcept: string;
  relationshipType: 'similar' | 'parent' | 'child' | 'related' | 'opposite' | 'causes' | 'part_of' | 'instance_of';
  confidence: number;
  description: string;
}

export interface SemanticExtractionConfig {
  minConfidence: number;
  maxConceptsPerMemory: number;
  enableRelationshipExtraction: boolean;
  categories: string[];
}

export class SemanticExtractorService {
  private config: SemanticExtractionConfig;

  constructor(config: SemanticExtractionConfig) {
    this.config = config;
  }

  /**
   * Extract semantic information from episodic memories using an LLM service
   */
  async extractSemanticInfo(
    episodicMemories: EpisodicMemory[],
    llmService: { complete: (prompt: string, options?: any) => Promise<{ content: string }> }
  ): Promise<SemanticExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Process memories in batches to avoid overwhelming the LLM
      const batchSize = 5;
      const batches = this.chunkArray(episodicMemories, batchSize);
      
      const allConcepts: ExtractedConcept[] = [];
      const allRelationships: ExtractedRelationship[] = [];
      let totalConfidence = 0;
      let processedBatches = 0;

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch, llmService);
        allConcepts.push(...batchResult.concepts);
        allRelationships.push(...batchResult.relationships);
        totalConfidence += batchResult.confidence;
        processedBatches++;
      }

      const averageConfidence = processedBatches > 0 ? totalConfidence / processedBatches : 0;
      const processingTime = Date.now() - startTime;

      return {
        concepts: allConcepts,
        relationships: allRelationships,
        confidence: averageConfidence,
        processingTime
      };
    } catch (error) {
      console.error('Failed to extract semantic information:', error);
      throw error;
    }
  }

  /**
   * Process a batch of episodic memories
   */
  private async processBatch(
    episodicMemories: EpisodicMemory[],
    llmService: { complete: (prompt: string, options?: any) => Promise<{ content: string }> }
  ): Promise<{
    concepts: ExtractedConcept[];
    relationships: ExtractedRelationship[];
    confidence: number;
  }> {
    const memoryTexts = episodicMemories.map(memory => 
      `Memory ID: ${memory.id}\n` +
      `Content: ${memory.content}\n` +
      `Context: ${JSON.stringify(memory.context)}\n` +
      `Tags: ${memory.metadata.tags.join(', ')}\n` +
      `Importance: ${memory.metadata.importance}\n` +
      `Timestamp: ${memory.timestamp.toISOString()}\n`
    ).join('\n---\n');

    const prompt = this.buildExtractionPrompt(memoryTexts);
    
    try {
      const response = await llmService.complete(prompt, {
        temperature: 0.3,
        maxTokens: 2000
      });

      return this.parseExtractionResponse(response.content, episodicMemories);
    } catch (error) {
      console.error('Failed to process batch with LLM:', error);
      // Return empty result on error
      return {
        concepts: [],
        relationships: [],
        confidence: 0
      };
    }
  }

  /**
   * Build the prompt for semantic extraction
   */
  private buildExtractionPrompt(memoryTexts: string): string {
    return `You are an AI assistant specialized in extracting semantic information from episodic memories. Your task is to identify key concepts, their relationships, and categorize them.

Available categories: ${this.config.categories.join(', ')}

Instructions:
1. Extract only the most important concepts from the memories
2. For each concept, provide a clear description and assign it to the most appropriate category
3. Identify relationships between concepts
4. Assign confidence scores (0-1) based on how clear and well-defined the concept/relationship is
5. Extract keywords that help identify the concept
6. Limit to maximum ${this.config.maxConceptsPerMemory} concepts per memory

Memory Data:
${memoryTexts}

Please respond with a JSON object in this exact format:
{
  "concepts": [
    {
      "concept": "concept_name",
      "description": "clear description of the concept",
      "category": "category_name",
      "confidence": 0.8,
      "sourceMemoryId": "memory_id",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "relationships": [
    {
      "sourceConcept": "concept1",
      "targetConcept": "concept2", 
      "relationshipType": "similar|parent|child|related|opposite|causes|part_of|instance_of",
      "confidence": 0.7,
      "description": "description of the relationship"
    }
  ],
  "confidence": 0.75
}

Only include concepts with confidence >= ${this.config.minConfidence}.`;
  }

  /**
   * Parse the LLM response into structured data
   */
  private parseExtractionResponse(response: string, episodicMemories: EpisodicMemory[]): {
    concepts: ExtractedConcept[];
    relationships: ExtractedRelationship[];
    confidence: number;
  } {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and filter concepts
      const concepts: ExtractedConcept[] = (parsed.concepts || [])
        .filter((c: any) => 
          c.concept && 
          c.description && 
          c.category && 
          c.confidence >= this.config.minConfidence &&
          this.config.categories.includes(c.category)
        )
        .map((c: any) => ({
          concept: c.concept.trim(),
          description: c.description.trim(),
          category: c.category.trim(),
          confidence: Math.min(1, Math.max(0, c.confidence)),
          sourceMemoryId: c.sourceMemoryId || episodicMemories[0]?.id || 'unknown',
          keywords: Array.isArray(c.keywords) ? c.keywords : []
        }));

      // Validate and filter relationships
      const relationships: ExtractedRelationship[] = (parsed.relationships || [])
        .filter((r: any) => 
          r.sourceConcept && 
          r.targetConcept && 
          r.relationshipType &&
          r.confidence >= this.config.minConfidence
        )
        .map((r: any) => ({
          sourceConcept: r.sourceConcept.trim(),
          targetConcept: r.targetConcept.trim(),
          relationshipType: r.relationshipType,
          confidence: Math.min(1, Math.max(0, r.confidence)),
          description: r.description || ''
        }));

      return {
        concepts,
        relationships,
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0))
      };
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      return {
        concepts: [],
        relationships: [],
        confidence: 0
      };
    }
  }

  /**
   * Convert extracted concepts to semantic memories
   */
  convertToSemanticMemories(
    extractedConcepts: ExtractedConcept[], 
    userId: string,
    baseVector: number[] = []
  ): Omit<SemanticMemory, 'id' | 'vector'>[] {
    return extractedConcepts.map(concept => ({
      userId,
      concept: concept.concept,
      description: concept.description,
      metadata: {
        category: concept.category,
        confidence: concept.confidence,
        source: 'semantic_extraction',
        lastAccessed: new Date(),
        accessCount: 0
      },
      relationships: {
        similar: [],
        parent: undefined,
        children: []
      }
    }));
  }

  /**
   * Build relationships between semantic memories
   */
  buildSemanticRelationships(
    semanticMemories: SemanticMemory[],
    extractedRelationships: ExtractedRelationship[]
  ): Map<string, Partial<SemanticMemory>> {
    const updates = new Map<string, Partial<SemanticMemory>>();

    for (const relationship of extractedRelationships) {
      const sourceMemory = semanticMemories.find(m => m.concept === relationship.sourceConcept);
      const targetMemory = semanticMemories.find(m => m.concept === relationship.targetConcept);

      if (!sourceMemory || !targetMemory) continue;

      // Update source memory relationships
      if (!updates.has(sourceMemory.id)) {
        updates.set(sourceMemory.id, { relationships: { ...sourceMemory.relationships } });
      }

      const sourceUpdate = updates.get(sourceMemory.id)!;
      if (!sourceUpdate.relationships) sourceUpdate.relationships = { ...sourceMemory.relationships };

      switch (relationship.relationshipType) {
        case 'similar':
          if (!sourceUpdate.relationships.similar) sourceUpdate.relationships.similar = [];
          if (!sourceUpdate.relationships.similar.includes(targetMemory.id)) {
            sourceUpdate.relationships.similar.push(targetMemory.id);
          }
          break;
        case 'parent':
          sourceUpdate.relationships.parent = targetMemory.id;
          break;
        case 'child':
          if (!sourceUpdate.relationships.children) sourceUpdate.relationships.children = [];
          if (!sourceUpdate.relationships.children.includes(targetMemory.id)) {
            sourceUpdate.relationships.children.push(targetMemory.id);
          }
          break;
        case 'related':
          if (!sourceUpdate.relationships.similar) sourceUpdate.relationships.similar = [];
          if (!sourceUpdate.relationships.similar.includes(targetMemory.id)) {
            sourceUpdate.relationships.similar.push(targetMemory.id);
          }
          break;
      }
    }

    return updates;
  }

  /**
   * Utility function to chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get extraction statistics
   */
  getExtractionStats(result: SemanticExtractionResult): {
    totalConcepts: number;
    totalRelationships: number;
    averageConfidence: number;
    processingTime: number;
    conceptsByCategory: Record<string, number>;
  } {
    const conceptsByCategory = result.concepts.reduce((acc, concept) => {
      acc[concept.category] = (acc[concept.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConcepts: result.concepts.length,
      totalRelationships: result.relationships.length,
      averageConfidence: result.confidence,
      processingTime: result.processingTime,
      conceptsByCategory
    };
  }
}
