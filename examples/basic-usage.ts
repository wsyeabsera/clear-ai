/**
 * Basic usage example for @clear-ai/core
 * 
 * This example shows how to:
 * 1. Initialize the ClearAI framework
 * 2. Use MCP tools
 * 3. Execute workflows
 * 4. Use the server API
 */

import { ClearAI } from '@clear-ai/core';
import { MCPServer, ToolRegistry } from '@clear-ai/mcp';
import { SimpleLangChainService, ToolExecutionService, SimpleWorkflowService } from '@clear-ai/shared';
import { createServer } from '@clear-ai/server';

async function basicExample() {
  console.log('🚀 Clear AI Basic Usage Example\n');

  // 1. Initialize the framework
  const ai = new ClearAI({
    llm: {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      ollamaBaseUrl: 'http://localhost:11434'
    },
    server: {
      port: 3001
    }
  });

  // 2. Initialize all services
  await ai.init();
  console.log('✅ Framework initialized\n');

  // 3. Use MCP tools directly
  const mcp = ai.getMCP();
  if (mcp) {
    const tools = mcp.getToolRegistry();
    
    // Execute an API call
    console.log('📡 Executing API call...');
    try {
      const apiResult = await tools.executeTool('api_call', {
        url: 'https://jsonplaceholder.typicode.com/users/1',
        method: 'GET'
      });
      console.log('API Result:', apiResult);
    } catch (error) {
      console.error('API call failed:', error);
    }
  }

  // 4. Use LLM service
  const llm = ai.getLLM();
  if (llm) {
    console.log('\n🤖 Using LLM service...');
    try {
      const response = await llm.complete('What is the capital of France?', {
        model: 'ollama',
        temperature: 0.7
      });
      console.log('LLM Response:', response.content);
    } catch (error) {
      console.error('LLM call failed:', error);
    }
  }

  // 5. Use workflow service
  const workflow = ai.getWorkflows();
  if (workflow) {
    console.log('\n🔄 Executing workflow...');
    try {
      const workflowResult = await workflow.executeWorkflow(
        'Make an API call to get user data and process it',
        { model: 'ollama' }
      );
      console.log('Workflow Result:', workflowResult);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }
  }

  console.log('\n✅ Example completed!');
}

async function advancedExample() {
  console.log('\n🔧 Advanced Usage Example\n');

  // 1. Create custom MCP server
  const mcpServer = new MCPServer();
  const toolRegistry = mcpServer.getToolRegistry();

  // Register a custom tool
  const customTool = {
    name: 'calculator',
    description: 'Basic calculator for arithmetic operations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['operation', 'a', 'b']
    },
    execute: async (args: any) => {
      const { operation, a, b } = args;
      switch (operation) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return b !== 0 ? a / b : 'Error: Division by zero';
        default: throw new Error(`Unknown operation: ${operation}`);
      }
    }
  };

  toolRegistry.registerTool(customTool);

  // Execute custom tool
  console.log('🧮 Executing custom calculator tool...');
  try {
    const calcResult = await toolRegistry.executeTool('calculator', {
      operation: 'add',
      a: 5,
      b: 3
    });
    console.log('Calculator Result:', calcResult);
  } catch (error) {
    console.error('Calculator failed:', error);
  }

  // 2. Create server with custom configuration
  const server = createServer({
    port: 3002,
    mcpConfig: { tools: ['api_call', 'json_reader', 'calculator'] },
    llmConfig: {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      ollamaBaseUrl: 'http://localhost:11434'
    }
  });

  console.log('🌐 Server created (not started in this example)');
  console.log('✅ Advanced example completed!');
}

// Run examples
async function main() {
  try {
    await basicExample();
    await advancedExample();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

main();
