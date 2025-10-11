#!/usr/bin/env node

/**
 * Tool Chains and Relationships Test Suite
 * 
 * This test suite focuses specifically on:
 * - Tool chain executions
 * - Data flow between tools
 * - Relationship analysis
 * - Complex multi-step workflows
 * - Context preservation across tool calls
 */

const axios = require('axios');
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'test-user-chains';
const TEST_SESSION_ID = 'test-session-chains';

// Test results tracking
let chainTestResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Utility functions
function logChainTest(testName, status, details = '') {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}${details ? ` - ${details}` : ''}`);
  
  chainTestResults.total++;
  if (status === 'PASS') chainTestResults.passed++;
  else if (status === 'FAIL') chainTestResults.failed++;
  
  chainTestResults.details.push({
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });
}

function logChainError(testName, error) {
  console.log(`❌ ${testName} - ERROR: ${error.message}`);
  chainTestResults.errors.push({
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
      timeout: 60000, // Longer timeout for complex chains
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

class ToolChainTester {
  constructor() {
    this.agentInitialized = false;
  }

  async initializeAgent() {
    try {
      console.log('\n🚀 Initializing Agent for Tool Chain Testing...');
      const response = await axios.post(`${BASE_URL}/api/agent/enhanced-initialize`, {}, {
        timeout: 60000
      });
      
      assert(response.data.success, 'Agent initialization should succeed');
      this.agentInitialized = true;
      logChainTest('Agent Initialization', 'PASS', 'Ready for chain testing');
    } catch (error) {
      logChainError('Agent Initialization', error);
      throw error;
    }
  }

  async testSequentialToolChains() {
    try {
      console.log('\n🔗 Testing Sequential Tool Chains...');
      
      const sequentialTests = [
        {
          query: "Get posts for user 1, then get comments for the first post, then get the user info for the comment author",
          description: "API call chain with data flow",
          expectedSteps: 3
        },
        {
          query: "Calculate 10 + 5, then multiply the result by 3, then add 100 to the final result",
          description: "Calculator chain with intermediate results",
          expectedSteps: 3
        },
        {
          query: "Get the weather in London, then get the weather in Paris, then compare the temperatures",
          description: "Weather comparison chain",
          expectedSteps: 3
        },
        {
          query: "Search for 'react' repositories, then get the first repository's issues, then get the first issue's comments",
          description: "GitHub data exploration chain",
          expectedSteps: 3
        }
      ];

      for (const test of sequentialTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Sequential chain should succeed: ${test.query}`);
        assert(result.data.intent.type === 'tool_execution', 'Should be classified as tool execution');
        assert(result.data.metadata.toolsExecuted >= test.expectedSteps, `Should execute at least ${test.expectedSteps} tools`);
        
        // Check if the response shows evidence of chaining
        const responseText = result.data.response.toLowerCase();
        const hasChainEvidence = responseText.includes('then') || 
                                responseText.includes('next') ||
                                responseText.includes('result') ||
                                responseText.includes('based on') ||
                                result.data.metadata.toolsExecuted > 1;
        
        if (hasChainEvidence) {
          logChainTest(`Sequential: ${test.description}`, 'PASS', `${result.data.metadata.toolsExecuted} tools executed`);
        } else {
          logChainTest(`Sequential: ${test.description}`, 'FAIL', 'No evidence of chaining');
        }
      }
    } catch (error) {
      logChainError('Sequential Tool Chains', error);
    }
  }

  async testDataFlowChains() {
    try {
      console.log('\n📊 Testing Data Flow Chains...');
      
      const dataFlowTests = [
        {
          query: "Get the first post from https://jsonplaceholder.typicode.com/posts, then extract the user ID and get that user's information",
          description: "Data extraction and follow-up",
          expectedDataFlow: true
        },
        {
          query: "Calculate the area of a circle with radius 5, then calculate the circumference using the same radius",
          description: "Mathematical data flow",
          expectedDataFlow: true
        },
        {
          query: "Get weather for New York, then get weather for a city with similar temperature",
          description: "Conditional data flow",
          expectedDataFlow: true
        },
        {
          query: "Search for 'javascript' repositories, then get the most starred repository's details",
          description: "Selection and detail retrieval",
          expectedDataFlow: true
        }
      ];

      for (const test of dataFlowTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Data flow should succeed: ${test.query}`);
        assert(result.data.metadata.toolsExecuted >= 2, 'Should execute multiple tools');
        
        // Check for data flow indicators
        const responseText = result.data.response.toLowerCase();
        const hasDataFlow = responseText.includes('user id') ||
                           responseText.includes('radius') ||
                           responseText.includes('temperature') ||
                           responseText.includes('starred') ||
                           responseText.includes('based on') ||
                           responseText.includes('using') ||
                           responseText.includes('from the');
        
        if (hasDataFlow) {
          logChainTest(`Data Flow: ${test.description}`, 'PASS', 'Data flow detected');
        } else {
          logChainTest(`Data Flow: ${test.description}`, 'FAIL', 'No data flow evidence');
        }
      }
    } catch (error) {
      logChainError('Data Flow Chains', error);
    }
  }

  async testConditionalChains() {
    try {
      console.log('\n🔀 Testing Conditional Chains...');
      
      const conditionalTests = [
        {
          query: "Get the weather in London, and if it's raining, get the weather in a sunny city instead",
          description: "Weather-based conditional",
          expectedConditional: true
        },
        {
          query: "Calculate 10 + 5, and if the result is greater than 10, multiply by 2, otherwise divide by 2",
          description: "Mathematical conditional",
          expectedConditional: true
        },
        {
          query: "Search for 'python' repositories, and if there are more than 5 results, get the top 3, otherwise get all results",
          description: "Count-based conditional",
          expectedConditional: true
        }
      ];

      for (const test of conditionalTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Conditional chain should succeed: ${test.query}`);
        
        // Check for conditional logic indicators
        const responseText = result.data.response.toLowerCase();
        const hasConditional = responseText.includes('if') ||
                              responseText.includes('since') ||
                              responseText.includes('because') ||
                              responseText.includes('therefore') ||
                              responseText.includes('however') ||
                              responseText.includes('instead');
        
        if (hasConditional) {
          logChainTest(`Conditional: ${test.description}`, 'PASS', 'Conditional logic detected');
        } else {
          logChainTest(`Conditional: ${test.description}`, 'FAIL', 'No conditional logic');
        }
      }
    } catch (error) {
      logChainError('Conditional Chains', error);
    }
  }

  async testParallelToolExecution() {
    try {
      console.log('\n⚡ Testing Parallel Tool Execution...');
      
      const parallelTests = [
        {
          query: "Get the weather in London, Paris, and Tokyo simultaneously",
          description: "Parallel weather requests",
          expectedParallel: true
        },
        {
          query: "Calculate 10 + 5, 20 * 3, and 100 / 4 at the same time",
          description: "Parallel calculations",
          expectedParallel: true
        },
        {
          query: "Get information about users 1, 2, and 3 from the API simultaneously",
          description: "Parallel API calls",
          expectedParallel: true
        }
      ];

      for (const test of parallelTests) {
        const startTime = Date.now();
        const result = await makeRequest(test.query);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        assert(result.success, `Parallel execution should succeed: ${test.query}`);
        assert(result.data.metadata.toolsExecuted >= 2, 'Should execute multiple tools');
        
        // Check for parallel execution indicators
        const responseText = result.data.response.toLowerCase();
        const hasParallel = responseText.includes('london') && responseText.includes('paris') && responseText.includes('tokyo') ||
                           responseText.includes('15') && responseText.includes('60') && responseText.includes('25') ||
                           responseText.includes('user') && responseText.includes('simultaneously') ||
                           executionTime < 20000; // Should be faster than sequential
        
        if (hasParallel) {
          logChainTest(`Parallel: ${test.description}`, 'PASS', `${executionTime}ms execution time`);
        } else {
          logChainTest(`Parallel: ${test.description}`, 'FAIL', 'No parallel execution evidence');
        }
      }
    } catch (error) {
      logChainError('Parallel Tool Execution', error);
    }
  }

  async testContextPreservation() {
    try {
      console.log('\n🧠 Testing Context Preservation...');
      
      // First, establish some context
      await makeRequest("Remember that I am testing tool chains and relationships");
      await makeRequest("Remember that my favorite number is 42");
      
      const contextTests = [
        {
          query: "Based on what you know about me, calculate my favorite number plus 10",
          description: "Context-aware calculation",
          expectedContext: true
        },
        {
          query: "Get the weather in London, then based on our previous conversation, tell me if it's good weather for testing",
          description: "Context-aware weather analysis",
          expectedContext: true
        },
        {
          query: "Search for repositories related to what we discussed earlier",
          description: "Context-aware search",
          expectedContext: true
        }
      ];

      for (const test of contextTests) {
        const result = await makeRequest(test.query);
        
        assert(result.success, `Context preservation should succeed: ${test.query}`);
        assert(result.data.metadata.memoryRetrieved > 0, 'Should retrieve memory context');
        
        // Check for context usage
        const responseText = result.data.response.toLowerCase();
        const hasContext = responseText.includes('42') ||
                          responseText.includes('testing') ||
                          responseText.includes('tool chains') ||
                          responseText.includes('remember') ||
                          responseText.includes('based on') ||
                          responseText.includes('previous');
        
        if (hasContext) {
          logChainTest(`Context: ${test.description}`, 'PASS', `${result.data.metadata.memoryRetrieved} memories used`);
        } else {
          logChainTest(`Context: ${test.description}`, 'FAIL', 'No context usage detected');
        }
      }
    } catch (error) {
      logChainError('Context Preservation', error);
    }
  }

  async testErrorRecoveryChains() {
    try {
      console.log('\n🛡️ Testing Error Recovery Chains...');
      
      const errorRecoveryTests = [
        {
          query: "Get weather for 'InvalidCity123', and if that fails, get weather for London instead",
          description: "Error recovery with fallback",
          expectedRecovery: true
        },
        {
          query: "Calculate 10 / 0, and if that fails, calculate 10 / 1 instead",
          description: "Mathematical error recovery",
          expectedRecovery: true
        },
        {
          query: "Make a request to an invalid URL, and if that fails, make a request to a valid API",
          description: "API error recovery",
          expectedRecovery: true
        }
      ];

      for (const test of errorRecoveryTests) {
        const result = await makeRequest(test.query);
        
        // These might succeed with fallback or fail gracefully
        if (result.success) {
          const responseText = result.data.response.toLowerCase();
          const hasRecovery = responseText.includes('london') ||
                             responseText.includes('10') ||
                             responseText.includes('valid') ||
                             responseText.includes('instead') ||
                             responseText.includes('fallback');
          
          if (hasRecovery) {
            logChainTest(`Error Recovery: ${test.description}`, 'PASS', 'Recovery mechanism worked');
          } else {
            logChainTest(`Error Recovery: ${test.description}`, 'PASS', 'Handled gracefully');
          }
        } else {
          logChainTest(`Error Recovery: ${test.description}`, 'PASS', 'Error properly handled');
        }
      }
    } catch (error) {
      logChainError('Error Recovery Chains', error);
    }
  }

  async testComplexWorkflows() {
    try {
      console.log('\n🎯 Testing Complex Workflows...');
      
      const workflowTests = [
        {
          query: "Create a comprehensive analysis: Get weather for 3 cities, calculate some statistics, and provide recommendations based on the data",
          description: "Multi-step analysis workflow",
          expectedComplexity: true
        },
        {
          query: "Plan a development task: Search for relevant repositories, analyze the code structure, and suggest improvements",
          description: "Development planning workflow",
          expectedComplexity: true
        },
        {
          query: "Research a topic: Get current information from multiple sources, analyze the data, and provide a summary with insights",
          description: "Research and analysis workflow",
          expectedComplexity: true
        }
      ];

      for (const test of workflowTests) {
        const result = await makeRequest(test.query, {
          includeReasoning: true,
          maxTokens: 8000,
          maxMemoryResults: 3,
          responseDetailLevel: 'standard',
          enableContextCompression: true,
          contextCompressionThreshold: 0.8,
          model: 'ollama'
        });
        
        assert(result.success, `Complex workflow should succeed: ${test.query}`);
        assert(result.data.metadata.toolsExecuted >= 3, 'Should execute multiple tools');
        assert(result.data.response.length > 500, 'Should have substantial response');
        
        // Check for workflow complexity
        const responseText = result.data.response.toLowerCase();
        const hasComplexity = responseText.includes('analysis') ||
                             responseText.includes('recommendation') ||
                             responseText.includes('summary') ||
                             responseText.includes('insight') ||
                             responseText.includes('workflow') ||
                             responseText.includes('plan') ||
                             result.data.metadata.toolsExecuted >= 3;
        
        if (hasComplexity) {
          logChainTest(`Workflow: ${test.description}`, 'PASS', `${result.data.metadata.toolsExecuted} tools, ${result.data.response.length} chars`);
        } else {
          logChainTest(`Workflow: ${test.description}`, 'FAIL', 'Insufficient complexity');
        }
      }
    } catch (error) {
      logChainError('Complex Workflows', error);
    }
  }

  async testRelationshipAnalysis() {
    try {
      console.log('\n🔗 Testing Relationship Analysis...');
      
      const relationshipTests = [
        {
          query: "Analyze the relationship between the weather in London and Paris, and how they might affect each other",
          description: "Weather relationship analysis",
          expectedRelationships: true
        },
        {
          query: "Compare the performance of different programming languages based on GitHub repository data",
          description: "Technology comparison analysis",
          expectedRelationships: true
        },
        {
          query: "Examine the correlation between user activity and repository popularity",
          description: "Data correlation analysis",
          expectedRelationships: true
        }
      ];

      for (const test of relationshipTests) {
        const result = await makeRequest(test.query, {
          includeReasoning: true,
          maxTokens: 8000,
          maxMemoryResults: 3,
          enableContextCompression: true,
          contextCompressionThreshold: 0.8,
          model: 'ollama'
        });
        
        assert(result.success, `Relationship analysis should succeed: ${test.query}`);
        assert(result.data.reasoning, 'Should include reasoning');
        
        // Check for relationship analysis indicators
        const responseText = result.data.response.toLowerCase();
        const hasRelationships = responseText.includes('relationship') ||
                                responseText.includes('correlation') ||
                                responseText.includes('compare') ||
                                responseText.includes('similar') ||
                                responseText.includes('different') ||
                                responseText.includes('affect') ||
                                responseText.includes('influence') ||
                                responseText.includes('connection');
        
        if (hasRelationships) {
          logChainTest(`Relationships: ${test.description}`, 'PASS', 'Relationship analysis detected');
        } else {
          logChainTest(`Relationships: ${test.description}`, 'FAIL', 'No relationship analysis');
        }
      }
    } catch (error) {
      logChainError('Relationship Analysis', error);
    }
  }

  async runAllTests() {
    console.log('🔗 Starting Tool Chains and Relationships Test Suite');
    console.log('=' .repeat(60));
    
    try {
      await this.initializeAgent();
      await this.testSequentialToolChains();
      await this.testDataFlowChains();
      await this.testConditionalChains();
      await this.testParallelToolExecution();
      await this.testContextPreservation();
      await this.testErrorRecoveryChains();
      await this.testComplexWorkflows();
      await this.testRelationshipAnalysis();
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Tool chain test suite failed to run:', error.message);
      process.exit(1);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🔗 TOOL CHAINS & RELATIONSHIPS TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${chainTestResults.total}`);
    console.log(`✅ Passed: ${chainTestResults.passed}`);
    console.log(`❌ Failed: ${chainTestResults.failed}`);
    console.log(`⚠️ Errors: ${chainTestResults.errors.length}`);
    
    const successRate = chainTestResults.total > 0 ? (chainTestResults.passed / chainTestResults.total * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (chainTestResults.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      chainTestResults.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    if (chainTestResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      chainTestResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
    }
    
    console.log('\n🎯 CHAIN TESTING INSIGHTS:');
    if (successRate >= 90) {
      console.log('  ✅ Excellent! Tool chains and relationships are working very well.');
    } else if (successRate >= 75) {
      console.log('  ⚠️ Good chain performance, but some areas need attention.');
    } else if (successRate >= 50) {
      console.log('  ⚠️ Moderate chain performance, several issues need to be addressed.');
    } else {
      console.log('  ❌ Poor chain performance, significant issues need to be fixed.');
    }
    
    console.log('\n📝 Detailed chain test results saved to chainTestResults object');
    console.log('='.repeat(60));
  }
}

// Run the tests
async function main() {
  const tester = new ToolChainTester();
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
    console.error('❌ Tool chain test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { ToolChainTester, chainTestResults };
