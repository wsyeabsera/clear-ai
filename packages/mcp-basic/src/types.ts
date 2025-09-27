import { z } from 'zod';
import { Tool, ToolExecutionRequest, ToolExecutionResponse } from '@clear-ai/shared';

// Re-export shared types for convenience
export { Tool, ToolExecutionRequest, ToolExecutionResponse };

// Extended Tool interface with Zod schema
export interface ZodTool extends Omit<Tool, 'inputSchema' | 'outputSchema'> {
  inputSchema: z.ZodSchema;
  outputSchema?: z.ZodSchema;
}
