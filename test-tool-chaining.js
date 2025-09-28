#!/usr/bin/env node

/**
 * Test script for the Tool Chaining Service
 * This demonstrates how to use the tool chaining functionality
 */

const { ToolChainingService, ToolExecutionService } = require('./packages/shared/dist');

async function testToolChaining() {
  console.log('🚀 Testing Tool Chaining Service...\n');

  // Sample configuration (you would get this from environment variables)
  const config = {
    langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
    langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    mistralApiKey: process.env.MISTRAL_API_KEY || '',
    mistralModel: process.env.MISTRAL_MODEL || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || '',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || '',
    ollamaModel: process.env.OLLAMA_MODEL || 'mistral:latest',
  };

  // Create services
  const toolChainingService = new ToolChainingService(config);
  const toolService = toolChainingService.getToolService();

  // Register some sample tools for testing
  toolService.registerTool({
    name: 'get_weather',
    description: 'Get weather information for a city',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'Name of the city'
        },
        unit: {
          type: 'string',
          description: 'Temperature unit (celsius or fahrenheit)',
          enum: ['celsius', 'fahrenheit']
        }
      },
      required: ['city']
    },
    execute: async (args) => {
      console.log(`🌤️  Getting weather for ${args.city}...`);
      return {
        temperature: Math.floor(Math.random() * 30) + 10,
        unit: args.unit || 'celsius',
        condition: 'sunny',
        city: args.city
      };
    }
  });

  toolService.registerTool({
    name: 'calculate_average',
    description: 'Calculate the average of a list of numbers',
    parameters: {
      type: 'object',
      properties: {
        numbers: {
          type: 'array',
          items: { type: 'number' },
          description: 'List of numbers to average'
        }
      },
      required: ['numbers']
    },
    execute: async (args) => {
      console.log(`🧮 Calculating average of ${args.numbers.length} numbers...`);
      const sum = args.numbers.reduce((a, b) => a + b, 0);
      return {
        average: sum / args.numbers.length,
        count: args.numbers.length,
        sum: sum
      };
    }
  });

  toolService.registerTool({
    name: 'format_message',
    description: 'Format a message with context data',
    parameters: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description: 'Message template with {{placeholders}}'
        },
        context: {
          type: 'object',
          description: 'Context data for template substitution'
        }
      },
      required: ['template', 'context']
    },
    execute: async (args) => {
      console.log(`📝 Formatting message...`);
      let message = args.template;
      for (const [key, value] of Object.entries(args.context)) {
        const placeholder = `{{${key}}}`;
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      }
      return {
        formattedMessage: message,
        originalTemplate: args.template
      };
    }
  });

  // Test 1: Simple single tool execution
  console.log('=== Test 1: Simple Single Tool ===');
  try {
    const result = await toolChainingService.executeQueryChain(
      'Get the weather for New York',
      {},
      { model: 'mistral-ollama', temperature: 0.1 }
    );
    console.log('✅ Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Multi-step chaining
  console.log('=== Test 2: Multi-Step Chaining ===');
  try {
    const result = await toolChainingService.executeQueryChain(
      'Get weather for New York and calculate the average temperature if I had measurements of 20, 25, 30 degrees',
      {},
      { model: 'mistral-ollama', temperature: 0.1 }
    );
    console.log('✅ Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Chain analysis only (without execution)
  console.log('=== Test 3: Chain Analysis Only ===');
  try {
    const availableTools = toolService.getRegisteredTools();
    const analysis = await toolChainingService.analyzeQueryToChain(
      'Get weather data and then format a summary message with the temperature and city name',
      availableTools,
      { model: 'mistral-ollama', temperature: 0.1 }
    );
    console.log('✅ Analysis:', JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Available tools
  console.log('=== Test 4: Available Tools ===');
  const tools = toolService.getRegisteredTools();
  console.log('📋 Available tools:');
  tools.forEach((tool, index) => {
    console.log(`  ${index + 1}. ${tool.name} - ${tool.description}`);
  });

  console.log('\n🎉 Tool Chaining tests completed!');
}

// Run the tests
if (require.main === module) {
  testToolChaining().catch(console.error);
}

module.exports = { testToolChaining };
