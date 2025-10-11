#!/usr/bin/env node

/**
 * Test script to verify that model options are being passed correctly
 * in all LLM-related calls throughout the system
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testModelPassing() {
  console.log('🧪 Testing Model Option Passing in LLM Calls\n');
  
  const testCases = [
    {
      name: 'Enhanced Agent Execute',
      endpoint: '/api/agent/enhanced-execute',
      payload: {
        query: 'What is 2+2?',
        options: {
          model: 'ollama',
          userId: 'test-user',
          sessionId: 'test-session'
        }
      }
    },
    {
      name: 'Regular Agent Execute',
      endpoint: '/api/agent/execute',
      payload: {
        query: 'What is 2+2?',
        options: {
          model: 'ollama',
          userId: 'test-user',
          sessionId: 'test-session'
        }
      }
    },
    {
      name: 'Intent Classification',
      endpoint: '/api/intent/classify',
      payload: {
        query: 'What is the weather like?',
        options: {
          model: 'ollama'
        }
      }
    },
    {
      name: 'Memory Chat',
      endpoint: '/api/memory/chat',
      payload: {
        query: 'Hello, how are you?',
        options: {
          model: 'ollama',
          userId: 'test-user',
          sessionId: 'test-session'
        }
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`   Endpoint: ${testCase.endpoint}`);
    console.log(`   Model: ${testCase.payload.options.model}`);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}${testCase.endpoint}`,
        testCase.payload,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Success: ${response.data.success}`);
      
      if (response.data.data && response.data.data.model) {
        console.log(`   ✅ Model Used: ${response.data.data.model}`);
      } else {
        console.log(`   ⚠️  Model not returned in response`);
      }
      
      if (response.data.message) {
        console.log(`   📝 Message: ${response.data.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.code}`);
      console.log(`   ❌ Message: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.data?.message) {
        console.log(`   📝 Details: ${error.response.data.message}`);
      }
    }
  }
  
  console.log('\n🔍 Testing Model Availability');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agent/status`);
    console.log(`   ✅ Agent Status: ${response.status}`);
    if (response.data.data && response.data.data.availableModels) {
      console.log(`   📋 Available Models: ${response.data.data.availableModels.join(', ')}`);
    }
  } catch (error) {
    console.log(`   ❌ Status Check Failed: ${error.message}`);
  }
  
  console.log('\n🏁 Test Complete');
}

// Run the test
testModelPassing().catch(console.error);
