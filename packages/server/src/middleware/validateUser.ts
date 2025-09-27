import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@clear-ai/shared'
import { isValidEmail } from '@clear-ai/shared'

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email } = req.body

  // Check if required fields are present
  if (!name || !email) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Name and email are required fields',
    }
    res.status(400).json(response)
    return
  }

  // Validate email format
  if (!isValidEmail(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Please provide a valid email address',
    }
    res.status(400).json(response)
    return
  }

  // Validate name length
  if (name.length < 2 || name.length > 100) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Name must be between 2 and 100 characters',
    }
    res.status(400).json(response)
    return
  }

  // Validate email length
  if (email.length > 255) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Email must be less than 255 characters',
    }
    res.status(400).json(response)
    return
  }

  next()
}
