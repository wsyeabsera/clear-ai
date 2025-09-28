/**
 * Test script for the memory system with Ollama embeddings
 * Run with: node test-memory-system.js
 * 
 * Prerequisites:
 * 1. Ollama running with nomic-embed-text model
 * 2. Neo4j running (default: bolt://localhost:7687)
 * 3. Pinecone account and API key
 * 4. Server running on port 3001
 */

const BASE_URL = 'http://localhost:3001';
const USER_ID = 'test-user-123';
const SESSION_ID = 'test-session-456';

// Test data
const testEpisodicMemories = [
  {
    userId: USER_ID,
    sessionId: SESSION_ID,
    content: "User asked about machine learning algorithms and how they work",
    context: { conversation_turn: 1, topic: "AI" },
    metadata: {
      source: "chat",
      importance: 0.8,
      tags: ["AI", "machine learning", "algorithms"],
      location: "web interface"
    }
  },
  {
    userId: USER_ID,
    sessionId: SESSION_ID,
    content: "Discussed neural networks and deep learning concepts",
    context: { conversation_turn: 2, topic: "AI" },
    metadata: {
      source: "chat",
      importance: 0.9,
      tags: ["AI", "neural networks", "deep learning"],
      location: "web interface"
    }
  },
  {
    userId: USER_ID,
    sessionId: SESSION_ID,
    content: "User mentioned they work in software development",
    context: { conversation_turn: 3, topic: "personal" },
    metadata: {
      source: "chat",
      importance: 0.6,
      tags: ["personal", "work", "software development"],
      location: "web interface"
    }
  }
];

const testSemanticMemories = [
  {
    userId: USER_ID,
    concept: "Machine Learning",
    description: "A subset of artificial intelligence that focuses on algorithms that can learn from data without being explicitly programmed",
    metadata: {
      category: "AI",
      confidence: 0.9,
      source: "wikipedia",
      lastAccessed: new Date(),
      accessCount: 0
    }
  },
  {
    userId: USER_ID,
    concept: "Neural Networks",
    description: "Computing systems inspired by biological neural networks that can learn to perform tasks by considering examples",
    metadata: {
      category: "AI",
      confidence: 0.85,
      source: "wikipedia",
      lastAccessed: new Date(),
      accessCount: 0
    }
  },
  {
    userId: USER_ID,
    concept: "Software Development",
    description: "The process of conceiving, specifying, designing, programming, documenting, testing, and bug fixing involved in creating and maintaining applications",
    metadata: {
      category: "Technology",
      confidence: 0.8,
      source: "wikipedia",
      lastAccessed: new Date(),
      accessCount: 0
    }
  }
];

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.message || result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ API request failed: ${error.message}`);
    throw error;
  }
};

// Test functions
const testOllamaConnection = async () => {
  console.log('\n🧪 Testing Ollama connection...');
  
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: 'test'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Ollama connected! Embedding dimension: ${data.embedding.length}`);
      return true;
    } else {
      throw new Error(`Ollama not responding: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Ollama connection failed: ${error.message}`);
    console.log('💡 Make sure Ollama is running with: ollama serve');
    console.log('💡 And pull the model with: ollama pull nomic-embed-text');
    return false;
  }
};

const testServerConnection = async () => {
  console.log('\n🧪 Testing server connection...');
  
  try {
    const result = await apiRequest('/api/health');
    console.log('✅ Server connected!');
    return true;
  } catch (error) {
    console.log(`❌ Server connection failed: ${error.message}`);
    console.log('💡 Make sure the server is running on port 3001');
    return false;
  }
};

const testMemoryInitialization = async () => {
  console.log('\n🧪 Testing memory service initialization...');
  
  try {
    const result = await apiRequest('/api/memory-chat/initialize', 'POST');
    console.log('✅ Memory service initialized!');
    return true;
  } catch (error) {
    console.log(`❌ Memory initialization failed: ${error.message}`);
    return false;
  }
};

const testEpisodicMemoryStorage = async () => {
  console.log('\n🧪 Testing episodic memory storage...');
  
  try {
    const results = [];
    
    for (const memory of testEpisodicMemories) {
      const result = await apiRequest('/api/memory/episodic', 'POST', memory);
      results.push(result.data);
      console.log(`✅ Stored: "${memory.content.substring(0, 50)}..."`);
    }
    
    console.log(`✅ Stored ${results.length} episodic memories`);
    return results;
  } catch (error) {
    console.log(`❌ Episodic memory storage failed: ${error.message}`);
    return [];
  }
};

const testSemanticMemoryStorage = async () => {
  console.log('\n🧪 Testing semantic memory storage...');
  
  try {
    const results = [];
    
    for (const memory of testSemanticMemories) {
      const result = await apiRequest('/api/memory/semantic', 'POST', memory);
      results.push(result.data);
      console.log(`✅ Stored: "${memory.concept}"`);
    }
    
    console.log(`✅ Stored ${results.length} semantic memories`);
    return results;
  } catch (error) {
    console.log(`❌ Semantic memory storage failed: ${error.message}`);
    return [];
  }
};

const testMemorySearch = async () => {
  console.log('\n🧪 Testing memory search...');
  
  try {
    // Test episodic search
    const episodicResult = await apiRequest('/api/memory/episodic/search', 'POST', {
      userId: USER_ID,
      query: 'machine learning',
      limit: 5
    });
    
    console.log(`✅ Found ${episodicResult.data.length} episodic memories`);
    
    // Test semantic search
    const semanticResult = await apiRequest('/api/memory/semantic/search', 'POST', {
      userId: USER_ID,
      query: 'artificial intelligence',
      limit: 5
    });
    
    console.log(`✅ Found ${semanticResult.data.length} semantic memories`);
    
    return { episodic: episodicResult.data, semantic: semanticResult.data };
  } catch (error) {
    console.log(`❌ Memory search failed: ${error.message}`);
    return { episodic: [], semantic: [] };
  }
};

const testChatFunctionality = async () => {
  console.log('\n🧪 Testing chat functionality...');
  
  try {
    const chatResult = await apiRequest('/api/memory-chat/chat', 'POST', {
      userId: USER_ID,
      sessionId: SESSION_ID,
      message: "What did we discuss about AI?",
      includeMemories: true
    });
    
    console.log('✅ Chat response generated!');
    console.log(`📝 Response: ${chatResult.data.message}`);
    console.log(`🧠 Context length: ${chatResult.data.context.length} characters`);
    console.log(`📚 Relevant memories: ${chatResult.data.memories.episodic.length} episodic, ${chatResult.data.memories.semantic.length} semantic`);
    
    return chatResult.data;
  } catch (error) {
    console.log(`❌ Chat functionality failed: ${error.message}`);
    return null;
  }
};

const testKnowledgeStorage = async () => {
  console.log('\n🧪 Testing knowledge storage...');
  
  try {
    const knowledgeResult = await apiRequest('/api/memory-chat/knowledge', 'POST', {
      userId: USER_ID,
      concept: "Deep Learning",
      description: "A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data",
      category: "AI"
    });
    
    console.log(`✅ Knowledge stored: "${knowledgeResult.data.memory.concept}"`);
    return knowledgeResult.data;
  } catch (error) {
    console.log(`❌ Knowledge storage failed: ${error.message}`);
    return null;
  }
};

const testMemoryStats = async () => {
  console.log('\n🧪 Testing memory statistics...');
  
  try {
    const statsResult = await apiRequest(`/api/memory/stats/${USER_ID}`);
    
    console.log('✅ Memory statistics retrieved:');
    console.log(`📊 Episodic memories: ${statsResult.data.episodic.count}`);
    console.log(`📊 Semantic memories: ${statsResult.data.semantic.count}`);
    console.log(`📊 Categories: ${statsResult.data.semantic.categories.join(', ')}`);
    
    return statsResult.data;
  } catch (error) {
    console.log(`❌ Memory stats failed: ${error.message}`);
    return null;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Memory System Tests with Ollama Embeddings\n');
  
  // Check prerequisites
  const ollamaOk = await testOllamaConnection();
  if (!ollamaOk) return;
  
  const serverOk = await testServerConnection();
  if (!serverOk) return;
  
  // Initialize memory system
  const initOk = await testMemoryInitialization();
  if (!initOk) return;
  
  // Test memory storage
  const episodicMemories = await testEpisodicMemoryStorage();
  const semanticMemories = await testSemanticMemoryStorage();
  
  // Test memory search
  await testMemorySearch();
  
  // Test chat functionality
  await testChatFunctionality();
  
  // Test knowledge storage
  await testKnowledgeStorage();
  
  // Test memory statistics
  await testMemoryStats();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log(`   • Episodic memories stored: ${episodicMemories.length}`);
  console.log(`   • Semantic memories stored: ${semanticMemories.length}`);
  console.log(`   • Using Ollama nomic-embed-text for embeddings`);
  console.log(`   • Neo4j for episodic memory storage`);
  console.log(`   • Pinecone for semantic memory storage`);
  
  console.log('\n🔗 Available endpoints:');
  console.log(`   • Memory API: ${BASE_URL}/api/memory`);
  console.log(`   • Chat API: ${BASE_URL}/api/memory-chat`);
  console.log(`   • Documentation: ${BASE_URL}/api-docs`);
};

// Run the tests
runTests().catch(console.error);
