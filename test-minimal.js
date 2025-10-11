#!/usr/bin/env node

/**
 * Minimal Enhanced Agent Test
 * 
 * This is the most basic test to verify the enhanced agent works with Ollama.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMinimal() {
  try {
    console.log('🚀 Testing Minimal Enhanced Agent with Ollama');
    console.log('=' .repeat(50));
    
    // Initialize agent
    console.log('\n1. Initializing Enhanced Agent...');
    const initResponse = await axios.post(`${BASE_URL}/api/agent/enhanced-initialize`, {}, {
      timeout: 120000
    });
    
    if (initResponse.data.success) {
      console.log('✅ Enhanced Agent initialized successfully');
    } else {
      throw new Error('Failed to initialize Enhanced Agent');
    }
    
    // Test simple query
    console.log('\n2. Testing simple query...');
    const response = await axios.post(`${BASE_URL}/api/agent/enhanced-execute`, {
      query: "Hello, how are you?",
      options: {
        userId: 'test-user',
        sessionId: 'test-session',
        includeMemoryContext: false,
        includeReasoning: false,
        model: 'ollama',
        maxTokens: 1000,
        responseDetailLevel: 'minimal'
      }
    }, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Query executed successfully');
    console.log(`Response: ${response.data.data.response.substring(0, 100)}...`);
    console.log(`Intent: ${response.data.data.intent.type} (${Math.round(response.data.data.intent.confidence * 100)}%)`);
    console.log(`Execution Time: ${response.data.data.metadata?.executionTime || 'N/A'}ms`);
    
    console.log('\n🎉 Minimal test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testMinimal();
