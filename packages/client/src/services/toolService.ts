import { ApiResponse } from '@clear-ai/shared'
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
  async getTools(): Promise<ApiResponse<ToolInfo[]>> {
    return apiClient.getTools()
  },

  async getToolSchemas(): Promise<ApiResponse<ToolSchema[]>> {
    return apiClient.getToolSchemas()
  },

  async getToolSchema(toolName: string): Promise<ApiResponse<ToolSchema>> {
    return apiClient.getToolSchema(toolName)
  },

  async executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.executeTool(toolName, toolArguments)
  },
}
