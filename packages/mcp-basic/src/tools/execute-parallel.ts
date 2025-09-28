import { z } from 'zod';
import { ZodTool } from '../types';
import axios from 'axios';

// Define interfaces locally
interface ToolExecutionRequest {
  toolName: string;
  arguments?: Record<string, any>;
}

interface ToolExecutionResponse {
  success: boolean;
  data?: any;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

interface MCPClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class MCPClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(config: MCPClientConfig = {}) {
    this.baseURL = config.baseURL || 'http://localhost:3001/api/mcp';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  async executeToolsParallel(
    toolExecutions: ToolExecutionRequest[]
  ): Promise<ToolExecutionResponse[]> {
    const promises = toolExecutions.map(async (execution, index) => {
      try {
        return await this.executeTool(execution.toolName, execution.arguments);
      } catch (error: any) {
        return {
          success: false,
          message: `Tool ${execution.toolName} failed: ${error.message}`,
        };
      }
    });

    return Promise.all(promises);
  }

  private async executeTool(
    toolName: string,
    args: Record<string, any> = {}
  ): Promise<ToolExecutionResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await axios.post(
          `${this.baseURL}/execute`,
          {
            toolName,
            arguments: args,
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data as ToolExecutionResponse;
      } catch (error: any) {
        if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
          const axiosError = error;
          if (axiosError.response) {
            // Server responded with error status
            return {
              success: false,
              message: axiosError.response.data?.message || 'Server error',
            };
          } else if (axiosError.request) {
            // Network error
            throw new Error(`Network error: Unable to reach MCP server at ${this.baseURL}`);
          }
        }
        throw new Error(`Unexpected error: ${error.message}`);
      }
    });
  }

  private async   retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (attempt < this.retries) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const ExecuteParallelInputSchema = z.object({
  tools: z.array(z.object({
    toolName: z.string().describe('Name of the tool to execute'),
    arguments: z.record(z.any()).optional().describe('Arguments to pass to the tool'),
  })).min(1).max(10).describe('Array of tools to execute in parallel'),
  serverUrl: z.string().url().optional().describe('MCP server URL (defaults to localhost)'),
  timeout: z.number().min(1000).max(60000).default(30000).describe('Timeout for each tool execution in milliseconds'),
  maxRetries: z.number().min(0).max(5).default(3).describe('Maximum number of retries for failed requests'),
});

const ExecuteParallelOutputSchema = z.object({
  results: z.array(z.object({
    toolName: z.string(),
    success: z.boolean(),
    data: z.any().optional(),
    message: z.string(),
    executionTime: z.number().describe('Execution time in milliseconds'),
  })).describe('Results for each tool execution'),
  totalExecutionTime: z.number().describe('Total execution time for all tools in milliseconds'),
  successfulExecutions: z.number().describe('Number of tools that executed successfully'),
  failedExecutions: z.number().describe('Number of tools that failed'),
});

export const executeParallelTool: ZodTool = {
  name: 'execute_parallel',
  description: 'Execute multiple MCP tools in parallel with error handling and retry logic',
  inputSchema: ExecuteParallelInputSchema,
  outputSchema: ExecuteParallelOutputSchema,
  execute: async (args) => {
    const { tools, serverUrl, timeout, maxRetries } = ExecuteParallelInputSchema.parse(args);

    const startTime = Date.now();
    const client = new MCPClient({
      baseURL: serverUrl,
      timeout,
      retries: maxRetries,
    });

    try {
      // Create tool execution requests
      const toolExecutions: ToolExecutionRequest[] = tools.map(tool => ({
        toolName: tool.toolName,
        arguments: tool.arguments || {},
      }));

      // Execute all tools in parallel
      const results = await client.executeToolsParallel(toolExecutions);

      const totalExecutionTime = Date.now() - startTime;
      const successfulExecutions = results.filter(r => r.success).length;
      const failedExecutions = results.length - successfulExecutions;

      // Format results with execution times
      const formattedResults = results.map((result, index) => ({
        toolName: tools[index].toolName,
        success: result.success,
        data: result.data,
        message: result.message,
        executionTime: 0, // Individual timing would require more complex tracking
      }));

      return {
        results: formattedResults,
        totalExecutionTime,
        successfulExecutions,
        failedExecutions,
      };
    } catch (error: any) {
      throw new Error(`Parallel execution failed: ${error.message}`);
    }
  },
};
