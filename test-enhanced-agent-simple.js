#!/usr/bin/env node

/**
 * Simple Enhanced Agent Test
 * 
 * This is a quick test to verify the enhanced agent is working
 * with proper context compression and reasonable settings.
 */

const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'test-user-simple';
const TEST_SESSION_ID = 'test-session-simple';

async function makeRequest(query, options = {}) {
  try {
    const response = await axios.post(`${BASE_URL}/api/agent/enhanced-execute`, {
      query,
      options: {
        userId: TEST_USER_ID,
        sessionId: TEST_SESSION_ID,
        includeMemoryContext: true,
        includeReasoning: true,
        enableContextCompression: true,
        contextCompressionThreshold: 0.8,
        maxTokens: 4000,
        maxMemoryResults: 3,
        responseDetailLevel: 'standard',
        excludeVectors: true,
        model: 'ollama',
        ...options
      }
    }, {
      timeout: 120000, // 2 minutes for Ollama
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function testSimpleQueries() {
  console.log('🧪 Testing Simple Enhanced Agent Queries');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      query: "Hello, how are you?",
      description: "Simple conversation",
      expectedIntent: "conversation"
    },
    {
      query: "Calculate 5 + 3",
      description: "Basic calculation",
      expectedIntent: "tool_execution"
    },
    {
      query: "Get the weather in London",
      description: "Weather API call",
      expectedIntent: "tool_execution"
    },
    {
      query: "Remember that I like Python programming",
      description: "Memory storage",
      expectedIntent: "memory_chat"
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.description}`);
      console.log(`Query: "${test.query}"`);
      
      const result = await makeRequest(test.query);
      
      console.log(`✅ Success: ${result.success}`);
      console.log(`🎯 Intent: ${result.data.intent.type} (${Math.round(result.data.intent.confidence * 100)}%)`);
      console.log(`⏱️  Execution Time: ${result.data.metadata?.executionTime || 'N/A'}ms`);
      console.log(`🧠 Memory Retrieved: ${result.data.metadata?.memoryRetrieved || 0}`);
      console.log(`🔧 Tools Executed: ${result.data.metadata?.toolsExecuted || 0}`);
      
      if (result.data.response) {
        const responsePreview = result.data.response.substring(0, 100);
        console.log(`💬 Response Preview: ${responsePreview}${result.data.response.length > 100 ? '...' : ''}`);
      }
      
      assert(result.success, `Query should succeed: ${test.query}`);
      assert(result.data.intent, 'Intent should be present');
      assert(result.data.intent.type, 'Intent type should be present');
      
      console.log(`✅ Test passed: ${test.description}`);
      
    } catch (error) {
      console.log(`❌ Test failed: ${test.description}`);
      console.log(`Error: ${error.message}`);
    }
  }
}

async function testContextCompression() {
  console.log('\n🧠 Testing Context Compression');
  console.log('=' .repeat(50));
  
  try {
    // Store some memories first
    await makeRequest("Remember that I am a software developer");
    await makeRequest("Remember that I work with Python and JavaScript");
    await makeRequest("Remember that I like machine learning");
    
    // Now test a query that should use context compression
    const result = await makeRequest("Based on what you know about me, what programming languages do I work with?", {
      enableContextCompression: true,
      contextCompressionThreshold: 0.8,
      maxMemoryResults: 5
    });
    
    console.log(`✅ Context compression test: ${result.success}`);
    console.log(`🧠 Memories retrieved: ${result.data.metadata?.memoryRetrieved || 0}`);
    console.log(`💬 Response: ${result.data.response.substring(0, 200)}...`);
    
    assert(result.success, 'Context compression should work');
    assert(result.data.metadata?.memoryRetrieved > 0, 'Should retrieve memories');
    
    console.log('✅ Context compression test passed');
    
  } catch (error) {
    console.log(`❌ Context compression test failed: ${error.message}`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Simple Enhanced Agent Test');
    console.log('=' .repeat(60));
    
    // Initialize agent
    console.log('\n🚀 Initializing Enhanced Agent...');
    const initResponse = await axios.post(`${BASE_URL}/api/agent/enhanced-initialize`, {}, {
      timeout: 120000
    });
    
    if (initResponse.data.success) {
      console.log('✅ Enhanced Agent initialized successfully');
    } else {
      throw new Error('Failed to initialize Enhanced Agent');
    }
    
    // Run tests
    await testSimpleQueries();
    await testContextCompression();
    
    console.log('\n🎉 Simple Enhanced Agent Test Completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Simple test failed:', error);
    process.exit(1);
  });
}

module.exports = { testSimpleQueries, testContextCompression };
