const { MemoryContextService } = require('./dist/shared/services/MemoryContextService');

async function testDirectMemory() {
  try {
    console.log('🧪 Testing Direct Memory Storage...');
    
    const memoryConfig = {
      neo4j: {
        uri: 'bolt://localhost:7687',
        username: 'neo4j',
        password: 'samplepassword',
        database: 'neo4j'
      },
      pinecone: {
        apiKey: '',
        environment: '',
        indexName: 'clear-ai-memories'
      },
      embedding: {
        model: 'nomic-embed-text',
        dimensions: 768
      }
    };

    const langchainConfig = {
      openaiApiKey: '',
      openaiModel: 'gpt-3.5-turbo',
      mistralApiKey: '',
      mistralModel: 'mistral-small',
      groqApiKey: '',
      groqModel: 'llama3-8b-8192',
      ollamaModel: 'llama2',
      ollamaBaseUrl: 'http://localhost:11434',
      langfuseSecretKey: '',
      langfusePublicKey: '',
      langfuseBaseUrl: 'https://cloud.langfuse.com'
    };

    const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory service initialized');

    // Test storing a memory directly
    const memory = await memoryService.storeEpisodicMemory({
      userId: 'test-user-7',
      sessionId: 'test-session-7',
      timestamp: new Date(),
      content: 'User: My name is Alice and I am a software developer\nAssistant: Nice to meet you, Alice!',
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
    const context = await memoryService.getMemoryContext('test-user-7', 'test-session-7');
    console.log(`📝 Memory context: ${context.episodicMemories.length} episodic, ${context.semanticMemories.length} semantic memories`);

    if (context.episodicMemories.length > 0) {
      console.log('Recent memories:');
      context.episodicMemories.forEach((mem, i) => {
        console.log(`  ${i+1}. [${mem.timestamp}] ${mem.content.substring(0, 80)}...`);
      });
    }

    await memoryService.close();
    console.log('✅ Test complete');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDirectMemory();
