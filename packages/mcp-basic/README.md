# @clear-ai/mcp-basic

MCP Server with basic tools for API calls, JSON reading, and file operations.

## Installation

```bash
npm install @clear-ai/mcp-basic
```

## Quick Start

```typescript
import { MCPServer, ToolRegistry } from '@clear-ai/mcp-basic';

// Create MCP server
const server = new MCPServer();

// Get tool registry
const toolRegistry = server.getToolRegistry();

// Register custom tools
toolRegistry.registerTool({
  name: 'my-tool',
  description: 'My custom tool',
  inputSchema: z.object({
    input: z.string()
  }),
  execute: async (args) => {
    return { result: `Processed: ${args.input}` };
  }
});

// Start server
await server.start();
```

## Available Tools

- **API Call Tool** - Make HTTP requests
- **JSON Reader Tool** - Parse and extract JSON data
- **File Reader Tool** - Read files and directories
- **Execute Parallel Tool** - Run multiple tools concurrently

## Usage Examples

### API Call Tool

```typescript
const result = await toolRegistry.executeTool('api_call', {
  url: 'https://api.example.com/users/1',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});
```

### JSON Reader Tool

```typescript
const result = await toolRegistry.executeTool('json_reader', {
  jsonString: '{"users": [{"id": 1, "name": "John"}]}',
  path: '$.users[0].name',
  pretty: true
});
```

### File Reader Tool

```typescript
const result = await toolRegistry.executeTool('file_reader', {
  path: '/path/to/file.txt',
  operation: 'read',
  encoding: 'utf8'
});
```

## Documentation

For complete documentation, visit: https://clear-ai-docs.example.com/docs/packages/mcp-basic

## License

MIT
