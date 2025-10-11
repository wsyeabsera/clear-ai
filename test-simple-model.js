#!/usr/bin/env node

/**
 * Simple test to check if model is being passed correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testSimpleModel() {
  console.log('🔬 Simple Model Test\n');
  
  // Test with a very simple query and short timeout
  console.log('Testing Enhanced Agent with Ollama model...');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'Hello',
      options: {
        model: 'ollama',
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false,
        maxTokens: 100
      }
    }, {
      timeout: 15000 // 15 second timeout
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Success: ${response.data.success}`);
    console.log(`✅ Model Used: ${response.data.data?.model || 'Not specified'}`);
    console.log(`✅ Response: ${response.data.data?.response || 'No response'}`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.code}`);
    console.log(`❌ Message: ${error.response?.data?.error || error.message}`);
    
    if (error.response?.data) {
      console.log(`❌ Full Error: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n🏁 Simple Test Complete');
}

// Run the test
testSimpleModel().catch(console.error);
