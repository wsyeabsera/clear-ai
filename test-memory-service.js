const { MemoryContextService } = require('./packages/shared/dist/services/MemoryContextService');
const { SimpleLangChainService } = require('./packages/shared/dist/services/SimpleLangChainService');

// Load environment variables
require('dotenv').config({ path: './packages/server/.env' });

async function testMemoryService() {
  console.log('🧠 Testing Memory Service...');
  
  const memoryConfig = {
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
      username: process.env.NEO4J_USERNAME || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'samplepassword',
      database: process.env.NEO4J_DATABASE || 'local-clear-db'
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || '',
      indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
    },
    embedding: {
      model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
      dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768')
    }
  };

  const langchainConfig = {
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

  try {
    console.log('1. Initializing Memory Service...');
    const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory Service initialized');

    console.log('2. Testing getMemoryContext...');
    const context = await memoryService.getMemoryContext('test-user', 'test-session');
    console.log('✅ Memory context retrieved:', {
      userId: context.userId,
      sessionId: context.sessionId,
      episodicCount: context.episodicMemories.length,
      semanticCount: context.semanticMemories.length
    });

    console.log('3. Testing storeEpisodicMemory...');
    const testMemory = await memoryService.storeEpisodicMemory({
      userId: 'test-user',
      sessionId: 'test-session',
      timestamp: new Date(),
      content: 'Test memory content',
      context: { test: true },
      metadata: {
        source: 'test',
        importance: 0.8,
        tags: ['test'],
        location: 'test-script'
      },
      relationships: {}
    });
    console.log('✅ Episodic memory stored:', testMemory.id);

    console.log('4. Testing getMemoryContext again...');
    const context2 = await memoryService.getMemoryContext('test-user', 'test-session');
    console.log('✅ Memory context retrieved after storing:', {
      userId: context2.userId,
      sessionId: context2.sessionId,
      episodicCount: context2.episodicMemories.length,
      semanticCount: context2.semanticMemories.length
    });

    console.log('🎉 Memory Service test completed successfully!');
  } catch (error) {
    console.error('❌ Memory Service test failed:', error);
  }
}

testMemoryService();
