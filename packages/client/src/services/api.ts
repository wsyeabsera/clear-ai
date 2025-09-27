import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, ToolExecutionRequest } from '@clear-ai/shared'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Response received from ${response.config.url}:`, response.status)
        return response
      },
      (error) => {
        console.error('Response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(endpoint)
      return response.data
    } catch (error: any) {
      return this.handleError(error, 'GET', endpoint)
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(endpoint, data)
      return response.data
    } catch (error: any) {
      return this.handleError(error, 'POST', endpoint)
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(endpoint, data)
      return response.data
    } catch (error: any) {
      return this.handleError(error, 'PUT', endpoint)
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(endpoint)
      return response.data
    } catch (error: any) {
      return this.handleError(error, 'DELETE', endpoint)
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/api/health')
  }

  // MCP Tools
  async getTools(): Promise<ApiResponse<Array<{ name: string; description: string }>>> {
    return this.get('/api/mcp/tools')
  }

  async executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<ApiResponse<any>> {
    const request: ToolExecutionRequest = { toolName, arguments: toolArguments || {} }
    return this.post('/api/mcp/execute', request)
  }

  // Error handling
  private handleError(error: any, method: string, endpoint: string): ApiResponse<any> {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred'
    const statusCode = error.response?.status || 500

    console.error(`API Error [${method} ${endpoint}]:`, {
      status: statusCode,
      message: errorMessage,
      details: error.response?.data
    })

    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
