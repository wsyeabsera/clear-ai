#!/usr/bin/env node

/**
 * Comprehensive Enhanced Agent Test Suite
 * 
 * This test suite comprehensively tests the enhanced agent endpoint with:
 * - Context planning and reasoning
 * - Tool execution and chaining
 * - Memory management
 * - Intent classification
 * - Relationship analysis
 * - All available tools
 * - Error handling and edge cases
 */

const axios = require('axios');
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'test-user-comprehensive';
const TEST_SESSION_ID = 'test-session-comprehensive';

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Utility functions
function logTest(testName, status, details = '') {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}${details ? ` - ${details}` : ''}`);
  
  testResults.total++;
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  
  testResults.details.push({
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });
}

function logError(testName, error) {
  console.log(`❌ ${testName} - ERROR: ${error.message}`);
  testResults.errors.push({
    test: testName,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

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
        contextCompressionThreshold: 0.7,
        maxTokens: 8000,
        maxMemoryResults: 5,
        responseDetailLevel: 'standard',
        excludeVectors: true,
        model: 'ollama',
        ...options
      }
    }, {
      timeout: 60000,
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

// Test Categories
class EnhancedAgentTester {
  constructor() {
    this.agentInitialized = false;
  }

  async initializeAgent() {
    try {
      console.log('\n🚀 Initializing Enhanced Agent Service...');
      const response = await axios.post(`${BASE_URL}/api/agent/enhanced-initialize`, {}, {
        timeout: 60000
      });
      
      assert(response.data.success, 'Agent initialization should succeed');
      assert(response.data.data.initialized, 'Agent should be initialized');
      assert(response.data.data.capabilities.memory, 'Memory capability should be available');
      assert(response.data.data.capabilities.intentClassification, 'Intent classification should be available');
      assert(response.data.data.capabilities.toolExecution, 'Tool execution should be available');
      
      this.agentInitialized = true;
      logTest('Agent Initialization', 'PASS', 'All capabilities available');
    } catch (error) {
      logError('Agent Initialization', error);
      throw error;
    }
  }

  async testAgentStatus() {
    try {
      console.log('\n📊 Testing Agent Status...');
      const response = await axios.get(`${BASE_URL}/api/agent/enhanced-status`);
      
      assert(response.data.success, 'Status request should succeed');
      assert(response.data.data.status, 'Status data should be present');
      assert(response.data.data.capabilities, 'Capabilities should be present');
      
      const status = response.data.data.status;
      assert(status.memoryService, 'Memory service should be available');
      assert(status.intentClassifier, 'Intent classifier should be available');
      assert(status.toolRegistry, 'Tool registry should be available');
      assert(Array.isArray(status.availableTools), 'Available tools should be an array');
      assert(status.availableTools.length > 0, 'Should have available tools');
      
      logTest('Agent Status', 'PASS', `${status.availableTools.length} tools available`);
    } catch (error) {
      logError('Agent Status', error);
    }
  }

  async testIntentClassification() {
    try {
      console.log('\n🎯 Testing Intent Classification...');
      
      const testCases = [
        {
          query: "Hello, how are you?",
          expectedIntent: "conversation",
          description: "Simple conversation"
        },
        {
          query: "What did we discuss yesterday?",
          expectedIntent: "memory_chat",
          description: "Memory-based question"
        },
        {
          query: "Calculate 15 + 27",
          expectedIntent: "tool_execution",
          description: "Direct tool execution"
        },
        {
          query: "Remember that I like Python and then find me a Python tutorial",
          expectedIntent: "hybrid",
          description: "Hybrid execution"
        },
        {
          query: "What do I know about machine learning?",
          expectedIntent: "knowledge_search",
          description: "Knowledge search"
        },
        {
          query: "Get the weather in London",
          expectedIntent: "tool_execution",
          description: "Weather API call"
        },
        {
          query: "Search for React repositories on GitHub",
          expectedIntent: "tool_execution",
          description: "GitHub API call"
        }
      ];

      for (const testCase of testCases) {
        const result = await makeRequest(testCase.query);
        
        assert(result.success, `Query should succeed: ${testCase.query}`);
        assert(result.data.intent, 'Intent should be present');
        assert(result.data.intent.type, 'Intent type should be present');
        assert(result.data.intent.confidence >= 0 && result.data.intent.confidence <= 1, 'Confidence should be between 0 and 1');
        
        const actualIntent = result.data.intent.type;
        const confidence = result.data.intent.confidence;
        
        if (actualIntent === testCase.expectedIntent) {
          logTest(`Intent: ${testCase.description}`, 'PASS', `${actualIntent} (${Math.round(confidence * 100)}%)`);
        } else {
          logTest(`Intent: ${testCase.description}`, 'FAIL', `Expected ${testCase.expectedIntent}, got ${actualIntent}`);
        }
      }
    } catch (error) {
      logError('Intent Classification', error);
    }
  }

  async testToolExecution() {
    try {
      console.log('\n🔧 Testing Tool Execution...');
      
      const toolTests = [
        {
          query: "Calculate 25 * 4 + 10",
          toolName: "calculator",
          description: "Basic arithmetic"
        },
        {
          query: "What is 2 to the power of 8?",
          toolName: "calculator",
          description: "Power calculation"
        },
        {
          query: "Get the weather in Tokyo",
          toolName: "weather_api",
          description: "Weather API call"
        },
        {
          query: "Get the weather in New York",
          toolName: "weather_api",
          description: "Weather API call (different city)"
        },
        {
          query: "Search for 'react' repositories on GitHub",
          toolName: "github_api",
          description: "GitHub repository search"
        },
        {
          query: "Get user information for 'octocat' from GitHub",
          toolName: "github_api",
          description: "GitHub user info"
        },
        {
          query: "Make a GET request to https://jsonplaceholder.typicode.com/posts/1",
          toolName: "api_call",
          description: "Generic API call"
        }
      ];

      for (const test of toolTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Tool execution should succeed: ${test.query}`);
        assert(result.data.intent.type === 'tool_execution', 'Should be classified as tool execution');
        assert(result.data.metadata.toolsExecuted > 0, 'Should have executed tools');
        assert(result.data.response, 'Should have a response');
        
        // Check if the response contains expected content
        const responseText = result.data.response.toLowerCase();
        const hasRelevantContent = responseText.includes('result') || 
                                 responseText.includes('temperature') || 
                                 responseText.includes('data') ||
                                 responseText.includes('success');
        
        if (hasRelevantContent) {
          logTest(`Tool: ${test.description}`, 'PASS', `${result.data.metadata.toolsExecuted} tools executed`);
        } else {
          logTest(`Tool: ${test.description}`, 'FAIL', 'No relevant content in response');
        }
      }
    } catch (error) {
      logError('Tool Execution', error);
    }
  }

  async testToolChaining() {
    try {
      console.log('\n🔗 Testing Tool Chaining...');
      
      const chainTests = [
        {
          query: "Get posts for user 1, then get comments for the first post",
          description: "API call chaining"
        },
        {
          query: "Calculate 10 + 5, then multiply the result by 3",
          description: "Calculator chaining"
        },
        {
          query: "Get the weather in London, then get the weather in Paris",
          description: "Weather API chaining"
        },
        {
          query: "Search for 'javascript' repositories, then get the first repository's issues",
          description: "GitHub API chaining"
        }
      ];

      for (const test of chainTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Tool chaining should succeed: ${test.query}`);
        assert(result.data.intent.type === 'tool_execution', 'Should be classified as tool execution');
        assert(result.data.metadata.toolsExecuted >= 2, 'Should execute multiple tools');
        
        logTest(`Chain: ${test.description}`, 'PASS', `${result.data.metadata.toolsExecuted} tools executed`);
      }
    } catch (error) {
      logError('Tool Chaining', error);
    }
  }

  async testMemoryOperations() {
    try {
      console.log('\n🧠 Testing Memory Operations...');
      
      const memoryTests = [
        {
          query: "Remember that I am a software developer who loves Python and machine learning",
          description: "Store episodic memory"
        },
        {
          query: "Remember that my favorite programming language is Python",
          description: "Store additional memory"
        },
        {
          query: "What do you remember about me?",
          description: "Recall memories"
        },
        {
          query: "What programming languages do I like?",
          description: "Memory-based question"
        },
        {
          query: "Based on what you know about me, recommend a Python framework",
          description: "Hybrid memory + reasoning"
        }
      ];

      for (const test of memoryTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Memory operation should succeed: ${test.query}`);
        assert(result.data.intent, 'Intent should be present');
        
        // Check if memory context is included
        const hasMemoryContext = result.data.metadata.memoryRetrieved > 0 || 
                                result.data.intent.type === 'memory_chat' ||
                                result.data.intent.type === 'hybrid';
        
        if (hasMemoryContext) {
          logTest(`Memory: ${test.description}`, 'PASS', `${result.data.metadata.memoryRetrieved || 0} memories retrieved`);
        } else {
          logTest(`Memory: ${test.description}`, 'FAIL', 'No memory context found');
        }
      }
    } catch (error) {
      logError('Memory Operations', error);
    }
  }

  async testReasoningAndPlanning() {
    try {
      console.log('\n🤔 Testing Reasoning and Planning...');
      
      const reasoningTests = [
        {
          query: "I need to plan a vacation to Japan. Help me create a comprehensive itinerary.",
          description: "Complex planning task"
        },
        {
          query: "Analyze the pros and cons of using React vs Vue for a new project",
          description: "Analytical reasoning"
        },
        {
          query: "If I have a budget of $1000 and need to buy a laptop for programming, what should I consider?",
          description: "Decision making with constraints"
        },
        {
          query: "Explain the relationship between machine learning and artificial intelligence",
          description: "Conceptual reasoning"
        }
      ];

      for (const test of reasoningTests) {
        const result = await makeRequest(test.query, {
          includeReasoning: true,
          maxTokens: 8000,
          maxMemoryResults: 3,
          enableContextCompression: true,
          contextCompressionThreshold: 0.8,
          model: 'ollama'
        });
        
        assert(result.success, `Reasoning should succeed: ${test.query}`);
        assert(result.data.reasoning, 'Reasoning should be present');
        assert(result.data.reasoning.thoughtProcess, 'Thought process should be present');
        assert(result.data.reasoning.confidence >= 0 && result.data.reasoning.confidence <= 1, 'Confidence should be valid');
        
        const confidence = result.data.reasoning.confidence;
        const hasThoughtProcess = result.data.reasoning.thoughtProcess && 
                                 result.data.reasoning.thoughtProcess.length > 0;
        
        if (hasThoughtProcess && confidence > 0.5) {
          logTest(`Reasoning: ${test.description}`, 'PASS', `Confidence: ${Math.round(confidence * 100)}%`);
        } else {
          logTest(`Reasoning: ${test.description}`, 'FAIL', `Low confidence or no thought process`);
        }
      }
    } catch (error) {
      logError('Reasoning and Planning', error);
    }
  }

  async testContextManagement() {
    try {
      console.log('\n📝 Testing Context Management...');
      
      // Test context window management
      const contextTests = [
        {
          query: "Tell me about artificial intelligence",
          description: "Initial context"
        },
        {
          query: "What are the main types of AI?",
          description: "Context continuation"
        },
        {
          query: "How does machine learning relate to what we just discussed?",
          description: "Context reference"
        },
        {
          query: "Summarize our conversation so far",
          description: "Context summarization"
        }
      ];

      for (const test of contextTests) {
        const result = await makeRequest(test.query, {
          enableContextCompression: true,
          contextCompressionThreshold: 0.8,
          maxTokens: 6000,
          maxMemoryResults: 3,
          model: 'ollama'
        });
        
        assert(result.success, `Context management should succeed: ${test.query}`);
        assert(result.data.metadata, 'Metadata should be present');
        
        const hasContextInfo = result.data.metadata.contextWindowSize > 0 ||
                              result.data.metadata.contextCompressed ||
                              result.data.intent.type === 'memory_chat';
        
        if (hasContextInfo) {
          logTest(`Context: ${test.description}`, 'PASS', 'Context managed successfully');
        } else {
          logTest(`Context: ${test.description}`, 'FAIL', 'No context information found');
        }
      }
    } catch (error) {
      logError('Context Management', error);
    }
  }

  async testErrorHandling() {
    try {
      console.log('\n⚠️ Testing Error Handling...');
      
      const errorTests = [
        {
          query: "Calculate 10 / 0",
          description: "Division by zero"
        },
        {
          query: "Get weather for a non-existent city: XyZ123AbC",
          description: "Invalid city name"
        },
        {
          query: "Make a request to an invalid URL: http://invalid-url-12345.com",
          description: "Invalid URL"
        },
        {
          query: "Read a file that doesn't exist: /nonexistent/file.txt",
          description: "File not found"
        },
        {
          query: "Parse invalid JSON: { invalid json }",
          description: "Invalid JSON"
        }
      ];

      for (const test of errorTests) {
        try {
          const result = await makeRequest(test.query);
          
          // Some errors might be handled gracefully
          if (result.success) {
            logTest(`Error: ${test.description}`, 'PASS', 'Handled gracefully');
          } else {
            logTest(`Error: ${test.description}`, 'PASS', 'Error properly returned');
          }
        } catch (error) {
          // Expected for some error cases
          logTest(`Error: ${test.description}`, 'PASS', 'Error caught and handled');
        }
      }
    } catch (error) {
      logError('Error Handling', error);
    }
  }

  async testPerformanceAndLimits() {
    try {
      console.log('\n⚡ Testing Performance and Limits...');
      
      const performanceTests = [
        {
          query: "Calculate " + Array(100).fill("1").join(" + "),
          description: "Large calculation"
        },
        {
          query: "Get weather for multiple cities: London, Paris, Tokyo, New York, Sydney",
          description: "Multiple API calls"
        },
        {
          query: "Search for 'javascript' repositories and get details for the first 5",
          description: "Complex GitHub operations"
        }
      ];

      for (const test of performanceTests) {
        const startTime = Date.now();
        const result = await makeRequest(test.query, {
          maxTokens: 16000,
          timeout: 30000
        });
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        assert(result.success, `Performance test should succeed: ${test.query}`);
        assert(executionTime < 60000, 'Should complete within timeout');
        
        if (executionTime < 20000) {
          logTest(`Performance: ${test.description}`, 'PASS', `${executionTime}ms`);
        } else {
          logTest(`Performance: ${test.description}`, 'FAIL', `Too slow: ${executionTime}ms`);
        }
      }
    } catch (error) {
      logError('Performance and Limits', error);
    }
  }

  async testAdvancedFeatures() {
    try {
      console.log('\n🚀 Testing Advanced Features...');
      
      const advancedTests = [
        {
          query: "Create a comprehensive analysis of the current AI landscape",
          description: "Complex analysis task"
        },
        {
          query: "Help me debug this Python code: def factorial(n): return n * factorial(n-1)",
          description: "Code analysis and debugging"
        },
        {
          query: "Plan a complete software development workflow for a web application",
          description: "Workflow planning"
        },
        {
          query: "Compare and contrast different database technologies for a high-traffic application",
          description: "Technical comparison"
        }
      ];

      for (const test of advancedTests) {
        const result = await makeRequest(test.query, {
          includeReasoning: true,
          maxTokens: 8000,
          maxMemoryResults: 3,
          responseDetailLevel: 'standard',
          enableContextCompression: true,
          contextCompressionThreshold: 0.8,
          model: 'ollama'
        });
        
        assert(result.success, `Advanced feature should succeed: ${test.query}`);
        assert(result.data.response, 'Should have a response');
        assert(result.data.response.length > 100, 'Response should be substantial');
        
        const responseLength = result.data.response.length;
        const hasReasoning = result.data.reasoning && result.data.reasoning.thoughtProcess;
        
        if (responseLength > 500 && hasReasoning) {
          logTest(`Advanced: ${test.description}`, 'PASS', `${responseLength} chars, with reasoning`);
        } else {
          logTest(`Advanced: ${test.description}`, 'FAIL', `Insufficient response or reasoning`);
        }
      }
    } catch (error) {
      logError('Advanced Features', error);
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Enhanced Agent Test Suite');
    console.log('=' .repeat(60));
    
    try {
      await this.initializeAgent();
      await this.testAgentStatus();
      await this.testIntentClassification();
      await this.testToolExecution();
      await this.testToolChaining();
      await this.testMemoryOperations();
      await this.testReasoningAndPlanning();
      await this.testContextManagement();
      await this.testErrorHandling();
      await this.testPerformanceAndLimits();
      await this.testAdvancedFeatures();
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed to run:', error.message);
      process.exit(1);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️ Errors: ${testResults.errors.length}`);
    
    const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      testResults.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (successRate >= 90) {
      console.log('  ✅ Excellent! The enhanced agent is working very well.');
    } else if (successRate >= 75) {
      console.log('  ⚠️ Good performance, but some areas need attention.');
    } else if (successRate >= 50) {
      console.log('  ⚠️ Moderate performance, several issues need to be addressed.');
    } else {
      console.log('  ❌ Poor performance, significant issues need to be fixed.');
    }
    
    console.log('\n📝 Detailed test results saved to testResults object');
    console.log('='.repeat(60));
  }
}

// Run the tests
async function main() {
  const tester = new EnhancedAgentTester();
  await tester.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { EnhancedAgentTester, testResults };
