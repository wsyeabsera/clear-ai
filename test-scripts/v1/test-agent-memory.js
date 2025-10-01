const { AgentService } = require('../../dist/shared/services/AgentService');
const { MemoryContextService } = require('../../dist/shared/services/MemoryContextService');
const { IntentClassifierService } = require('../../dist/shared/services/IntentClassifierService');
const { SimpleLangChainService } = require('../../dist/shared/services/SimpleLangChainService');
const { ToolRegistry } = require('../../dist/mcp/tool-registry');
const dotenv = require('dotenv');
dotenv.config({path: './packages/server/.env'});

async function testAgentMemory() {
  try {
    console.log('🧪 Testing Agent Memory Storage...');
    
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
      ollamaModel: process.env.OLLAMA_MODEL || 'mistral:latest',
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
      langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
    };

    // Initialize services
    const memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    await memoryService.initialize();
    console.log('✅ Memory service initialized');

    const toolRegistry = new ToolRegistry();
    const intentClassifier = new IntentClassifierService(langchainConfig, toolRegistry);
    const langchainService = new SimpleLangChainService(langchainConfig);

    const agentConfig = {
      memoryService,
      intentClassifier,
      langchainService,
      toolRegistry,
      defaultOptions: {
        includeMemoryContext: true,
        maxMemoryResults: 10,
        model: 'ollama',
        temperature: 0.7,
        includeReasoning: true
      }
    };

    const agent = new AgentService(agentConfig);
    await agent.initialize();
    console.log('✅ Agent service initialized');

    // Test query
    const result = await agent.executeQuery('My name is Alice and I am a software developer', {
      userId: 'test-user-6',
      sessionId: 'test-session-6',
      includeMemoryContext: true,
      includeReasoning: true
    });

    console.log('✅ Query executed:', result.success);
    console.log('Response:', result.response.substring(0, 100) + '...');

    // Check if memory was stored
    const context = await memoryService.getMemoryContext('test-user-6', 'test-session-6');
    console.log(`📝 Memory context: ${context.episodicMemories.length} episodic, ${context.semanticMemories.length} semantic memories`);

    if (context.episodicMemories.length > 0) {
      console.log('Recent memories:');
      context.episodicMemories.slice(0, 3).forEach((mem, i) => {
        console.log(`  ${i+1}. [${mem.timestamp}] ${mem.content.substring(0, 80)}...`);
      });
    }

    await memoryService.close();
    console.log('✅ Test complete');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAgentMemory();
