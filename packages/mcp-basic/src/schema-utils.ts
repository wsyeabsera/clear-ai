import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Convert a Zod schema to JSON Schema format
 */
export function zodToJsonSchemaConverter(schema: z.ZodSchema): any {
  return zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  });
}

/**
 * Convert a ZodTool to a ToolSchema with JSON Schema format
 */
export function convertZodToolToToolSchema(tool: any): any {
  const inputSchema = zodToJsonSchemaConverter(tool.inputSchema);
  const outputSchema = tool.outputSchema 
    ? zodToJsonSchemaConverter(tool.outputSchema)
    : undefined;

  return {
    name: tool.name,
    description: tool.description,
    inputSchema,
    outputSchema,
  };
}
