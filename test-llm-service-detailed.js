#!/usr/bin/env node

/**
 * Detailed test to check LLM service configuration and model usage
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testLLMServiceDetailed() {
  console.log('🔬 Detailed LLM Service Test\n');
  
  // Test 1: Check what models are available
  console.log('1️⃣ Testing Model Availability');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agent/status`);
    console.log(`   Status: ${response.status}`);
    if (response.data.data) {
      console.log(`   Available Models: ${JSON.stringify(response.data.data.availableModels || [], null, 2)}`);
      console.log(`   Default Model: ${response.data.data.defaultModel || 'Not specified'}`);
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }
  
  // Test 2: Test with explicit Ollama model
  console.log('\n2️⃣ Testing with Explicit Ollama Model');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'What is 2+2?',
      options: {
        model: 'ollama',
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false
      }
    }, {
      timeout: 30000
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Model Used: ${response.data.data?.model || 'Not specified'}`);
    console.log(`   Response Time: ${response.data.data?.executionTime || 'Not specified'}ms`);
    
    if (response.data.data?.reasoning) {
      console.log(`   Reasoning Available: Yes`);
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.code}`);
    console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
  }
  
  // Test 3: Test with mistral-ollama model
  console.log('\n3️⃣ Testing with Mistral-Ollama Model');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'What is 2+2?',
      options: {
        model: 'mistral-ollama',
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false
      }
    }, {
      timeout: 30000
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Model Used: ${response.data.data?.model || 'Not specified'}`);
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.code}`);
    console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
  }
  
  // Test 4: Test with no model specified (should default to ollama)
  console.log('\n4️⃣ Testing with No Model Specified (Default)');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'What is 2+2?',
      options: {
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false
      }
    }, {
      timeout: 30000
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Model Used: ${response.data.data?.model || 'Not specified'}`);
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.code}`);
    console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
  }
  
  // Test 5: Test API call functionality
  console.log('\n5️⃣ Testing API Call Functionality');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'Make a GET request to https://jsonplaceholder.typicode.com/posts/1',
      options: {
        model: 'ollama',
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false
      }
    }, {
      timeout: 60000 // Longer timeout for API calls
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Model Used: ${response.data.data?.model || 'Not specified'}`);
    
    if (response.data.data?.response) {
      console.log(`   Response Length: ${response.data.data.response.length} characters`);
      console.log(`   Response Preview: ${response.data.data.response.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.code}`);
    console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('\n🏁 Detailed Test Complete');
}

// Run the test
testLLMServiceDetailed().catch(console.error);
