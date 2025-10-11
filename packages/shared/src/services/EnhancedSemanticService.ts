import { EpisodicMemory, SemanticMemory } from '../types/memory';
import { SimpleLangChainService, CoreKeysAndModels } from './SimpleLangChainService';
import { RelationshipAnalysisService, DataStructureAnalysis, APIDataInsight } from './RelationshipAnalysisService';
import { parseLLMJsonResponse } from '../utils';

export interface SemanticConcept {
  id: string;
  concept: string;
  description: string;
  category: string;
  confidence: number;
  context: string[];
  relationships: {
    similar: string[];
    parent: string | null;
    children: string[];
    related: string[];
  };
  metadata: {
    source: string;
    frequency: number;
    importance: number;
    lastSeen: Date;
    keywords: string[];
    apiContext?: {
      endpoints: string[];
      dataTypes: string[];
      patterns: string[];
    };
  };
}

export interface SemanticNetwork {
  concepts: SemanticConcept[];
  relationships: Array<{
    source: string;
    target: string;
    type: string;
    strength: number;
    context: string;
  }>;
  clusters: Array<{
    id: string;
    concepts: string[];
    theme: string;
    strength: number;
  }>;
}

export interface ContextualUnderstanding {
  query: string;
  relevantConcepts: SemanticConcept[];
  relationships: Array<{
    concept: string;
    relationship: string;
    target: string;
    confidence: number;
  }>;
  patterns: string[];
  insights: string[];
  reasoning: string;
}

export class EnhancedSemanticService {
  private langchainService: SimpleLangChainService;
  private relationshipAnalyzer: RelationshipAnalysisService;
  private config: {
    minConfidence: number;
    maxConcepts: number;
    enablePatternRecognition: boolean;
    enableRelationshipReasoning: boolean;
  };

  constructor(langchainConfig: CoreKeysAndModels, config?: Partial<EnhancedSemanticService['config']>) {
    this.langchainService = new SimpleLangChainService(langchainConfig);
    this.relationshipAnalyzer = new RelationshipAnalysisService(langchainConfig);
    this.config = {
      minConfidence: 0.6,
      maxConcepts: 100,
      enablePatternRecognition: true,
      enableRelationshipReasoning: true,
      ...config
    };
  }

  /**
   * Extract enhanced semantic concepts from API data
   */
  async extractEnhancedConcepts(memories: EpisodicMemory[]): Promise<SemanticConcept[]> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json') ||
      m.metadata.tags?.includes('api_call')
    );

    if (apiMemories.length === 0) {
      return [];
    }

    const memoryTexts = apiMemories.map(m => m.content).join('\n\n');

    const prompt = `Analyze the following API data and extract enhanced semantic concepts. Focus on:

1. API-specific concepts (resources, endpoints, data structures)
2. Relationship patterns (hierarchies, associations, dependencies)
3. Data flow patterns (how information moves through the system)
4. Structural patterns (common data formats, naming conventions)
5. Functional patterns (what each resource does, how they interact)

API Data:
${memoryTexts}

For each concept, provide:
- Clear, descriptive name
- Detailed description of what it represents
- Category (API_Resource, Data_Structure, Relationship, Pattern, etc.)
- Confidence score (0-1)
- Context where it appears
- Relationships to other concepts
- Metadata including frequency, importance, and API-specific context

Return JSON:
{
  "concepts": [
    {
      "concept": "user_posts_relationship",
      "description": "One-to-many relationship where users can create multiple posts",
      "category": "Relationship",
      "confidence": 0.95,
      "context": ["user management", "content creation"],
      "relationships": {
        "similar": ["user_comments_relationship"],
        "parent": "user_content_hierarchy",
        "children": ["post_creation", "user_content_management"],
        "related": ["posts", "users", "content_ownership"]
      },
      "metadata": {
        "source": "api_analysis",
        "frequency": 0.8,
        "importance": 0.9,
        "lastSeen": "${new Date().toISOString()}",
        "keywords": ["user", "posts", "relationship", "one-to-many"],
        "apiContext": {
          "endpoints": ["/users", "/posts"],
          "dataTypes": ["User", "Post"],
          "patterns": ["REST API", "JSON response", "foreign key relationship"]
        }
      }
    }
  ]
}

Focus on extracting concepts that show deep understanding of:
- API structure and organization
- Data relationships and dependencies
- Functional patterns and workflows
- Cross-resource interactions
- Data flow and processing patterns`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        metadata: {
          service: 'EnhancedSemanticService',
          method: 'extractEnhancedConcepts'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse enhanced concepts JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return [];
      }

      const parsed = parseResult.data;
      return (parsed.concepts || []).filter((c: any) => c.confidence >= this.config.minConfidence);
    } catch (error) {
      console.error('Failed to extract enhanced concepts:', error);
      return [];
    }
  }

  /**
   * Build a semantic network from concepts and relationships
   */
  async buildSemanticNetwork(concepts: SemanticConcept[], memories: EpisodicMemory[]): Promise<SemanticNetwork> {
    // Analyze relationships in the data
    const relationshipAnalysis = await this.relationshipAnalyzer.analyzeAPIRelationships(memories);

    // Build relationship network
    const relationships: SemanticNetwork['relationships'] = [];

    // Add concept relationships
    for (const concept of concepts) {
      for (const similar of concept.relationships.similar) {
        relationships.push({
          source: concept.concept,
          target: similar,
          type: 'similar',
          strength: 0.8,
          context: 'semantic similarity'
        });
      }

      if (concept.relationships.parent) {
        relationships.push({
          source: concept.concept,
          target: concept.relationships.parent,
          type: 'parent',
          strength: 0.9,
          context: 'hierarchical relationship'
        });
      }

      for (const child of concept.relationships.children) {
        relationships.push({
          source: concept.concept,
          target: child,
          type: 'child',
          strength: 0.9,
          context: 'hierarchical relationship'
        });
      }

      for (const related of concept.relationships.related) {
        relationships.push({
          source: concept.concept,
          target: related,
          type: 'related',
          strength: 0.7,
          context: 'associative relationship'
        });
      }
    }

    // Add pattern-based relationships
    for (const pattern of relationshipAnalysis.patterns) {
      relationships.push({
        source: pattern.source,
        target: pattern.target,
        type: pattern.type,
        strength: pattern.confidence,
        context: pattern.description
      });
    }

    // Create clusters
    const clusters = await this.createSemanticClusters(concepts, relationshipAnalysis);

    return {
      concepts,
      relationships,
      clusters
    };
  }

  /**
   * Create semantic clusters from concepts
   */
  private async createSemanticClusters(
    concepts: SemanticConcept[],
    relationshipAnalysis: DataStructureAnalysis
  ): Promise<SemanticNetwork['clusters']> {
    const conceptNames = concepts.map(c => c.concept);

    const prompt = `Group the following semantic concepts into clusters based on their functional and semantic similarity:

Concepts: ${conceptNames.join(', ')}

Consider:
- Functional similarity (e.g., user management, content management)
- Semantic similarity (e.g., data structures, relationships)
- API context similarity (e.g., same endpoints, similar patterns)
- Hierarchical relationships

Return JSON:
{
  "clusters": [
    {
      "id": "user_management",
      "concepts": ["user", "user_profile", "user_authentication"],
      "theme": "User Management and Authentication",
      "strength": 0.9
    }
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.4,
        metadata: {
          service: 'EnhancedSemanticService',
          method: 'createSemanticClusters'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse semantic clusters JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
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
   * Provide contextual understanding of a query
   */
  async understandContext(
    query: string,
    semanticNetwork: SemanticNetwork,
    memories: EpisodicMemory[]
  ): Promise<ContextualUnderstanding> {
    const prompt = `Given a user query and a semantic network of API concepts, provide deep contextual understanding:

Query: "${query}"

Semantic Network:
Concepts: ${semanticNetwork.concepts.map(c => `${c.concept}: ${c.description}`).join('\n')}

Relationships: ${semanticNetwork.relationships.map(r => `${r.source} -> ${r.target} (${r.type}, strength: ${r.strength})`).join('\n')}

Clusters: ${semanticNetwork.clusters.map(c => `${c.theme}: ${c.concepts.join(', ')}`).join('\n')}

Provide:
1. Most relevant concepts for this query
2. Key relationships that apply to this query
3. Patterns that emerge from the query context
4. Insights about what the user is trying to understand or do
5. Reasoning about how the concepts and relationships relate to the query

Return JSON:
{
  "relevantConcepts": [
    {
      "concept": "concept_name",
      "description": "description",
      "category": "category",
      "confidence": 0.8,
      "context": ["context1", "context2"],
      "relationships": {
        "similar": ["similar1"],
        "parent": "parent_concept",
        "children": ["child1"],
        "related": ["related1"]
      },
      "metadata": {
        "source": "source",
        "frequency": 0.7,
        "importance": 0.8,
        "lastSeen": "2024-01-01T00:00:00.000Z",
        "keywords": ["keyword1", "keyword2"],
        "apiContext": {
          "endpoints": ["/endpoint1"],
          "dataTypes": ["Type1"],
          "patterns": ["pattern1"]
        }
      }
    }
  ],
  "relationships": [
    {
      "concept": "concept1",
      "relationship": "relates_to",
      "target": "concept2",
      "confidence": 0.8
    }
  ],
  "patterns": ["pattern1", "pattern2"],
  "insights": ["insight1", "insight2"],
  "reasoning": "Detailed reasoning about how the concepts and relationships apply to the query"
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        metadata: {
          service: 'EnhancedSemanticService',
          method: 'understandContext'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse context understanding JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return {
          query,
          relevantConcepts: [],
          relationships: [],
          patterns: [],
          insights: [],
          reasoning: 'Failed to parse context analysis'
        };
      }

      const parsed = parseResult.data;
      return {
        query,
        relevantConcepts: parsed.relevantConcepts || [],
        relationships: parsed.relationships || [],
        patterns: parsed.patterns || [],
        insights: parsed.insights || [],
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      console.error('Failed to understand context:', error);
      return {
        query,
        relevantConcepts: [],
        relationships: [],
        patterns: [],
        insights: [],
        reasoning: 'Failed to analyze context'
      };
    }
  }

  /**
   * Generate advanced pattern recognition insights
   */
  async recognizeAdvancedPatterns(memories: EpisodicMemory[]): Promise<{
    structuralPatterns: string[];
    behavioralPatterns: string[];
    dataFlowPatterns: string[];
    relationshipPatterns: string[];
    insights: string[];
  }> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json')
    );

    if (apiMemories.length === 0) {
      return {
        structuralPatterns: [],
        behavioralPatterns: [],
        dataFlowPatterns: [],
        relationshipPatterns: [],
        insights: []
      };
    }

    const memoryTexts = apiMemories.map(m => m.content).join('\n\n');

    const prompt = `Analyze the following API data for advanced patterns. Look for:

1. Structural Patterns: Common data structures, naming conventions, organization patterns
2. Behavioral Patterns: How the API behaves, common workflows, usage patterns
3. Data Flow Patterns: How data moves through the system, transformation patterns
4. Relationship Patterns: How different resources relate to each other, dependency patterns

API Data:
${memoryTexts}

Return JSON:
{
  "structuralPatterns": [
    "All resources have unique IDs",
    "Consistent JSON structure across endpoints",
    "RESTful naming conventions"
  ],
  "behavioralPatterns": [
    "Users create content (posts, comments)",
    "Content can be retrieved by user or resource ID",
    "Hierarchical data organization"
  ],
  "dataFlowPatterns": [
    "User -> Posts -> Comments flow",
    "Album -> Photos relationship",
    "Data aggregation patterns"
  ],
  "relationshipPatterns": [
    "One-to-many relationships dominate",
    "Foreign key relationships between resources",
    "Hierarchical content organization"
  ],
  "insights": [
    "This is a content management API with user-centric design",
    "Strong hierarchical relationships between resources",
    "Consistent RESTful patterns throughout"
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.3,
        metadata: {
          service: 'EnhancedSemanticService',
          method: 'recognizeAdvancedPatterns'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse advanced patterns JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return {
          structuralPatterns: [],
          behavioralPatterns: [],
          dataFlowPatterns: [],
          relationshipPatterns: [],
          insights: []
        };
      }

      const parsed = parseResult.data;
      return {
        structuralPatterns: parsed.structuralPatterns || [],
        behavioralPatterns: parsed.behavioralPatterns || [],
        dataFlowPatterns: parsed.dataFlowPatterns || [],
        relationshipPatterns: parsed.relationshipPatterns || [],
        insights: parsed.insights || []
      };
    } catch (error) {
      console.error('Failed to recognize advanced patterns:', error);
      return {
        structuralPatterns: [],
        behavioralPatterns: [],
        dataFlowPatterns: [],
        relationshipPatterns: [],
        insights: []
      };
    }
  }

  /**
   * Generate learning insights from API interactions
   */
  async generateLearningInsights(memories: EpisodicMemory[]): Promise<{
    learnedConcepts: string[];
    improvedUnderstanding: string[];
    newPatterns: string[];
    recommendations: string[];
  }> {
    const apiMemories = memories.filter(m =>
      m.content.includes('api') ||
      m.content.includes('http') ||
      m.content.includes('json')
    );

    if (apiMemories.length < 2) {
      return {
        learnedConcepts: [],
        improvedUnderstanding: [],
        newPatterns: [],
        recommendations: []
      };
    }

    // Sort memories by timestamp to see progression
    const sortedMemories = apiMemories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const prompt = `Analyze the progression of API understanding across these interactions. Look for:

1. Concepts that were learned over time
2. Understanding that improved with more data
3. New patterns that emerged from multiple interactions
4. Recommendations for better API understanding

API Interactions (chronological):
${sortedMemories.map((m, i) => `Interaction ${i + 1} (${m.timestamp.toISOString()}): ${m.content}`).join('\n\n')}

Return JSON:
{
  "learnedConcepts": [
    "User-Post relationship is one-to-many",
    "Comments are associated with posts",
    "Albums contain multiple photos"
  ],
  "improvedUnderstanding": [
    "Better grasp of data hierarchy",
    "Understanding of foreign key relationships",
    "Recognition of RESTful patterns"
  ],
  "newPatterns": [
    "Data aggregation patterns",
    "Cross-resource query patterns",
    "API response consistency patterns"
  ],
  "recommendations": [
    "Focus on relationship mapping",
    "Study data flow patterns",
    "Analyze API structure consistency"
  ]
}`;

    try {
      const response = await this.langchainService.complete(prompt, {
        model: 'ollama',
        temperature: 0.4,
        metadata: {
          service: 'EnhancedSemanticService',
          method: 'generateLearningInsights'
        }
      });

      const parseResult = parseLLMJsonResponse(response.content);
      if (!parseResult.success) {
        console.error('Failed to parse learning insights JSON:', parseResult.error, 'Attempts:', parseResult.attempts);
        return {
          learnedConcepts: [],
          improvedUnderstanding: [],
          newPatterns: [],
          recommendations: []
        };
      }

      const parsed = parseResult.data;
      return {
        learnedConcepts: parsed.learnedConcepts || [],
        improvedUnderstanding: parsed.improvedUnderstanding || [],
        newPatterns: parsed.newPatterns || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Failed to generate learning insights:', error);
      return {
        learnedConcepts: [],
        improvedUnderstanding: [],
        newPatterns: [],
        recommendations: []
      };
    }
  }
}
