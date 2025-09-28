import { User } from '@clear-ai/shared'
import { apiClient } from './api'

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.client.get('/api/users') as any
    // Handle both direct array response and wrapped response
    if (Array.isArray(response.data)) {
      return response.data as User[]
    }
    return response.data.data || []
  },

  async getUser(id: string): Promise<User> {
    return apiClient.client.get(`/api/users/${id}`).then(res => res.data as User)
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return apiClient.client.post('/api/users', userData).then(res => res.data as User)
  },
}
