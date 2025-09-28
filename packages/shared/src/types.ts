// Common types used across the application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  tools?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Environment = 'development' | 'staging' | 'production';

export interface Config {
  environment: Environment;
  apiUrl: string;
  version: string;
}

// MCP (Model Context Protocol) types
export interface Tool {
  name: string;
  description: string;
  inputSchema: any; // Using any to avoid zod dependency in shared
  outputSchema?: any; // Optional output schema
  execute: (args: any) => Promise<any>;
}

export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
}

export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
}

export interface ToolExecutionResponse {
  success: boolean;
  result?: any;
  error?: string;
}
