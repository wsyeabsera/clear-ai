import { Request, Response } from 'express';
import {
  EnhancedAgentService,
  EnhancedAgentExecutionResult,
  EnhancedAgentExecutionOptions,
  EnhancedAgentServiceConfig,
  EnhancedAgentToolRegistry,
  MemoryServiceConfig,
  IntentClassifierService,
  SimpleLangChainService,
  CoreKeysAndModels,
  ApiResponse
} from 'clear-ai-shared';
import { ToolRegistry as MCPToolRegistry } from 'clear-ai-mcp-basic';
import { MemoryContextService } from 'clear-ai-shared';

// Global agent service instance
let agentService: EnhancedAgentService | null = null;

// Initialize agent service
export const initializeEnhancedAgentService = async (
  memoryConfig: MemoryServiceConfig,
  langchainConfig: CoreKeysAndModels,
  toolRegistry: MCPToolRegistry
) => {
  if (!agentService) {
    // Create service instances
    const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    await memoryService.initialize();

    const intentClassifier = new IntentClassifierService(langchainConfig, toolRegistry);
    const langchainService = new SimpleLangChainService(langchainConfig);

    // Create agent service config
    const agentConfig: EnhancedAgentServiceConfig = {
      memoryService,
      intentClassifier,
      langchainService,
      toolRegistry: toolRegistry as EnhancedAgentToolRegistry,
      defaultOptions: {
        includeMemoryContext: true,
        maxMemoryResults: 10,
        model: 'openai',
        temperature: 0.7,
        includeReasoning: true
      }
    };

    agentService = new EnhancedAgentService(agentConfig);
    await agentService.initialize();
  }
  return agentService;
};

// Get agent service instance
const getAgentService = (): EnhancedAgentService => {
  if (!agentService) {
    throw new Error('Agent service not initialized. Call initializeAgentService first.');
  }
  return agentService;
};

export const enhancedAgentController = {
  // Initialize agent service
  async initializeService(req: Request, res: Response): Promise<void> {
    try {
      const memoryConfig: MemoryServiceConfig = {
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
      };

      const langchainConfig: CoreKeysAndModels = {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        mistralApiKey: process.env.MISTRAL_API_KEY || '',
        mistralModel: process.env.MISTRAL_MODEL || 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: process.env.GROQ_MODEL || 'llama3-8b-8192',
        ollamaModel: process.env.OLLAMA_MODEL || 'mistral',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
      };

      // Initialize tool registry
      const toolRegistry = new MCPToolRegistry();

      await initializeEnhancedAgentService(memoryConfig, langchainConfig, toolRegistry);

      const response: ApiResponse = {
        success: true,
        data: {
          initialized: true,
          agentStatus: agentService?.getAgentStatus() || {},
          capabilities: {
            memory: true,
            intentClassification: true,
            toolExecution: true,
            conversation: true
          }
        },
        message: 'Agent service initialized successfully',
        tools: ['AgentService', 'MemoryService', 'IntentClassifierService', 'ToolRegistry']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to initialize agent service',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['AgentService']
      };
      res.status(500).json(response);
    }
  },

  // Execute a query with the agent
  async executeQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query, options } = req.body;

      if (!query || typeof query !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Missing or invalid query',
          message: 'Query is required and must be a string',
          tools: ['AgentService.executeQuery']
        };
        res.status(400).json(response);
        return;
      }

      const agent = getAgentService();
      const executionOptions: EnhancedAgentExecutionOptions = {
        userId: options?.userId || 'default-user',
        sessionId: options?.sessionId || `session-${Date.now()}`,
        includeMemoryContext: options?.includeMemoryContext !== false,
        maxMemoryResults: options?.maxMemoryResults || 10,
        model: options?.model || process.env.DEFAULT_MODEL || 'openai',
        temperature: options?.temperature || 0.7,
        includeReasoning: options?.includeReasoning !== false,
        previousIntents: options?.previousIntents,
        responseDetailLevel: options?.responseDetailLevel || 'standard',
        excludeVectors: options?.excludeVectors !== false // Default to true to exclude vectors
      };

      const result = await agent.executeQuery(query, executionOptions);

      const response: ApiResponse<EnhancedAgentExecutionResult> = {
        success: result.success,
        data: result,
        message: result.success 
          ? `Query executed successfully (${result.intent.type})` 
          : 'Query execution failed',
        tools: ['AgentService.executeQuery']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to execute query',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['AgentService.executeQuery']
      };
      res.status(500).json(response);
    }
  },

  // Get agent status and capabilities
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const agent = getAgentService();
      const status = agent.getAgentStatus();

      const response: ApiResponse = {
        success: true,
        data: {
          status,
          capabilities: {
            memory: status.memoryService,
            intentClassification: status.intentClassifier,
            toolExecution: status.toolRegistry,
            availableTools: status.availableTools,
            intentTypes: status.intentTypes
          }
        },
        message: 'Agent status retrieved successfully',
        tools: ['AgentService.getStatus']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get agent status',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['AgentService.getStatus']
      };
      res.status(500).json(response);
    }
  },

  // Test agent with sample queries
  async testAgent(req: Request, res: Response): Promise<void> {
    try {
      const agent = getAgentService();

      const testQueries = [
        {
          query: "Hello, how are you?",
          description: "Simple conversation",
          expectedIntent: "conversation"
        },
        {
          query: "What did we discuss yesterday?",
          description: "Memory-based question",
          expectedIntent: "memory_chat"
        },
        {
          query: "Calculate 15 + 27",
          description: "Tool execution",
          expectedIntent: "tool_execution"
        },
        {
          query: "Remember that I like Python and then find me a Python tutorial",
          description: "Hybrid execution",
          expectedIntent: "hybrid"
        },
        {
          query: "What do I know about machine learning?",
          description: "Knowledge search",
          expectedIntent: "knowledge_search"
        }
      ];

      const testResults = await Promise.all(
        testQueries.map(async (test) => {
          try {
            const result = await agent.executeQuery(test.query, {
              userId: 'test-user',
              sessionId: 'test-session',
              includeMemoryContext: true,
              includeReasoning: true
            });

            return {
              query: test.query,
              description: test.description,
              expectedIntent: test.expectedIntent,
              actualIntent: result.intent.type,
              confidence: result.intent.confidence,
              success: result.success,
              response: result.response.substring(0, 200) + (result.response.length > 200 ? '...' : ''),
              reasoning: result.reasoning,
              metadata: result.metadata
            };
          } catch (error) {
            return {
              query: test.query,
              description: test.description,
              expectedIntent: test.expectedIntent,
              actualIntent: null,
              confidence: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const successCount = testResults.filter(r => r.success).length;
      const accuracy = testResults.filter(r => r.actualIntent === r.expectedIntent).length / testResults.length;

      const response: ApiResponse = {
        success: true,
        data: {
          testResults,
          summary: {
            totalTests: testResults.length,
            successfulExecutions: successCount,
            accuracy: Math.round(accuracy * 100) / 100,
            averageConfidence: Math.round(
              testResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / testResults.length * 100
            ) / 100
          }
        },
        message: `Agent test completed with ${Math.round(accuracy * 100)}% accuracy`,
        tools: ['AgentService.testAgent']
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to test agent',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['AgentService.testAgent']
      };
      res.status(500).json(response);
    }
  }
};
