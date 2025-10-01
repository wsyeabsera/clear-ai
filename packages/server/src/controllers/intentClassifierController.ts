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
        groqModel: 'llama-3.1-8b-instant',
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

      // Challenging and confusing test queries
      const testQueries = [
        // Clear cases
        { query: "What did we discuss yesterday?", expectedType: "memory_chat" },
        { query: "Calculate 5 + 3", expectedType: "tool_execution" },
        { query: "Hello, how are you?", expectedType: "conversation" },

        // Ambiguous cases that could be multiple types
        { query: "Can you help me with something?", expectedType: "unknown" },
        { query: "I need assistance", expectedType: "unknown" },
        { query: "What can you do?", expectedType: "conversation" },
        { query: "Show me what you know", expectedType: "knowledge_search" },

        // Edge cases with mixed signals
        { query: "Remember that I like coffee and then find me a cafe", expectedType: "hybrid" },
        { query: "What did I tell you about my favorite programming language?", expectedType: "memory_chat" },
        { query: "Search my brain for Python knowledge", expectedType: "knowledge_search" },
        { query: "Make a calculation based on what you remember about my preferences", expectedType: "hybrid" },

        // Confusing tool vs conversation cases
        { query: "Can you calculate something for me?", expectedType: "tool_execution" },
        { query: "I want to do math", expectedType: "tool_execution" },
        { query: "Let's talk about numbers", expectedType: "conversation" },
        { query: "What's the weather like?", expectedType: "tool_execution" },

        // Memory vs knowledge search confusion
        { query: "What do I know about machine learning?", expectedType: "knowledge_search" },
        { query: "Tell me what we talked about regarding AI", expectedType: "memory_chat" },
        { query: "What information do you have about Python?", expectedType: "knowledge_search" },
        { query: "Remind me of our conversation about programming", expectedType: "memory_chat" },

        // Complex hybrid cases
        { query: "Based on my preferences, find a restaurant and remember this choice", expectedType: "hybrid" },
        { query: "Analyze this data and store the results for later", expectedType: "hybrid" },
        { query: "Get the weather and tell me what I said about it yesterday", expectedType: "hybrid" },

        // Unclear/gibberish cases
        { query: "asdfghjkl", expectedType: "unknown" },
        { query: "What?", expectedType: "unknown" },
        { query: "I don't understand", expectedType: "unknown" },
        { query: "Help me with something I don't know what", expectedType: "unknown" },

        // Tool execution edge cases
        { query: "Open a file", expectedType: "tool_execution" },
        { query: "Fetch some data", expectedType: "tool_execution" },
        { query: "Run a command", expectedType: "tool_execution" },
        { query: "Execute something", expectedType: "unknown" },

        // Memory context edge cases
        { query: "Remember this for later", expectedType: "memory_chat" },
        { query: "Save this information", expectedType: "memory_chat" },
        { query: "Keep this in mind", expectedType: "memory_chat" },
        { query: "Don't forget this", expectedType: "memory_chat" },

        // Conversation vs other types
        { query: "How are you feeling today?", expectedType: "conversation" },
        { query: "Tell me about yourself", expectedType: "conversation" },
        { query: "What's your opinion on AI?", expectedType: "conversation" },
        { query: "Explain quantum computing", expectedType: "conversation" },

        // Complex multi-part queries
        { query: "First calculate 2+2, then remember that I like the result, and finally search for math facts", expectedType: "hybrid" },
        { query: "Get the weather, remember my preference for sunny days, and suggest activities", expectedType: "hybrid" },
        { query: "What did we discuss about machine learning and can you find more information about it?", expectedType: "hybrid" },

        // Tool detection challenges
        { query: "I need to make a request to an API", expectedType: "tool_execution" },
        { query: "Can you read a file for me?", expectedType: "tool_execution" },
        { query: "Parse this JSON data", expectedType: "tool_execution" },
        { query: "Do multiple things at once", expectedType: "tool_execution" },

        // Intentional confusion
        { query: "Remember to calculate something", expectedType: "hybrid" },
        { query: "What can you calculate and what do you remember?", expectedType: "hybrid" },
        { query: "Help me with everything", expectedType: "unknown" },
        { query: "Do what you think is best", expectedType: "unknown" }
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
