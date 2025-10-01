import { EpisodicMemory, SemanticMemory } from '../types/memory';
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService';
import { parseLLMJsonResponse } from '../utils';

export interface RelationshipPattern {
  id: string;
  type: 'hierarchical' | 'associative' | 'temporal' | 'causal' | 'semantic';
  source: string;
  target: string;
  confidence: number;
  description: string;
  metadata: {
    strength: number;
    context: string[];
    keywords: string[];
    apiEndpoints?: string[];
  };
}

export interface DataStructureAnalysis {
  patterns: RelationshipPattern[];
  hierarchies: {
    root: string;
    levels: Array<{
      level: number;
      entities: string[];
      relationships: string[];
    }>;
  }[];
  semanticClusters: {
    clusterId: string;
    entities: string[];
    commonThemes: string[];
    strength: number;
  }[];
  crossReferences: {
    entity: string;
    references: Array<{
      target: string;
      relationshipType: string;
      context: string;
    }>;
  }[];
}

export interface APIDataInsight {
  resourceType: string;
  structure: {
    fields: string[];
    relationships: string[];
    patterns: string[];
  };
  relationships: {
    with: string[];
    type: string;
    cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
  }[];
  usage: {
    frequency: number;
    contexts: string[];
    importance: number;
  };
}

export class RelationshipAnalysisService {
  private langchainService: SimpleLangChainService;
  private config: {
    minConfidence: number;
    maxPatterns: number;
    enableHierarchyAnalysis: boolean;
    enableSemanticClustering: boolean;
  };

  constructor(langchainConfig: CoreKeysAndModels, config?: Partial<RelationshipAnalysisService['config']>) {
    this.langchainService = new SimpleLangChainService(langchainConfig);
    this.config = {
      minConfidence: 0.6,
      maxPatterns: 50,
      enableHierarchyAnalysis: true,
      enableSemanticClustering: true,
      ...config
    };
  }

  /**
   * Analyze relationships in API data from episodic memories
   */
  async analyzeAPIRelationships(memories: EpisodicMemory[]): Promise<DataStructureAnalysis> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json') ||
      m.metadata.tags?.includes('api_call')
    );

    if (apiMemories.length === 0) {
      return {
        patterns: [],
        hierarchies: [],
        semanticClusters: [],
        crossReferences: []
      };
    }

    // Extract API data patterns
    const patterns = await this.extractRelationshipPatterns(apiMemories);

    // Build hierarchies
    const hierarchies = this.buildHierarchies(patterns);

    // Create semantic clusters
    const semanticClusters = await this.createSemanticClusters(apiMemories, patterns);

    // Find cross-references
    const crossReferences = this.findCrossReferences(patterns);

    return {
      patterns,
      hierarchies,
      semanticClusters,
      crossReferences
    };
  }

  /**
   * Extract relationship patterns from API data
   */
  private async extractRelationshipPatterns(memories: EpisodicMemory[]): Promise<RelationshipPattern[]> {
    const memoryTexts = memories.map(m => m.content).join('\n\n');

    const prompt = `Analyze the following API data and extract relationship patterns. Look for:
1. Hierarchical relationships (parent-child, owner-owned)
2. Associative relationships (related entities, references)
3. Temporal relationships (sequence, dependencies)
4. Causal relationships (cause-effect, triggers)
5. Semantic relationships (similar concepts, categories)

API Data:
${memoryTexts}

Return a JSON object with this structure:
{
  "patterns": [
    {
      "id": "pattern_1",
      "type": "hierarchical|associative|temporal|causal|semantic",
      "source": "entity1",
      "target": "entity2",
      "confidence": 0.8,
      "description": "Brief description of the relationship",
      "metadata": {
        "strength": 0.7,
        "context": ["context1", "context2"],
        "keywords": ["keyword1", "keyword2"],
        "apiEndpoints": ["/users", "/posts"]
      }
    }
  ]
}

Focus on API-specific relationships like:
- User -> Posts (one-to-many)
- Posts -> Comments (one-to-many)
- Albums -> Photos (one-to-many)
- Data flow patterns
- Resource dependencies
- API structure patterns

Minimum confidence: ${this.config.minConfidence}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.3,
        metadata: {
          service: 'RelationshipAnalysisService',
          method: 'extractRelationshipPatterns'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse relationship patterns JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return [];
      }

      const parsed = parseResult.data;
      return (parsed.patterns || []).filter((p: any) => p.confidence >= this.config.minConfidence);
    } catch (error) {
      console.error('Failed to extract relationship patterns:', error);
      return [];
    }
  }

  /**
   * Build hierarchical structures from patterns
   */
  private buildHierarchies(patterns: RelationshipPattern[]): DataStructureAnalysis['hierarchies'] {
    const hierarchies: DataStructureAnalysis['hierarchies'] = [];
    const hierarchicalPatterns = patterns.filter(p => p.type === 'hierarchical');

    // Group by root entities
    const rootGroups = new Map<string, RelationshipPattern[]>();

    for (const pattern of hierarchicalPatterns) {
      // Determine if this is a root or child relationship
      const isChild = hierarchicalPatterns.some(p => p.target === pattern.source);

      if (!isChild) {
        if (!rootGroups.has(pattern.source)) {
          rootGroups.set(pattern.source, []);
        }
        rootGroups.get(pattern.source)!.push(pattern);
      }
    }

    // Build hierarchy levels for each root
    for (const [root, patterns] of rootGroups) {
      const hierarchy = {
        root,
        levels: [] as Array<{
          level: number;
          entities: string[];
          relationships: string[];
        }>
      };

      // Level 0: Root
      hierarchy.levels.push({
        level: 0,
        entities: [root],
        relationships: []
      });

      // Build subsequent levels
      let currentLevel = 0;
      let currentEntities = [root];
      const processed = new Set([root]);

      while (currentEntities.length > 0) {
        const nextLevel = currentLevel + 1;
        const nextEntities: string[] = [];
        const nextRelationships: string[] = [];

        for (const entity of currentEntities) {
          const children = patterns.filter(p => p.source === entity);
          for (const child of children) {
            if (!processed.has(child.target)) {
              nextEntities.push(child.target);
              nextRelationships.push(child.description);
              processed.add(child.target);
            }
          }
        }

        if (nextEntities.length > 0) {
          hierarchy.levels.push({
            level: nextLevel,
            entities: nextEntities,
            relationships: nextRelationships
          });
          currentEntities = nextEntities;
          currentLevel = nextLevel;
        } else {
          break;
        }
      }

      hierarchies.push(hierarchy);
    }

    return hierarchies;
  }

  /**
   * Create semantic clusters from API data
   */
  private async createSemanticClusters(
    memories: EpisodicMemory[],
    patterns: RelationshipPattern[]
  ): Promise<DataStructureAnalysis['semanticClusters']> {
    if (!this.config.enableSemanticClustering) {
      return [];
    }

    const entities = new Set<string>();
    patterns.forEach(p => {
      entities.add(p.source);
      entities.add(p.target);
    });

    const entityList = Array.from(entities);
    if (entityList.length < 2) {
      return [];
    }

    const prompt = `Group the following API entities into semantic clusters based on their functionality and relationships:

Entities: ${entityList.join(', ')}

Consider:
- Functional similarity (e.g., user management, content management)
- Data structure similarity
- API endpoint patterns
- Usage contexts

Return JSON:
{
  "clusters": [
    {
      "clusterId": "cluster_1",
      "entities": ["entity1", "entity2"],
      "commonThemes": ["theme1", "theme2"],
      "strength": 0.8
    }
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.4,
        metadata: {
          service: 'RelationshipAnalysisService',
          method: 'createSemanticClusters'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse relationship clusters JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return [];
      }

      const parsed = parseResult.data;
      return parsed.clusters || [];
    } catch (error) {
      console.error('Failed to create semantic clusters:', error);
      return [];
    }
  }

  /**
   * Find cross-references between entities
   */
  private findCrossReferences(patterns: RelationshipPattern[]): DataStructureAnalysis['crossReferences'] {
    const crossRefs = new Map<string, Array<{
      target: string;
      relationshipType: string;
      context: string;
    }>>();

    for (const pattern of patterns) {
      if (!crossRefs.has(pattern.source)) {
        crossRefs.set(pattern.source, []);
      }

      crossRefs.get(pattern.source)!.push({
        target: pattern.target,
        relationshipType: pattern.type,
        context: pattern.description
      });
    }

    return Array.from(crossRefs.entries()).map(([entity, references]) => ({
      entity,
      references
    }));
  }

  /**
   * Generate insights about API data structure
   */
  async generateAPIInsights(memories: EpisodicMemory[]): Promise<APIDataInsight[]> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json')
    );

    if (apiMemories.length === 0) {
      return [];
    }

    const memoryTexts = apiMemories.map(m => m.content).join('\n\n');

    const prompt = `Analyze the following API data and generate insights about the data structure and relationships:

${memoryTexts}

For each distinct API resource type, provide:
1. Structure analysis (fields, relationships, patterns)
2. Relationship mapping (what it relates to and how)
3. Usage patterns (frequency, contexts, importance)

Return JSON:
{
  "insights": [
    {
      "resourceType": "users",
      "structure": {
        "fields": ["id", "name", "email", "username"],
        "relationships": ["posts", "comments", "albums"],
        "patterns": ["unique_id", "personal_info", "content_owner"]
      },
      "relationships": [
        {
          "with": "posts",
          "type": "one-to-many",
          "cardinality": "one-to-many"
        }
      ],
      "usage": {
        "frequency": 0.8,
        "contexts": ["user_management", "content_creation"],
        "importance": 0.9
      }
    }
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.3,
        metadata: {
          service: 'RelationshipAnalysisService',
          method: 'generateAPIInsights'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse API insights JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return [];
      }

      const parsed = parseResult.data;
      return parsed.insights || [];
    } catch (error) {
      console.error('Failed to generate API insights:', error);
      return [];
    }
  }

  /**
   * Find patterns across multiple API calls
   */
  async findCrossAPIPatterns(memories: EpisodicMemory[]): Promise<{
    commonPatterns: string[];
    dataFlow: Array<{
      from: string;
      to: string;
      pattern: string;
      confidence: number;
    }>;
    structuralSimilarities: Array<{
      resources: string[];
      similarities: string[];
      strength: number;
    }>;
  }> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json')
    );

    if (apiMemories.length < 2) {
      return {
        commonPatterns: [],
        dataFlow: [],
        structuralSimilarities: []
      };
    }

    const memoryTexts = apiMemories.map(m => m.content).join('\n\n');

    const prompt = `Analyze the following API calls and identify patterns that span across multiple calls:

${memoryTexts}

Look for:
1. Common patterns in data structure
2. Data flow patterns (how data moves between resources)
3. Structural similarities between different resources
4. Recurring relationship patterns

Return JSON:
{
  "commonPatterns": ["pattern1", "pattern2"],
  "dataFlow": [
    {
      "from": "users",
      "to": "posts",
      "pattern": "user creates posts",
      "confidence": 0.9
    }
  ],
  "structuralSimilarities": [
    {
      "resources": ["posts", "comments"],
      "similarities": ["both have user_id", "both have content fields"],
      "strength": 0.8
    }
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'openai',
        temperature: 0.3,
        metadata: {
          service: 'RelationshipAnalysisService',
          method: 'findCrossAPIPatterns'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse data structure analysis JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return {
          commonPatterns: [],
          dataFlow: [],
          structuralSimilarities: []
        };
      }

      const parsed = parseResult.data;
      return {
        commonPatterns: parsed.commonPatterns || [],
        dataFlow: parsed.dataFlow || [],
        structuralSimilarities: parsed.structuralSimilarities || []
      };
    } catch (error) {
      console.error('Failed to find cross-API patterns:', error);
      return {
        commonPatterns: [],
        dataFlow: [],
        structuralSimilarities: []
      };
    }
  }
}
