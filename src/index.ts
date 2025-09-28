/**
 * @clear-ai/core - Main entry point
 * 
 * Clear AI - A modern TypeScript framework for building AI-powered applications
 * with tool execution and workflow orchestration.
 */

// Re-export everything from subpackages directly from their dist files
export * from '../packages/shared/dist/index';
export * from '../packages/server/dist/index';

// Re-export specific items from mcp-basic package to avoid conflicts
export { MCPServer, ToolRegistry } from '../packages/mcp-basic/dist/index';
export { ZodTool } from '../packages/mcp-basic/dist/types';
export { apiCallTool, jsonReaderTool, fileReaderTool, executeParallelTool } from '../packages/mcp-basic/dist/tools';
export * from '../packages/mcp-basic/dist/schema-utils';

// Main framework exports
export { ClearAI } from './framework';

// Version info
export const version = '1.0.0';
