import { ApiResponse } from '@clear-ai/shared'
import { apiClient } from './api'

// Simplified Tool interface for API responses (server only returns name and description)
export interface ToolInfo {
  name: string
  description: string
}

export const toolService = {
  async getTools(): Promise<ApiResponse<ToolInfo[]>> {
    return apiClient.getTools()
  },

  async executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.executeTool(toolName, toolArguments)
  },
}
