/**
 * API Service for Clear AI Client
 *
 * Provides typed API communication with Clear AI servers
 */

import axios from 'axios';

// Type definitions for axios
type AxiosInstance = ReturnType<typeof axios.create>;
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
};

export interface ServerHealth {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

export interface MCPTool {
  name: string;
  description: string;
  status: string;
  inputSchema?: any;
}

export interface LLMModel {
  name: string;
  provider: string;
  status: string;
}

export interface WorkflowResult {
  success: boolean;
  result: any;
  steps: any[];
  duration: number;
}

export class ClearAIApiService {
  public client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Cannot connect to server at ${baseURL}. Make sure the server is running.`);
        }
        throw new Error(error.response?.data?.message || error.message || 'Request failed');
      }
    );
  }

  /**
   * Check server health
   */
  async getHealth(): Promise<ServerHealth> {
    const response: AxiosResponse<ServerHealth> = await this.client.get('/api/health');
    return response.data;
  }

  /**
   * Get available MCP tools
   */
  async getTools(): Promise<MCPTool[]> {
    const response: AxiosResponse<{
      success: boolean;
      data: MCPTool[];
      error?: string;
    }> = await this.client.get('/api/mcp/tools');
    return response.data.data || [];
  }

  /**
   * Get MCP tool schemas
   */
  async getToolSchemas(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const response: AxiosResponse<{ success: boolean; data?: any[]; error?: string }> = await this.client.get('/api/mcp/schemas');
    return response.data;
  }

  /**
   * Execute an MCP tool
   */
  async executeTool(toolName: string, data: any = {}): Promise<any> {
    const response = await this.client.post(`/api/mcp/tools/${toolName}/execute`, data);
    return response.data;
  }

  /**
   * Complete a prompt using LLM
   */
  async completePrompt(prompt: string, options: {
    model?: string;
    temperature?: number;
  } = {}): Promise<string> {
    const response = await this.client.post('/api/langchain/complete', {
      prompt,
      model: options.model || 'ollama',
      temperature: options.temperature || 0.7,
    });
    const data = response.data as any;
    return data.content || data;
  }

  /**
   * Get available LLM models
   */
  async getModels(): Promise<LLMModel[]> {
    const response: AxiosResponse<LLMModel[]> = await this.client.get('/api/langchain/models');
    return response.data;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(description: string, options: {
    model?: string;
  } = {}): Promise<WorkflowResult> {
    const response = await this.client.post('/api/langgraph/execute', {
      description,
      model: options.model || 'ollama',
    });
    return response.data as WorkflowResult;
  }

  /**
   * Update server URL
   */
  setBaseURL(url: string): void {
    this.client.defaults.baseURL = url;
  }

  /**
   * Get current server URL
   */
  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }
}

// Default instance
export const apiService = new ClearAIApiService();

// Export the client instance for direct use
export const apiClient = apiService;