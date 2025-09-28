import { Request, Response } from 'express'
import { User, ApiResponse } from 'clear-ai-shared'
import { userService } from '../services/userService'

export const userController = {
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers()
      const response: ApiResponse<User[]> = {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve users',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
      res.status(500).json(response)
    }
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID',
        }
        res.status(400).json(response)
        return
      }
      const user = await userService.getUserById(id)
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} does not exist`,
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
      res.status(500).json(response)
    }
  },

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body as Omit<User, 'id' | 'createdAt' | 'updatedAt'>
      const user = await userService.createUser(userData)
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: 'User created successfully',
      }
      res.status(201).json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
      res.status(500).json(response)
    }
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID',
        }
        res.status(400).json(response)
        return
      }
      const userData = req.body as Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
      const user = await userService.updateUser(id, userData)
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} does not exist`,
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: 'User updated successfully',
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
      res.status(500).json(response)
    }
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID',
        }
        res.status(400).json(response)
        return
      }
      const deleted = await userService.deleteUser(id)
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
          message: `User with ID ${id} does not exist`,
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
      res.status(500).json(response)
    }
  },
}
