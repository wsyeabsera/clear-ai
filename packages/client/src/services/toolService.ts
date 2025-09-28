import { apiClient } from './api'

// Tool interfaces for API responses
export interface ToolInfo {
  name: string
  description: string
}

export interface ToolSchema {
  name: string
  description: string
  inputSchema: any
  outputSchema?: any
}

export const toolService = {
  async getTools(): Promise<ToolInfo[]> {
    const response = await apiClient.getTools()
    // The API returns the data directly, not wrapped
    return response || []
  },

  async getToolSchemas(): Promise<{ success: boolean; data?: ToolSchema[]; error?: string }> {
    try {
      console.log('Calling apiClient.getToolSchemas()...');
      const response = await apiClient.getToolSchemas()
      console.log('API response:', response);
      return response
    } catch (error: any) {
      console.error('API call failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to load tool schemas'
      }
    }
  },

  async executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<any> {
    return apiClient.executeTool(toolName, toolArguments)
  },
}
