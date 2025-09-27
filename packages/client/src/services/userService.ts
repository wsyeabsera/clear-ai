import { User, ApiResponse } from '@clear-ai/shared'
import { apiClient } from './api'

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get('/api/users')
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/api/users/${id}`)
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    return apiClient.post('/api/users', userData)
  },
}
