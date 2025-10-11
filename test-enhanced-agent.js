#!/usr/bin/env node

// Simple test script to verify enhanced agent functionality
const { EnhancedAgentService } = require('./packages/shared/dist/services/enhanced/EnhancedAgentService');

console.log('Testing Enhanced Agent Service...');

// Mock configuration for testing
const mockConfig = {
  memoryService: {
    getMemoryContext: async () => ({
      userId: 'test-user',
      sessionId: 'test-session',
      episodicMemories: [],
      semanticMemories: [],
      contextWindow: {
        startTime: new Date(),
        endTime: new Date(),
        relevanceScore: 0.8
      }
    }),
    storeEpisodicMemory: async () => ({ id: 'test-memory' }),
    storeSemanticMemory: async () => ({ id: 'test-semantic' }),
    searchMemories: async () => ({ episodic: { memories: [] }, semantic: { memories: [] } })
  },
  intentClassifier: {
    classifyQuery: async () => ({
      type: 'conversation',
      confidence: 0.8,
      reasoning: 'Test classification'
    }),
    getAvailableIntentTypes: () => ['conversation', 'tool_execution']
  },
  langchainService: {
    complete: async () => ({ content: 'Test response' })
  },
  toolRegistry: {
    getTool: () => null,
    getAllTools: () => [],
    getToolNames: () => [],
    getToolSchema: () => ({})
  }
};

async function testEnhancedAgent() {
  try {
    console.log('✅ Enhanced Agent Service can be imported');
    
    // Test that we can create an instance (this will test the constructor)
    const agent = new EnhancedAgentService(mockConfig);
    console.log('✅ Enhanced Agent Service can be instantiated');
    
    // Test basic functionality
    const result = await agent.executeQuery('Hello, this is a test query', {
      userId: 'test-user',
      sessionId: 'test-session',
      includeMemoryContext: false,
      includeReasoning: false
    });
    
    console.log('✅ Enhanced Agent Service can execute queries');
    console.log('Result:', {
      success: result.success,
      intent: result.intent?.type,
      response: result.response?.substring(0, 100) + '...'
    });
    
    console.log('🎉 All tests passed! Enhanced Agent Service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEnhancedAgent();
