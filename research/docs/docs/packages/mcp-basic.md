# MCP Basic Package

The MCP Basic package (`@clear-ai/mcp-basic`) implements the Model Context Protocol (MCP) server with essential tools for API calls, JSON processing, file operations, and parallel execution. It serves as the foundation for tool execution in the Clear AI system.

## Overview

The MCP Basic package provides:

- **MCP Server**: Full Model Context Protocol implementation
- **Tool Registry**: Dynamic tool registration and management
- **Essential Tools**: Core tools for common operations
- **Schema Validation**: Runtime validation using Zod schemas
- **JSON Schema**: Tool definitions for LLM integration

## Technology Stack

### Core Technologies
- **Model Context Protocol SDK**: Official MCP implementation
- **TypeScript**: Type-safe tool definitions
- **Zod**: Runtime schema validation
- **Axios**: HTTP client for API calls

### Additional Libraries
- **zod-to-json-schema**: Convert Zod schemas to JSON Schema
- **@clear-ai/shared**: Shared types and utilities

## Project Structure

```
packages/mcp-basic/
├── src/
│   ├── tools/              # Tool implementations
│   │   ├── api-call.ts     # HTTP API calls
│   │   ├── json-reader.ts  # JSON data processing
│   │   ├── file-reader.ts  # File system operations
│   │   ├── execute-parallel.ts  # Parallel tool execution
│   │   └── index.ts        # Tool exports
│   ├── mcp-server.ts       # MCP server implementation
│   ├── tool-registry.ts    # Tool registration and management
│   ├── schema-utils.ts     # Schema conversion utilities
│   ├── types.ts            # TypeScript type definitions
│   └── index.ts            # Main entry point
├── dist/                   # Built files
├── package.json
└── tsconfig.json
```

## MCP Server Implementation

### Server Setup

The MCP server is implemented using the official MCP SDK:

```typescript
export class MCPServer {
  private server: Server;
  private toolRegistry: ToolRegistry;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-basic',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.toolRegistry = new ToolRegistry();
    this.setupHandlers();
  }
}
```

### Request Handlers

#### List Tools Handler

```typescript
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = this.toolRegistry.getAllTools();
  
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    })),
  };
});
```

#### Call Tool Handler

```typescript
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    const result = await this.toolRegistry.executeTool(name, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});
```

## Tool Registry

The `ToolRegistry` manages all available tools:

```typescript
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // Register default tools
    this.registerTool(apiCallTool);
    this.registerTool(jsonReaderTool);
    this.registerTool(fileReaderTool);
    this.registerTool(executeParallelTool);
  }

  // Register a new tool
  registerTool(tool: ZodTool): void {
    this.tools.set(tool.name, tool);
  }

  // Get tool by name
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  // Get all tools
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  // Execute tool with arguments
  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      return await tool.execute(args);
    } catch (error: any) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }
}
```

## Available Tools

### 1. API Call Tool (`api_call`)

Makes HTTP API calls to external services.

#### Schema

```typescript
const ApiCallSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().min(1000).max(30000).default(10000),
});
```

#### Usage Example

```json
{
  "toolName": "api_call",
  "arguments": {
    "url": "https://jsonplaceholder.typicode.com/users/1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer token"
    }
  }
}
```

#### Response

```json
{
  "status": 200,
  "statusText": "OK",
  "headers": {
    "content-type": "application/json"
  },
  "data": {
    "id": 1,
    "name": "Leanne Graham",
    "email": "Sincere@april.biz"
  }
}
```

### 2. JSON Reader Tool (`json_reader`)

Parses and reads JSON data with optional path extraction.

#### Schema

```typescript
const JsonReaderSchema = z.object({
  jsonString: z.string().describe('JSON string to parse'),
  path: z.string().optional().describe('JSONPath to extract specific data'),
  pretty: z.boolean().default(false).describe('Format output as pretty JSON'),
});
```

#### Usage Example

```json
{
  "toolName": "json_reader",
  "arguments": {
    "jsonString": "{\"users\": [{\"id\": 1, \"name\": \"John\"}, {\"id\": 2, \"name\": \"Jane\"}]}",
    "path": "$.users[0].name",
    "pretty": true
  }
}
```

#### Response

```json
{
  "success": true,
  "data": "John",
  "path": "$.users[0].name",
  "originalData": {
    "users": [
      {"id": 1, "name": "John"},
      {"id": 2, "name": "Jane"}
    ]
  }
}
```

### 3. File Reader Tool (`file_reader`)

Reads files, lists directories, or gets file information.

#### Schema

```typescript
const FileReaderSchema = z.object({
  path: z.string().describe('File or directory path'),
  operation: z.enum(['read', 'list', 'info']).default('read'),
  encoding: z.enum(['utf8', 'base64', 'hex']).default('utf8'),
  maxSize: z.number().max(10 * 1024 * 1024).default(1024 * 1024), // 1MB default
});
```

#### Usage Examples

**Read File:**
```json
{
  "toolName": "file_reader",
  "arguments": {
    "path": "/path/to/file.txt",
    "operation": "read",
    "encoding": "utf8"
  }
}
```

**List Directory:**
```json
{
  "toolName": "file_reader",
  "arguments": {
    "path": "/path/to/directory",
    "operation": "list"
  }
}
```

**Get File Info:**
```json
{
  "toolName": "file_reader",
  "arguments": {
    "path": "/path/to/file.txt",
    "operation": "info"
  }
}
```

### 4. Execute Parallel Tool (`execute_parallel`)

Executes multiple MCP tools in parallel with error handling.

#### Schema

```typescript
const ExecuteParallelSchema = z.object({
  tools: z.array(z.object({
    toolName: z.string(),
    arguments: z.record(z.any()),
  })).min(1).max(10),
  timeout: z.number().min(1000).max(60000).default(30000),
  failFast: z.boolean().default(false),
});
```

#### Usage Example

```json
{
  "toolName": "execute_parallel",
  "arguments": {
    "tools": [
      {
        "toolName": "api_call",
        "arguments": {
          "url": "https://api.example.com/users/1",
          "method": "GET"
        }
      },
      {
        "toolName": "api_call",
        "arguments": {
          "url": "https://api.example.com/posts/1",
          "method": "GET"
        }
      }
    ],
    "timeout": 10000,
    "failFast": false
  }
}
```

#### Response

```json
{
  "success": true,
  "results": [
    {
      "toolName": "api_call",
      "success": true,
      "data": { "id": 1, "name": "John" },
      "executionTime": 1234
    },
    {
      "toolName": "api_call",
      "success": true,
      "data": { "id": 1, "title": "Hello World" },
      "executionTime": 987
    }
  ],
  "totalExecutionTime": 1234,
  "errors": []
}
```

## Schema Utilities

### Zod to JSON Schema Conversion

The package includes utilities to convert Zod schemas to JSON Schema for LLM integration:

```typescript
export function convertZodToolToToolSchema(tool: ZodTool): any {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.inputSchema),
    outputSchema: tool.outputSchema ? zodToJsonSchema(tool.outputSchema) : undefined,
  };
}
```

### Type Definitions

```typescript
// Extended Tool interface with Zod schema
export interface ZodTool extends Omit<Tool, 'inputSchema' | 'outputSchema'> {
  inputSchema: z.ZodSchema;
  outputSchema?: z.ZodSchema;
}

// Tool execution request
export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
}

// Tool execution response
export interface ToolExecutionResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}
```

## Development

### Getting Started

```bash
# Navigate to MCP basic package
cd packages/mcp-basic

# Install dependencies
npm install

# Build the package
npm run build

# Start the MCP server
npm start
```

### Available Scripts

```bash
# Development
npm run dev          # Build in watch mode
npm run build        # Build TypeScript
npm start            # Start MCP server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Utilities
npm run clean        # Clean build artifacts
```

### Building

```bash
# Build for production
npm run build

# The built files will be in dist/
# - index.js
# - mcp-server.js
# - tool-registry.js
# - tools/
```

## Testing

### Unit Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Tool Testing

Test individual tools:

```typescript
// Test API call tool
const result = await apiCallTool.execute({
  url: 'https://jsonplaceholder.typicode.com/users/1',
  method: 'GET'
});

console.log(result);
```

### MCP Server Testing

Test the MCP server using the MCP client:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'test-client',
  version: '1.0.0',
}, {
  capabilities: {}
});

// Connect to server
await client.connect();

// List available tools
const tools = await client.listTools();
console.log(tools);

// Execute a tool
const result = await client.callTool({
  name: 'api_call',
  arguments: {
    url: 'https://jsonplaceholder.typicode.com/users/1',
    method: 'GET'
  }
});

console.log(result);
```

## Integration

### With Clear AI Server

The MCP Basic package integrates with the Clear AI server:

```typescript
// In server package
import { MCPServer } from '@clear-ai/mcp-basic';

const mcpServer = new MCPServer();
const toolRegistry = mcpServer.getToolRegistry();

// Use tools in server endpoints
app.post('/api/tools/execute', async (req, res) => {
  const { toolName, args } = req.body;
  
  try {
    const result = await toolRegistry.executeTool(toolName, args);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### With LangChain

Tools can be used with LangChain for LLM integration:

```typescript
import { Tool } from 'langchain/tools';
import { toolRegistry } from '@clear-ai/mcp-basic';

// Convert MCP tools to LangChain tools
const langchainTools = toolRegistry.getAllTools().map(tool => 
  new Tool({
    name: tool.name,
    description: tool.description,
    func: async (input) => {
      const args = JSON.parse(input);
      return JSON.stringify(await tool.execute(args));
    }
  })
);
```

## Error Handling

### Tool Execution Errors

```typescript
try {
  const result = await toolRegistry.executeTool('api_call', {
    url: 'invalid-url',
    method: 'GET'
  });
} catch (error) {
  if (error.message.includes('Tool execution failed')) {
    // Handle tool execution error
  } else if (error.message.includes('not found')) {
    // Handle tool not found error
  }
}
```

### Validation Errors

```typescript
// Zod validation errors
const ApiCallSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
});

try {
  ApiCallSchema.parse({ url: 'invalid', method: 'INVALID' });
} catch (error) {
  console.error('Validation error:', error.errors);
}
```

## Performance

### Optimization Strategies

1. **Schema Caching**: Cache converted JSON schemas
2. **Tool Registration**: Lazy load tools on demand
3. **Error Handling**: Efficient error propagation
4. **Memory Management**: Proper cleanup of resources

### Memory Usage

Monitor memory usage for tool execution:

```typescript
// Monitor tool execution memory
const startMemory = process.memoryUsage();
const result = await toolRegistry.executeTool(toolName, args);
const endMemory = process.memoryUsage();

console.log('Memory delta:', {
  rss: endMemory.rss - startMemory.rss,
  heapUsed: endMemory.heapUsed - startMemory.heapUsed
});
```

## Security

### Input Validation

All tool inputs are validated using Zod schemas:

```typescript
// Validate tool arguments
const validatedArgs = tool.inputSchema.parse(args);
```

### File System Security

File operations include security checks:

```typescript
// Check file path security
const isPathSafe = (path: string): boolean => {
  const normalizedPath = path.normalize(path);
  return !normalizedPath.includes('..') && 
         !normalizedPath.startsWith('/etc') &&
         !normalizedPath.startsWith('/sys');
};
```

### API Call Security

API calls include timeout and size limits:

```typescript
// Secure API call configuration
const secureConfig = {
  timeout: 10000,
  maxRedirects: 5,
  maxContentLength: 10 * 1024 * 1024, // 10MB
  validateStatus: (status) => status < 500
};
```

## Troubleshooting

### Common Issues

**Tool Not Found**
```bash
# Check if tool is registered
console.log(toolRegistry.getToolNames());
```

**Schema Validation Errors**
```bash
# Check schema validation
const schema = tool.inputSchema;
const result = schema.safeParse(args);
if (!result.success) {
  console.error('Validation errors:', result.error.errors);
}
```

**MCP Server Connection Issues**
```bash
# Check server status
ps aux | grep mcp-server
```

## Next Steps

Now that you understand the MCP Basic package:

1. **Explore Tools**: Check out the available tools in the system
2. **Learn Integration**: Understand [server integration](/docs/packages/server)
3. **Build Custom Tools**: Follow the [tutorials](/docs/tutorials/building-your-first-tool)
4. **Advanced Usage**: Learn about [workflow orchestration](/docs/tutorials/creating-workflows)
