import { MCPServer } from './mcp-server';

async function main() {
  const server = new MCPServer();
  await server.start();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { MCPServer } from './mcp-server';
export { ToolRegistry } from './tool-registry';
export * from './types';
export * from './tools';
export * from './schema-utils';
