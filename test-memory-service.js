const axios = require('axios');

// Generate unique identifiers for this test session
const uniqueUserId = `memory-test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const uniqueSessionId = `memory-test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

console.log(`🧠 Starting Memory Service Test`);
console.log(`👤 User ID: ${uniqueUserId}`);
console.log(`📱 Session ID: ${uniqueSessionId}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('=' * 80);

const BASE_URL = 'http://localhost:3001';

async function testMemoryService() {
  try {
    // Test 1: Check if memory service is initialized
    console.log('\n🔍 Test 1: Check memory service status');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/memory/status`, { timeout: 10000 });
      console.log('✅ Memory service status:', statusResponse.data);
    } catch (error) {
      console.log('❌ Memory service status check failed:', error.response?.data || error.message);
    }

    // Test 2: Store a simple memory
    console.log('\n🔍 Test 2: Store a simple memory');
    try {
      const storeResponse = await axios.post(`${BASE_URL}/api/memory/episodic`, {
        userId: uniqueUserId,
        sessionId: uniqueSessionId,
        content: "User asked about weather in Berlin",
        context: {
          conversation_turn: Date.now(),
          user_input: true
        },
        metadata: {
          source: 'test',
          importance: 0.8,
          tags: ['weather', 'berlin', 'test']
        }
      }, { timeout: 15000 });
      console.log('✅ Memory stored:', storeResponse.data);
    } catch (error) {
      console.log('❌ Memory storage failed:', error.response?.data || error.message);
    }

    // Test 3: Retrieve memory context
    console.log('\n🔍 Test 3: Retrieve memory context');
    try {
      const contextResponse = await axios.get(`${BASE_URL}/api/memory/context/${uniqueUserId}/${uniqueSessionId}`, { timeout: 15000 });
      console.log('✅ Memory context retrieved:', contextResponse.data);
    } catch (error) {
      console.log('❌ Memory context retrieval failed:', error.response?.data || error.message);
    }

    // Test 4: Search memories
    console.log('\n🔍 Test 4: Search memories');
    try {
      const searchResponse = await axios.post(`${BASE_URL}/api/memory/search`, {
        query: "weather berlin",
        userId: uniqueUserId,
        type: 'episodic',
        limit: 10
      }, { timeout: 15000 });
      console.log('✅ Memory search completed:', searchResponse.data);
    } catch (error) {
      console.log('❌ Memory search failed:', error.response?.data || error.message);
    }

    // Test 5: Test enhanced agent with memory
    console.log('\n🔍 Test 5: Test enhanced agent with memory');
    try {
      const agentResponse = await axios.post(`${BASE_URL}/api/agent/enhanced-execute`, {
        query: "What did I ask about earlier?",
        options: {
          userId: uniqueUserId,
          sessionId: uniqueSessionId,
          includeMemoryContext: true,
          maxMemoryResults: 10,
          model: 'openai',
          temperature: 0.7,
          includeReasoning: true,
          responseDetailLevel: 'detailed',
          excludeVectors: false,
          enableContextCompression: true,
          maxTokens: 8000
        }
      }, { timeout: 30000 });
      console.log('✅ Enhanced agent response:', {
        success: agentResponse.data.success,
        intent: agentResponse.data.data.intent?.type,
        hasMemoryContext: !!agentResponse.data.data.memoryContext,
        hasWorkingMemory: !!agentResponse.data.data.workingMemoryContext,
        response: agentResponse.data.data.response?.substring(0, 200) + '...'
      });
    } catch (error) {
      console.log('❌ Enhanced agent test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testMemoryService();


