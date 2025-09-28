/**
 * Basic usage example for @clear-ai/mcp-basic
 * 
 * This example shows how to:
 * 1. Create an MCP server
 * 2. Register custom tools
 * 3. Execute tools
 * 4. Handle responses
 */

import { MCPServer, ToolRegistry } from '@clear-ai/mcp-basic';
import { z } from 'zod';

async function main() {
  // Create MCP server
  const server = new MCPServer();
  const toolRegistry = server.getToolRegistry();

  // Register a custom calculator tool
  const calculatorTool = {
    name: 'calculator',
    description: 'Basic calculator for arithmetic operations',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number(),
      b: z.number()
    }),
    execute: async (args: { operation: string; a: number; b: number }) => {
      const { operation, a, b } = args;
      
      switch (operation) {
        case 'add':
          return { result: a + b, operation: `${a} + ${b} = ${a + b}` };
        case 'subtract':
          return { result: a - b, operation: `${a} - ${b} = ${a - b}` };
        case 'multiply':
          return { result: a * b, operation: `${a} * ${b} = ${a * b}` };
        case 'divide':
          if (b === 0) throw new Error('Division by zero');
          return { result: a / b, operation: `${a} / ${b} = ${a / b}` };
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
  };

  // Register the custom tool
  toolRegistry.registerTool(calculatorTool);

  // Execute the calculator tool
  try {
    const result = await toolRegistry.executeTool('calculator', {
      operation: 'add',
      a: 5,
      b: 3
    });
    
    console.log('Calculator result:', result);
  } catch (error) {
    console.error('Tool execution failed:', error);
  }

  // Execute built-in API call tool
  try {
    const apiResult = await toolRegistry.executeTool('api_call', {
      url: 'https://jsonplaceholder.typicode.com/users/1',
      method: 'GET'
    });
    
    console.log('API call result:', apiResult);
  } catch (error) {
    console.error('API call failed:', error);
  }

  // Execute JSON reader tool
  try {
    const jsonResult = await toolRegistry.executeTool('json_reader', {
      jsonString: JSON.stringify({ users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] }),
      path: '$.users[0].name',
      pretty: true
    });
    
    console.log('JSON reader result:', jsonResult);
  } catch (error) {
    console.error('JSON reader failed:', error);
  }

  // List all available tools
  const availableTools = toolRegistry.getAllTools();
  console.log('Available tools:', availableTools.map(t => t.name));
}

// Run the example
main().catch(console.error);
