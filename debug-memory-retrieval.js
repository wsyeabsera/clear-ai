const { MemoryContextService } = require('./dist/shared/services/MemoryContextService');
const { SimpleLangChainService } = require('./dist/shared/services/SimpleLangChainService');

async function debugMemoryRetrieval() {
  try {
    console.log('🔍 Debugging memory retrieval...');
    
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

    // Test with different user/session combinations
    const testCases = [
      { userId: 'test-user-2', sessionId: 'test-session-2' },
      { userId: 'test-user', sessionId: 'test-session' },
      { userId: 'test-user-2', sessionId: undefined }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing with userId: ${testCase.userId}, sessionId: ${testCase.sessionId}`);
      
      try {
        const context = await memoryService.getMemoryContext(testCase.userId, testCase.sessionId || 'test-session');
        console.log(`  Found ${context.episodicMemories.length} episodic memories`);
        console.log(`  Found ${context.semanticMemories.length} semantic memories`);
        
        if (context.episodicMemories.length > 0) {
          console.log('  Recent memories:');
          context.episodicMemories.slice(0, 3).forEach((mem, i) => {
            console.log(`    ${i+1}. [${mem.timestamp}] ${mem.content.substring(0, 80)}...`);
          });
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }

    // Test direct Neo4j search
    console.log('\n🔍 Testing direct Neo4j search...');
    const directSearch = await memoryService.searchEpisodicMemories({
      userId: 'test-user-2',
      sessionId: 'test-session-2',
      limit: 10
    });
    console.log(`  Direct search found ${directSearch.length} memories`);

    await memoryService.close();
    console.log('\n✅ Debug complete');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugMemoryRetrieval();
