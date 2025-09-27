import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@clear-ai/shared'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error)

  const response: ApiResponse = {
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong',
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    response.error = 'Validation Error'
    response.message = error.message
    res.status(400).json(response)
    return
  }

  if (error.name === 'CastError') {
    response.error = 'Invalid ID format'
    response.message = 'The provided ID is not valid'
    res.status(400).json(response)
    return
  }

  // Default to 500 error
  res.status(500).json(response)
}
