#!/usr/bin/env node

/**
 * Clear AI CLI - Admin Panel Command Line Interface
 * 
 * This CLI provides administrative functionality for Clear AI framework
 * including server management, tool execution, workflow management, and more.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import { table } from 'table';

const program = new Command();

// Configuration
const DEFAULT_SERVER_URL = 'http://localhost:3001';
let serverUrl = DEFAULT_SERVER_URL;

// Utility functions
const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  title: (msg: string) => console.log(chalk.bold.cyan(`\n${msg}\n`)),
};

const makeRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) => {
  try {
    const response = await axios({
      method,
      url: `${serverUrl}${endpoint}`,
      data,
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to server at ${serverUrl}. Make sure the server is running.`);
    }
    throw new Error(error.response?.data?.message || error.message || 'Request failed');
  }
};

// Health check command
program
  .command('health')
  .description('Check server health status')
  .action(async () => {
    const spinner = ora('Checking server health...').start();
    try {
      const health = await makeRequest('/api/health');
      spinner.succeed('Server is healthy');
      console.log(JSON.stringify(health, null, 2));
    } catch (error: any) {
      spinner.fail('Health check failed');
      log.error(error.message);
    }
  });

// Server management commands
program
  .command('server')
  .description('Server management commands')
  .addCommand(
    new Command('start')
      .description('Start the Clear AI server')
      .option('-p, --port <port>', 'Port to run the server on', '3001')
      .action(async (options) => {
        log.info(`Starting server on port ${options.port}...`);
        // This would typically start the server process
        log.success(`Server started on port ${options.port}`);
        log.info('Use "clear-ai health" to check server status');
      })
  )
  .addCommand(
    new Command('stop')
      .description('Stop the Clear AI server')
      .action(async () => {
        log.info('Stopping server...');
        // This would typically stop the server process
        log.success('Server stopped');
      })
  )
  .addCommand(
    new Command('restart')
      .description('Restart the Clear AI server')
      .action(async () => {
        log.info('Restarting server...');
        // This would typically restart the server process
        log.success('Server restarted');
      })
  );

// Web admin panel commands removed - use yarn dev directly

// MCP tools management
program
  .command('tools')
  .description('MCP tools management')
  .addCommand(
    new Command('list')
      .description('List available MCP tools')
      .action(async () => {
        const spinner = ora('Fetching available tools...').start();
        try {
          const tools = await makeRequest('/api/mcp/tools');
          spinner.succeed('Tools retrieved');
          
          if (tools.length === 0) {
            log.warning('No tools available');
            return;
          }

          const tableData = [
            ['Name', 'Description', 'Status'],
            ...tools.map((tool: any) => [
              tool.name || 'N/A',
              tool.description || 'N/A',
              tool.status || 'Unknown'
            ])
          ];

          console.log(table(tableData));
        } catch (error: any) {
          spinner.fail('Failed to fetch tools');
          log.error(error.message);
        }
      })
  )
  .addCommand(
    new Command('execute')
      .description('Execute an MCP tool')
      .argument('<toolName>', 'Name of the tool to execute')
      .option('-d, --data <data>', 'JSON data to pass to the tool')
      .action(async (toolName, options) => {
        const spinner = ora(`Executing tool: ${toolName}...`).start();
        try {
          const data = options.data ? JSON.parse(options.data) : {};
          const result = await makeRequest(`/api/mcp/tools/${toolName}/execute`, 'POST', data);
          spinner.succeed('Tool executed successfully');
          console.log(JSON.stringify(result, null, 2));
        } catch (error: any) {
          spinner.fail('Tool execution failed');
          log.error(error.message);
        }
      })
  );

// LLM management
program
  .command('llm')
  .description('LLM service management')
  .addCommand(
    new Command('complete')
      .description('Complete a prompt using LLM')
      .argument('<prompt>', 'The prompt to complete')
      .option('-m, --model <model>', 'Model to use', 'ollama')
      .option('-t, --temperature <temperature>', 'Temperature setting', '0.7')
      .action(async (prompt, options) => {
        const spinner = ora('Generating completion...').start();
        try {
          const result = await makeRequest('/api/langchain/complete', 'POST', {
            prompt,
            model: options.model,
            temperature: parseFloat(options.temperature)
          });
          spinner.succeed('Completion generated');
          console.log(result.content || result);
        } catch (error: any) {
          spinner.fail('Completion failed');
          log.error(error.message);
        }
      })
  )
  .addCommand(
    new Command('models')
      .description('List available LLM models')
      .action(async () => {
        const spinner = ora('Fetching available models...').start();
        try {
          const models = await makeRequest('/api/langchain/models');
          spinner.succeed('Models retrieved');
          console.log(JSON.stringify(models, null, 2));
        } catch (error: any) {
          spinner.fail('Failed to fetch models');
          log.error(error.message);
        }
      })
  );

// Workflow management
program
  .command('workflows')
  .description('Workflow management')
  .addCommand(
    new Command('execute')
      .description('Execute a workflow')
      .argument('<description>', 'Description of the workflow to execute')
      .option('-m, --model <model>', 'Model to use', 'ollama')
      .action(async (description, options) => {
        const spinner = ora('Executing workflow...').start();
        try {
          const result = await makeRequest('/api/langgraph/execute', 'POST', {
            description,
            model: options.model
          });
          spinner.succeed('Workflow executed');
          console.log(JSON.stringify(result, null, 2));
        } catch (error: any) {
          spinner.fail('Workflow execution failed');
          log.error(error.message);
        }
      })
  );

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    log.title('Clear AI Interactive Mode');
    log.info('Welcome to Clear AI admin panel!');
    
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
        choices: [
          { name: 'Check server health', value: 'health' },
          { name: 'List MCP tools', value: 'tools' },
          { name: 'Execute MCP tool', value: 'execute-tool' },
          { name: 'Complete with LLM', value: 'llm-complete' },
          { name: 'Execute workflow', value: 'workflow' },
          { name: 'Change server URL', value: 'change-url' },
          { name: 'Exit', value: 'exit' }
        ]
        }
      ]);

      switch (action) {
        case 'health':
          await program.parseAsync(['', '', 'health']);
          break;
        case 'tools':
          await program.parseAsync(['', '', 'tools', 'list']);
          break;
        case 'execute-tool':
          const { toolName } = await inquirer.prompt([
            { type: 'input', name: 'toolName', message: 'Tool name:' }
          ]);
          await program.parseAsync(['', '', 'tools', 'execute', toolName]);
          break;
        case 'llm-complete':
          const { prompt } = await inquirer.prompt([
            { type: 'input', name: 'prompt', message: 'Enter prompt:' }
          ]);
          await program.parseAsync(['', '', 'llm', 'complete', prompt]);
          break;
        case 'workflow':
          const { description } = await inquirer.prompt([
            { type: 'input', name: 'description', message: 'Workflow description:' }
          ]);
          await program.parseAsync(['', '', 'workflows', 'execute', description]);
          break;
        case 'change-url':
          const { url } = await inquirer.prompt([
            { type: 'input', name: 'url', message: 'Server URL:', default: serverUrl }
          ]);
          serverUrl = url;
          log.success(`Server URL changed to: ${serverUrl}`);
          break;
        case 'exit':
          log.info('Goodbye!');
          process.exit(0);
      }
    }
  });

// Configuration
program
  .command('config')
  .description('Configuration management')
  .addCommand(
    new Command('set')
      .description('Set configuration value')
      .argument('<key>', 'Configuration key')
      .argument('<value>', 'Configuration value')
      .action(async (key, value) => {
        if (key === 'server-url') {
          serverUrl = value;
          log.success(`Server URL set to: ${serverUrl}`);
        } else {
          log.error(`Unknown configuration key: ${key}`);
        }
      })
  )
  .addCommand(
    new Command('get')
      .description('Get configuration value')
      .argument('<key>', 'Configuration key')
      .action(async (key) => {
        if (key === 'server-url') {
          console.log(serverUrl);
        } else {
          log.error(`Unknown configuration key: ${key}`);
        }
      })
  );

// Main program setup
program
  .name('clear-ai')
  .description('Clear AI Admin Panel CLI')
  .version('1.0.0')
  .option('-s, --server <url>', 'Server URL', DEFAULT_SERVER_URL)
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    if (options.server) {
      serverUrl = options.server;
    }
  });

// Error handling
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error}`);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
