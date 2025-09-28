#!/usr/bin/env node

/**
 * Test script for the new semantic extraction functionality
 * This script demonstrates how the LLM-based semantic extraction works
 * to reduce redundancy between Pinecone and Neo4j memory storage.
 */

const { MemoryContextService } = require('./dist/shared/services/MemoryContextService');
const { MemoryServiceConfig } = require('./dist/shared/types/memory');

async function testSemanticExtraction() {
  console.log('🧠 Testing Semantic Extraction System\n');

  // Mock configuration for testing
  const config = {
    neo4j: {
      uri: 'bolt://localhost:7687',
      username: 'neo4j',
      password: 'password',
      database: 'neo4j'
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: 'us-east-1',
      indexName: 'clear-ai-memories'
    },
    embedding: {
      model: 'nomic-embed-text',
      dimensions: 768
    },
    semanticExtraction: {
      enabled: true,
      minConfidence: 0.7,
      maxConceptsPerMemory: 3,
      enableRelationshipExtraction: true,
      categories: ['AI', 'Technology', 'Programming', 'Science', 'General'],
      batchSize: 5
    }
  };

  const langchainConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || 'mock-key',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
    model: 'gpt-3.5-turbo'
  };

  try {
    // Initialize the memory service
    console.log('1. Initializing Memory Context Service...');
    const memoryService = new MemoryContextService(config, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory service initialized\n');

    // Create some sample episodic memories
    console.log('2. Creating sample episodic memories...');
    const sampleMemories = [
      {
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: 'User asked about machine learning algorithms and neural networks',
        context: { topic: 'AI', conversation_turn: 1 },
        metadata: {
          source: 'chat',
          importance: 0.9,
          tags: ['AI', 'machine learning', 'neural networks'],
          location: 'web_interface'
        },
        relationships: { previous: undefined, next: undefined, related: [] }
      },
      {
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: 'User mentioned they prefer Python over JavaScript for data science',
        context: { topic: 'Programming', conversation_turn: 2 },
        metadata: {
          source: 'chat',
          importance: 0.8,
          tags: ['programming', 'python', 'javascript', 'data science'],
          location: 'web_interface'
        },
        relationships: { previous: undefined, next: undefined, related: [] }
      },
      {
        userId: 'test-user-123',
        sessionId: 'session-456',
        content: 'User discussed the benefits of vector databases for AI applications',
        context: { topic: 'Technology', conversation_turn: 3 },
        metadata: {
          source: 'chat',
          importance: 0.7,
          tags: ['vector databases', 'AI', 'technology'],
          location: 'web_interface'
        },
        relationships: { previous: undefined, next: undefined, related: [] }
      }
    ];

    // Store episodic memories
    for (const memory of sampleMemories) {
      try {
        await memoryService.storeEpisodicMemory(memory);
        console.log(`   ✅ Stored: "${memory.content.substring(0, 50)}..."`);
      } catch (error) {
        console.log(`   ⚠️  Failed to store memory: ${error.message}`);
      }
    }
    console.log('');

    // Test semantic extraction
    console.log('3. Running semantic extraction...');
    try {
      const extractionResult = await memoryService.extractSemanticFromEpisodic('test-user-123', 'session-456');
      
      console.log('✅ Semantic extraction completed!');
      console.log(`   📊 Results:`);
      console.log(`      - Extracted concepts: ${extractionResult.extractedConcepts}`);
      console.log(`      - Extracted relationships: ${extractionResult.extractedRelationships}`);
      console.log(`      - Processing time: ${extractionResult.processingTime}ms`);
      console.log('');

      // Get extraction statistics
      console.log('4. Getting extraction statistics...');
      const stats = await memoryService.getSemanticExtractionStats('test-user-123');
      
      console.log('📈 Extraction Statistics:');
      console.log(`   - Total extractions: ${stats.totalExtractions}`);
      console.log(`   - Average confidence: ${stats.averageConfidence.toFixed(2)}`);
      console.log(`   - Last extraction: ${stats.lastExtraction ? stats.lastExtraction.toISOString() : 'None'}`);
      console.log(`   - Concepts by category:`);
      Object.entries(stats.conceptsByCategory).forEach(([category, count]) => {
        console.log(`     * ${category}: ${count}`);
      });
      console.log('');

    } catch (error) {
      console.log(`❌ Semantic extraction failed: ${error.message}`);
      console.log('   This is expected if Pinecone is not configured or LLM service is not available');
    }

    // Test memory search to see if semantic memories were created
    console.log('5. Testing semantic memory search...');
    try {
      const searchResult = await memoryService.searchMemories({
        userId: 'test-user-123',
        query: 'machine learning',
        type: 'semantic',
        limit: 5
      });

      console.log(`🔍 Found ${searchResult.semantic.memories.length} semantic memories:`);
      searchResult.semantic.memories.forEach((memory, index) => {
        console.log(`   ${index + 1}. ${memory.concept}: ${memory.description}`);
        console.log(`      Category: ${memory.metadata.category}, Confidence: ${memory.metadata.confidence}`);
        if (memory.metadata.extractionMetadata) {
          console.log(`      Extracted from: ${memory.metadata.extractionMetadata.sourceMemoryIds.join(', ')}`);
        }
      });
      console.log('');

    } catch (error) {
      console.log(`⚠️  Semantic search failed: ${error.message}`);
    }

    console.log('🎉 Test completed!');
    console.log('\n📝 Summary:');
    console.log('   The semantic extraction system processes episodic memories from Neo4j');
    console.log('   and extracts only the essential semantic concepts and relationships');
    console.log('   to store in Pinecone, reducing redundancy and improving efficiency.');
    console.log('   This approach ensures that Pinecone contains only distilled,');
    console.log('   semantically meaningful information rather than raw conversation data.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSemanticExtraction().catch(console.error);
}

module.exports = { testSemanticExtraction };
