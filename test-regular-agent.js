#!/usr/bin/env node

/**
 * Test Regular Agent (not Enhanced)
 * 
 * This tests the regular agent endpoint to see if basic functionality works.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRegularAgent() {
  try {
    console.log('🚀 Testing Regular Agent');
    console.log('=' .repeat(50));
    
    // Initialize regular agent
    console.log('\n1. Initializing Regular Agent...');
    const initResponse = await axios.post(`${BASE_URL}/api/agent/initialize`, {}, {
      timeout: 30000
    });
    
    if (initResponse.data.success) {
      console.log('✅ Regular Agent initialized successfully');
    } else {
      throw new Error('Failed to initialize Regular Agent');
    }
    
    // Test simple query
    console.log('\n2. Testing simple query...');
    const response = await axios.post(`${BASE_URL}/api/agent/execute`, {
      query: "Hello, how are you?",
      options: {
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false,
        model: 'ollama',
        maxTokens: 1000
      }
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Query executed successfully');
    console.log(`Response: ${response.data.data.response.substring(0, 100)}...`);
    console.log(`Intent: ${response.data.data.intent.type} (${Math.round(response.data.data.intent.confidence * 100)}%)`);
    console.log(`Execution Time: ${response.data.data.metadata?.executionTime || 'N/A'}ms`);
    
    console.log('\n🎉 Regular agent test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testRegularAgent();
