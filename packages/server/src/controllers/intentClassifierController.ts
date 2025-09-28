import { Request, Response } from 'express';
import { 
  IntentClassifierService,
  QueryIntent,
  IntentClassificationOptions,
  ToolRegistry,
  CoreKeysAndModels,
  ApiResponse
} from 'clear-ai-shared';
import { ToolRegistry as MCPToolRegistry } from 'clear-ai-mcp-basic';

// Global intent classifier instance
let intentClassifier: IntentClassifierService | null = null;

// Initialize intent classifier service
export const initializeIntentClassifier = async (langchainConfig: CoreKeysAndModels, toolRegistry: MCPToolRegistry) => {
  if (!intentClassifier) {
    intentClassifier = new IntentClassifierService(langchainConfig, toolRegistry);
  }
  return intentClassifier;
};

// Get intent classifier instance
const getIntentClassifier = (): IntentClassifierService => {
  if (!intentClassifier) {
    throw new Error('Intent classifier not initialized. Call initializeIntentClassifier first.');
  }
  return intentClassifier;
};

export const intentClassifierController = {
  // Initialize intent classifier service
  async initializeService(req: Request, res: Response): Promise<void> {
    try {
      const langchainConfig: CoreKeysAndModels = {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        openaiModel: 'gpt-3.5-turbo',
        mistralApiKey: process.env.MISTRAL_API_KEY || '',
        mistralModel: 'mistral-small',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama3-8b-8192',
        ollamaModel: 'llama2',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
        langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
      };

      // Initialize tool registry
      const toolRegistry = new MCPToolRegistry();
      
      await initializeIntentClassifier(langchainConfig, toolRegistry);
      
      const response: ApiResponse = {
        success: true,
        data: {
          initialized: true,
          availableIntentTypes: intentClassifier?.getAvailableIntentTypes() || [],
          intentTypeDescriptions: intentClassifier?.getIntentTypeDescriptions() || {}
        },
        message: 'Intent classifier service initialized successfully',
        tools: ['IntentClassifierService']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to initialize intent classifier service',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['IntentClassifierService']
      };
      res.status(500).json(response);
    }
  },

  // Classify a single query
  async classifyQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query, options } = req.body;

      if (!query || typeof query !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Missing or invalid query',
          message: 'Query is required and must be a string',
          tools: ['IntentClassifierService.classifyQuery']
        };
        res.status(400).json(response);
        return;
      }

      const classifier = getIntentClassifier();
      const classificationOptions: IntentClassificationOptions = {
        model: options?.model || 'openai',
        temperature: options?.temperature || 0.1,
        includeAvailableTools: options?.includeAvailableTools || true,
        userContext: options?.userContext
      };

      const intent = await classifier.classifyQuery(query, classificationOptions);
      
      const response: ApiResponse<QueryIntent> = {
        success: true,
        data: intent,
        message: `Query classified as: ${intent.type} (confidence: ${intent.confidence})`,
        tools: ['IntentClassifierService.classifyQuery']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to classify query',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['IntentClassifierService.classifyQuery']
      };
      res.status(500).json(response);
    }
  },

  // Classify multiple queries in batch
  async classifyQueriesBatch(req: Request, res: Response): Promise<void> {
    try {
      const { queries, options } = req.body;

      if (!Array.isArray(queries) || queries.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing or invalid queries',
          message: 'Queries must be a non-empty array of strings',
          tools: ['IntentClassifierService.classifyQueriesBatch']
        };
        res.status(400).json(response);
        return;
      }

      const classifier = getIntentClassifier();
      const classificationOptions: IntentClassificationOptions = {
        model: options?.model || 'openai',
        temperature: options?.temperature || 0.1,
        includeAvailableTools: options?.includeAvailableTools || true,
        userContext: options?.userContext
      };

      // Classify all queries in parallel
      const classifications = await Promise.all(
        queries.map(async (query: string) => {
          try {
            const intent = await classifier.classifyQuery(query, classificationOptions);
            return {
              query,
              intent,
              success: true
            };
          } catch (error) {
            return {
              query,
              intent: null,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          classifications,
          totalQueries: queries.length,
          successfulClassifications: classifications.filter(c => c.success).length,
          failedClassifications: classifications.filter(c => !c.success).length
        },
        message: `Classified ${queries.length} queries`,
        tools: ['IntentClassifierService.classifyQueriesBatch']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to classify queries batch',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['IntentClassifierService.classifyQueriesBatch']
      };
      res.status(500).json(response);
    }
  },

  // Test intent classification with sample queries
  async testClassification(req: Request, res: Response): Promise<void> {
    try {
      const classifier = getIntentClassifier();

      // Sample queries for testing each intent type
      const testQueries = [
        { query: "What did we discuss yesterday?", expectedType: "memory_chat" },
        { query: "Calculate 5 + 3", expectedType: "tool_execution" },
        { query: "Based on my preferences, find a restaurant", expectedType: "hybrid" },
        { query: "What do I know about machine learning?", expectedType: "knowledge_search" },
        { query: "Hello, how are you?", expectedType: "conversation" },
        { query: "Make an API call to get weather data", expectedType: "tool_execution" },
        { query: "Remember that I like Python programming", expectedType: "memory_chat" },
        { query: "Read this file and analyze the data", expectedType: "hybrid" },
        { query: "Search my memories for information about AI", expectedType: "knowledge_search" },
        { query: "Tell me a joke", expectedType: "conversation" }
      ];

      const testResults = await Promise.all(
        testQueries.map(async (test) => {
          try {
            const intent = await classifier.classifyQuery(test.query);
            const isCorrect = intent.type === test.expectedType;
            
            return {
              query: test.query,
              expectedType: test.expectedType,
              actualType: intent.type,
              confidence: intent.confidence,
              correct: isCorrect,
              reasoning: intent.reasoning,
              requiredTools: intent.requiredTools,
              memoryContext: intent.memoryContext
            };
          } catch (error) {
            return {
              query: test.query,
              expectedType: test.expectedType,
              actualType: null,
              confidence: 0,
              correct: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const accuracy = testResults.filter(r => r.correct).length / testResults.length;

      const response: ApiResponse = {
        success: true,
        data: {
          testResults,
          summary: {
            totalTests: testResults.length,
            correctClassifications: testResults.filter(r => r.correct).length,
            accuracy: Math.round(accuracy * 100) / 100,
            averageConfidence: Math.round(
              testResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / testResults.length * 100
            ) / 100
          }
        },
        message: `Intent classification test completed with ${Math.round(accuracy * 100)}% accuracy`,
        tools: ['IntentClassifierService.testClassification']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to run classification test',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['IntentClassifierService.testClassification']
      };
      res.status(500).json(response);
    }
  },

  // Get available intent types and descriptions
  async getIntentTypes(req: Request, res: Response): Promise<void> {
    try {
      const classifier = getIntentClassifier();
      
      const response: ApiResponse = {
        success: true,
        data: {
          intentTypes: classifier.getAvailableIntentTypes(),
          descriptions: classifier.getIntentTypeDescriptions()
        },
        message: 'Intent types retrieved successfully',
        tools: ['IntentClassifierService.getIntentTypes']
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get intent types',
        message: error instanceof Error ? error.message : 'Unknown error',
        tools: ['IntentClassifierService.getIntentTypes']
      };
      res.status(500).json(response);
    }
  }
};
