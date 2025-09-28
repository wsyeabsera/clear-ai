/**
 * Test Neo4j-only memory system (without Pinecone)
 * Run with: node test-neo4j-only.js
 */

const testNeo4jMemory = async () => {
  console.log('🧪 Testing Neo4j memory system...');
  
  try {
    // Import the Neo4j service directly
    const { Neo4jMemoryService } = require('./packages/shared/dist/services/Neo4jMemoryService');
    
    // Initialize the service
    const neo4jService = new Neo4jMemoryService({
      uri: 'bolt://localhost:7687',
      username: 'neo4j',
      password: 'samplepassword',
      database: 'local-clear-db'
    });
    
    await neo4jService.initialize();
    console.log('✅ Neo4j memory service initialized');
    
    // Test storing a memory
    const testMemory = {
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      timestamp: new Date(),
      content: 'User asked about machine learning algorithms',
      context: { conversation_turn: 1, topic: 'AI' },
      metadata: {
        source: 'chat',
        importance: 0.8,
        tags: ['AI', 'machine learning'],
        location: 'web interface'
      },
      relationships: {
        previous: undefined,
        next: undefined,
        related: []
      }
    };
    
    const storedMemory = await neo4jService.storeEpisodicMemory(testMemory);
    console.log(`✅ Stored memory: ${storedMemory.id}`);
    
    // Test retrieving the memory
    const retrievedMemory = await neo4jService.getEpisodicMemory(storedMemory.id);
    console.log(`✅ Retrieved memory: ${retrievedMemory?.content}`);
    
    // Test searching memories
    const searchResults = await neo4jService.searchEpisodicMemories({
      userId: 'test-user-123'
    });
    console.log(`✅ Found ${searchResults.length} memories`);
    
    // Test memory stats
    const stats = await neo4jService.getMemoryStats('test-user-123');
    console.log(`✅ Memory stats: ${stats.count} memories`);
    
    // Clean up
    await neo4jService.clearUserMemories('test-user-123');
    console.log('✅ Cleaned up test memories');
    
    await neo4jService.close();
    console.log('✅ Neo4j connection closed');
    
    console.log('\n🎉 Neo4j memory system is working perfectly!');
    console.log('📋 Next step: Set up Pinecone for semantic memory');
    
  } catch (error) {
    console.error('❌ Error testing Neo4j memory:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Neo4j Desktop is running');
    console.log('2. Database is started');
    console.log('3. Password is "samplepassword"');
  }
};

// Run the test
testNeo4jMemory();
