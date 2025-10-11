import { z } from 'zod';
import { ZodTool } from '../types';

const CalculatorSchema = z.object({
  expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 2", "10 * 5", "100 / 4")')
});

const CalculatorOutputSchema = z.object({
  success: z.boolean(),
  result: z.number().optional(),
  error: z.string().optional()
});

export const calculatorTool: ZodTool = {
  name: 'calculator',
  description: 'Perform basic arithmetic calculations safely',
  inputSchema: CalculatorSchema,
  outputSchema: CalculatorOutputSchema,
  execute: async (args: z.infer<typeof CalculatorSchema>) => {
    const { expression } = CalculatorSchema.parse(args);
    
    try {
      // Basic validation for safe mathematical expressions
      const allowedChars = /^[0-9+\-*/.()\s]+$/;
      if (!allowedChars.test(expression)) {
        return {
          success: false,
          error: 'Expression contains invalid characters. Only numbers, +, -, *, /, ., (, ) and spaces are allowed.'
        };
      }

      // Evaluate the mathematical expression safely
      // Note: In production, you might want to use a more secure math parser
      const result = Function(`"use strict"; return (${expression})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return {
          success: false,
          error: 'Invalid mathematical expression or result'
        };
      }

      return {
        success: true,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Export the executeCalculator function for direct use if needed
export async function executeCalculator(params: { expression: string }): Promise<{
  success: boolean;
  result?: number;
  error?: string;
}> {
  const { expression } = CalculatorSchema.parse(params);
  
  try {
    // Basic validation for safe mathematical expressions
    const allowedChars = /^[0-9+\-*/.()\s]+$/;
    if (!allowedChars.test(expression)) {
      return {
        success: false,
        error: 'Expression contains invalid characters. Only numbers, +, -, *, /, ., (, ) and spaces are allowed.'
      };
    }

    // Evaluate the mathematical expression safely
    // Note: In production, you might want to use a more secure math parser
    const result = Function(`"use strict"; return (${expression})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return {
        success: false,
        error: 'Invalid mathematical expression or result'
      };
    }

    return {
      success: true,
      result: result
    };
  } catch (error) {
    return {
      success: false,
      error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
