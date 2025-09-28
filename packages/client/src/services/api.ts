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

export interface AvailableModels {
  available: string[];
  current: string;
  count: number;
}

export interface WorkflowResult {
  success: boolean;
  result: any;
  steps: any[];
  duration: number;
}

export class ClearAIApiService {
  public client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 50000, // 50 seconds timeout
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
   * Get available models for agent
   */
  async getAvailableModels(): Promise<AvailableModels> {
    const response: AxiosResponse<{
      success: boolean;
      data: AvailableModels;
      message?: string;
    }> = await this.client.get('/api/langchain/models');

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get available models');
    }
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
   * Execute an intelligent agent query
   */
  async executeAgentQuery(query: string, options: {
    userId?: string;
    sessionId?: string;
    includeMemoryContext?: boolean;
    includeReasoning?: boolean;
    model?: string;
    temperature?: number;
    responseDetailLevel?: 'minimal' | 'standard' | 'full';
    excludeVectors?: boolean;
    maxMemoryResults?: number;
  } = {}): Promise<any> {
    const response = await this.client.post('/api/agent/execute', {
      query,
      options: {
        userId: options.userId || 'default-user',
        sessionId: options.sessionId || `session-${Date.now()}`,
        includeMemoryContext: options.includeMemoryContext !== false,
        includeReasoning: options.includeReasoning !== false,
        model: options.model || 'openai',
        temperature: options.temperature || 0.7,
        responseDetailLevel: options.responseDetailLevel || 'standard',
        excludeVectors: options.excludeVectors !== false, // Default to true
        maxMemoryResults: options.maxMemoryResults || 10,
      }
    });
    return response.data;
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

  /**
   * Clear all memories for a user
   */
  async clearUserMemories(userId: string): Promise<any> {
    const response = await this.client.delete(`/api/memory/clear/${userId}`);
    return response.data;
  }

  /**
   * Clear memories for a specific user session
   */
  async clearSessionMemories(userId: string, sessionId: string): Promise<any> {
    const response = await this.client.delete(`/api/memory/clear/${userId}/${sessionId}`);
    return response.data;
  }

  /**
   * Clear semantic memories (user knowledge) for a user
   */
  async clearSemanticMemories(userId: string): Promise<any> {
    const response = await this.client.delete(`/api/memory/clear-semantic/${userId}`);
    return response.data;
  }

  /**
   * Get memory statistics for a user
   */
  async getMemoryStats(userId: string): Promise<any> {
    const response = await this.client.get(`/api/memory/stats/${userId}`);
    return response.data;
  }
}

// Default instance
export const apiService = new ClearAIApiService();

// Export the client instance for direct use
export const apiClient = apiService;