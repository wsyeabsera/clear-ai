/**
 * Test memory server functionality
 * Run with: node test-memory-server.js
 */

const express = require('express');
const { MemoryContextService } = require('./packages/shared/dist/services/MemoryContextService');

const app = express();
app.use(express.json());

// Test memory service initialization
let memoryService = null;

const initializeMemoryService = async () => {
  try {
    const config = {
      neo4j: {
        uri: 'bolt://localhost:7687',
        username: 'neo4j',
        password: 'samplepassword',
        database: 'local-clear-db'
      },
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '', // Skip if no API key
        environment: process.env.PINECONE_ENVIRONMENT || '',
        indexName: process.env.PINECONE_INDEX_NAME || 'test-index'
      },
      embedding: {
        model: 'nomic-embed-text',
        dimensions: 768
      }
    };

    const langchainConfig = {
      openaiApiKey: 'test-key',
      openaiModel: 'gpt-3.5-turbo',
      mistralApiKey: 'test-key',
      mistralModel: 'mistral-small',
      groqApiKey: 'test-key',
      groqModel: 'llama3-8b-8192',
      ollamaModel: 'llama2',
      ollamaBaseUrl: 'http://localhost:11434',
      langfuseSecretKey: 'test-key',
      langfusePublicKey: 'test-key',
      langfuseBaseUrl: 'https://cloud.langfuse.com'
    };

    memoryService = new MemoryContextService(config, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory service initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize memory service:', error.message);
    return false;
  }
};

// Test endpoints
app.post('/test/episodic', async (req, res) => {
  try {
    if (!memoryService) {
      return res.status(500).json({ error: 'Memory service not initialized' });
    }

    const memory = await memoryService.storeEpisodicMemory({
      userId: 'test-user',
      sessionId: 'test-session',
      timestamp: new Date(),
      content: 'Test memory content',
      context: { test: true },
      metadata: {
        source: 'test',
        importance: 0.8,
        tags: ['test']
      },
      relationships: {
        previous: undefined,
        next: undefined,
        related: []
      }
    });

    res.json({ success: true, memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/test/episodic/:id', async (req, res) => {
  try {
    if (!memoryService) {
      return res.status(500).json({ error: 'Memory service not initialized' });
    }

    const memory = await memoryService.getEpisodicMemory(req.params.id);
    res.json({ success: true, memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/test/stats/:userId', async (req, res) => {
  try {
    if (!memoryService) {
      return res.status(500).json({ error: 'Memory service not initialized' });
    }

    const stats = await memoryService.getMemoryStats(req.params.userId);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3006;
app.listen(PORT, async () => {
  console.log(`🧪 Test memory server running on port ${PORT}`);
  
  const initialized = await initializeMemoryService();
  if (initialized) {
    console.log('🎉 Memory server is ready for testing!');
    console.log(`📡 Test endpoints:`);
    console.log(`   POST http://localhost:${PORT}/test/episodic`);
    console.log(`   GET  http://localhost:${PORT}/test/episodic/:id`);
    console.log(`   GET  http://localhost:${PORT}/test/stats/:userId`);
  } else {
    console.log('❌ Memory server failed to initialize');
  }
});
