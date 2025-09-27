import axios from 'axios'
import { User, ApiResponse } from '@clear-ai/shared'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get('/api/users')
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        error: 'Failed to fetch users',
      }
    }
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/api/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      return {
        success: false,
        error: 'Failed to fetch user',
      }
    }
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post('/api/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      return {
        success: false,
        error: 'Failed to create user',
      }
    }
  },
}
