import axios from 'axios';

export interface ToolExecutionRequest {
  toolName: string;
  arguments?: Record<string, any>;
}

export interface ToolExecutionResponse {
  success: boolean;
  data?: any;
  message: string;
}

export interface ToolsListResponse {
  success: boolean;
  data: Array<{
    name: string;
    description: string;
  }>;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export interface MCPClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class MCPClient {
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

  /**
   * Execute a single tool with error handling and retry logic
   */
  async executeTool(
    toolName: string,
    args: Record<string, any> = {}
  ): Promise<ToolExecutionResponse> {
    return this.retryOperation(async () => {
      try {
        const response: { data: ToolExecutionResponse } = await axios.post(
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
        if (error.response) {
          // Server responded with error status
          return {
            success: false,
            message: error.response.data?.message || 'Server error',
          };
        } else if (error.request) {
          // Network error
          throw new Error(`Network error: Unable to reach MCP server at ${this.baseURL}`);
        }
        throw new Error(`Unexpected error: ${error.message}`);
      }
    });
  }

  /**
   * Execute multiple tools in parallel
   */
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

  /**
   * Execute multiple tools sequentially
   */
  async executeToolsSequential(
    toolExecutions: ToolExecutionRequest[]
  ): Promise<ToolExecutionResponse[]> {
    const results: ToolExecutionResponse[] = [];

    for (const execution of toolExecutions) {
      try {
        const result = await this.executeTool(execution.toolName, execution.arguments);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          message: `Tool ${execution.toolName} failed: ${error.message}`,
        });
      }
    }

    return results;
  }

  /**
   * Get all available tools
   */
  async getTools(): Promise<ToolsListResponse> {
    return this.retryOperation(async () => {
      try {
        const response: { data: ToolsListResponse } = await axios.get(
          `${this.baseURL}/tools`,
          {
            timeout: this.timeout,
          }
        );

        return response.data as ToolsListResponse;
      } catch (error: any) {
        if (error.response) {
          return {
            success: false,
            data: [],
            message: error.response.data?.message || 'Server error',
          };
        } else if (error.request) {
          throw new Error(`Network error: Unable to reach MCP server at ${this.baseURL}`);
        }
        throw new Error(`Unexpected error: ${error.message}`);
      }
    });
  }

  /**
   * Generic retry operation with exponential backoff
   */
  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
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

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<MCPClientConfig>): void {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.timeout) this.timeout = config.timeout;
    if (config.retries !== undefined) this.retries = config.retries;
    if (config.retryDelay) this.retryDelay = config.retryDelay;
  }
}
