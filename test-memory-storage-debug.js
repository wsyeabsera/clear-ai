const { MemoryContextService } = require('./dist/shared/services/MemoryContextService');
const dotenv = require('dotenv');
dotenv.config({path: './packages/server/.env'});
async function testMemoryStorage() {
  try {
    console.log('🧪 Testing Memory Storage Debug...');
    
    const memoryConfig = {
      neo4j: {
        uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
        username: process.env.NEO4J_USERNAME || 'neo4j',
        password: process.env.NEO4J_PASSWORD || 'samplepassword',
        database: process.env.NEO4J_DATABASE || 'neo4j'
      },
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        environment: process.env.PINECONE_ENVIRONMENT || 'clear-ai',
        indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
      },
      embedding: {
        model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
        dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768')
      }
    };

    const langchainConfig = {
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

    const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory service initialized');

    // Test storing a memory
    console.log('📝 Storing test memory...');
    const memory = await memoryService.storeEpisodicMemory({
      userId: 'test-user-debug',
      sessionId: 'test-session-debug',
      timestamp: new Date(),
      content: 'User: My name is Frank and I am a data analyst\nAssistant: Nice to meet you, Frank!',
      context: {
        intent: 'memory_chat',
        confidence: 0.9,
        conversation_turn: Date.now()
      },
      metadata: {
        source: 'test',
        importance: 0.9,
        tags: ['memory_chat', 'conversation'],
        location: 'test'
      },
      relationships: {}
    });

    console.log('✅ Memory stored:', memory.id);

    // Test retrieving the memory
    console.log('🔍 Retrieving memory context...');
    const context = await memoryService.getMemoryContext('test-user-debug', 'test-session-debug');
    console.log(`📝 Memory context: ${context.episodicMemories.length} episodic, ${context.semanticMemories.length} semantic memories`);

    if (context.episodicMemories.length > 0) {
      console.log('✅ Memory retrieval working!');
      context.episodicMemories.forEach((mem, i) => {
        console.log(`  ${i+1}. [${mem.timestamp}] ${mem.content.substring(0, 80)}...`);
      });
    } else {
      console.log('❌ No memories retrieved');
    }

    await memoryService.close();
    console.log('✅ Test complete');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMemoryStorage();
