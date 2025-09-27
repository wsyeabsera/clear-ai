import { z } from 'zod';
import axios, { AxiosResponse } from 'axios';
import { ZodTool } from '../types';

const ApiCallSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().min(1000).max(30000).default(10000),
});

const ApiCallOutputSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.any()),
  data: z.any(),
  error: z.boolean().optional(),
});

export const apiCallTool: ZodTool = {
  name: 'api_call',
  description: 'Make HTTP API calls to external services',
  inputSchema: ApiCallSchema,
  outputSchema: ApiCallOutputSchema,
  execute: async (args) => {
    const { url, method, headers, body, timeout } = ApiCallSchema.parse(args);
    
    try {
      const response: AxiosResponse = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        data: body,
        timeout,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: true,
        };
      }
      throw new Error(`API call failed: ${error.message}`);
    }
  },
};
