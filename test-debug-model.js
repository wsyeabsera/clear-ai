#!/usr/bin/env node

/**
 * Debug test to check model configuration
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDebugModel() {
  console.log('🐛 Debug Model Test\n');
  
  // Test 1: Check server status
  console.log('1️⃣ Checking Server Status');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agent/status`, { timeout: 5000 });
    console.log(`   ✅ Server is running (${response.status})`);
  } catch (error) {
    console.log(`   ❌ Server not responding: ${error.message}`);
    return;
  }
  
  // Test 2: Check Ollama directly
  console.log('\n2️⃣ Checking Ollama Directly');
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:latest',
      prompt: 'Hello',
      stream: false
    }, { timeout: 10000 });
    console.log(`   ✅ Ollama is working: ${response.data.response}`);
  } catch (error) {
    console.log(`   ❌ Ollama error: ${error.message}`);
  }
  
  // Test 3: Test with minimal options
  console.log('\n3️⃣ Testing with Minimal Options');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/enhanced-execute`, {
      query: 'Hello',
      options: {
        model: 'ollama',
        userId: 'test',
        sessionId: 'test',
        includeMemoryContext: false,
        includeReasoning: false,
        maxTokens: 50
      }
    }, {
      timeout: 20000
    });
    
    console.log(`   ✅ Success: ${response.data.success}`);
    console.log(`   ✅ Model: ${response.data.data?.model || 'Not specified'}`);
    console.log(`   ✅ Response: ${response.data.data?.response || 'No response'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || error.code}`);
    console.log(`   ❌ Message: ${error.response?.data?.error || error.message}`);
    
    // If it's a timeout, let's check if it's a specific issue
    if (error.code === 'ECONNABORTED') {
      console.log(`   ⏰ Request timed out - this might indicate an issue with model initialization`);
    }
  }
  
  // Test 4: Test regular agent (simpler)
  console.log('\n4️⃣ Testing Regular Agent');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent/execute`, {
      query: 'Hello',
      options: {
        model: 'ollama',
        userId: 'test',
        sessionId: 'test',
        includeMemoryContext: false,
        maxTokens: 50
      }
    }, {
      timeout: 20000
    });
    
    console.log(`   ✅ Success: ${response.data.success}`);
    console.log(`   ✅ Model: ${response.data.data?.model || 'Not specified'}`);
    console.log(`   ✅ Response: ${response.data.data?.response || 'No response'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || error.code}`);
    console.log(`   ❌ Message: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('\n🏁 Debug Test Complete');
}

// Run the test
testDebugModel().catch(console.error);
