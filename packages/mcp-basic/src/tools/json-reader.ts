import { z } from 'zod';
import { ZodTool } from '../types';

const JsonReaderSchema = z.object({
  jsonString: z.string({ required_error: 'JSON string is required' }),
  path: z.string().optional(),
});

export const jsonReaderTool: ZodTool = {
  name: 'json_reader',
  description: 'Parse and read JSON data with optional path extraction',
  inputSchema: JsonReaderSchema,
  execute: async (args) => {
    const { jsonString, path } = JsonReaderSchema.parse(args);
    
    try {
      const parsed = JSON.parse(jsonString);
      
      if (!path) {
        return parsed;
      }
      
      // Simple path extraction (e.g., "user.name" or "items[0].title")
      const pathParts = path.split(/[\.\[\]]+/).filter(Boolean);
      let result = parsed;
      
      for (const part of pathParts) {
        if (result === null || result === undefined) {
          throw new Error(`Path '${path}' not found in JSON`);
        }
        
        if (Array.isArray(result)) {
          const index = parseInt(part, 10);
          if (isNaN(index)) {
            throw new Error(`Invalid array index: ${part}`);
          }
          result = result[index];
        } else if (typeof result === 'object') {
          result = result[part];
        } else {
          throw new Error(`Cannot access property '${part}' on non-object`);
        }
      }
      
      return result;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      throw error;
    }
  },
};
