# API Reference Overview

This section provides comprehensive documentation for all APIs in the Clear AI system. The APIs are organized by package and functionality, making it easy to find the information you need.

> **Note**: Clear AI is designed primarily for CLI tools and server applications. The client APIs are optional and available for web-based interfaces and development environments.

## API Organization

### Server APIs
- **[Agent APIs](/docs/api/server/agent)** - **NEW!** Unified agent interface combining memory, tools, and conversation
- **[Intent Classifier APIs](/docs/api/server/intent-classifier)** - **NEW!** Smart routing system for query classification
- **[Tool Execution APIs](/docs/api/server/tools)** - Tool registration and execution
- **[Memory System APIs](/docs/api/server/memory)** - Episodic and semantic memory management
- **[Memory Chat APIs](/docs/api/server/memory-chat)** - Memory-aware conversational interface
- **[Health APIs](/docs/api/server/health)** - System health and status endpoints
- **[LangGraph APIs](/docs/api/server/langgraph)** - Workflow orchestration
- **MCP APIs** - Model Context Protocol integration (coming soon)
- **User Management APIs** - User CRUD operations (coming soon)

### Client APIs (Optional)
- **Service APIs** - Frontend service layer for React applications
- **Component APIs** - React component interfaces and props
- **Hook APIs** - Custom React hooks for AI functionality

### MCP Tool APIs
- **API Call Tool** - HTTP API requests (coming soon)
- **JSON Reader Tool** - JSON data processing (coming soon)
- **File Reader Tool** - File system operations (coming soon)
- **Parallel Execution Tool** - Concurrent tool execution (coming soon)

### Shared Service APIs
- **LLM Provider APIs** - Language model integrations (coming soon)
- **Workflow APIs** - Workflow orchestration services (coming soon)
- **Type Definitions** - TypeScript interfaces and types (coming soon)

## Base URL

All server APIs are available at:
```
http://localhost:3001
```

## Authentication

Currently, the APIs do not require authentication. This will be added in future versions.

## Response Format

All APIs follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "details": <additional_error_info>
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Rate limiting is not currently implemented but will be added in future versions.

## Error Handling

### Common Error Types

**Validation Errors**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Invalid input data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**Tool Execution Errors**
```json
{
  "success": false,
  "message": "Tool execution failed",
  "error": "API call failed: Connection timeout",
  "details": {
    "toolName": "api_call",
    "args": { "url": "https://api.example.com" }
  }
}
```

**Workflow Errors**
```json
{
  "success": false,
  "message": "Workflow execution failed",
  "error": "Step 2 failed: Tool not found",
  "details": {
    "workflowId": "user-research-123",
    "step": 2,
    "toolName": "weather"
  }
}
```

## Request/Response Examples

### Tool Execution

**Request:**
```bash
curl -X POST http://localhost:3001/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "calculator",
    "args": {
      "operation": "add",
      "a": 5,
      "b": 3
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": 8,
    "executionTime": 45,
    "toolName": "calculator"
  },
  "message": "Tool executed successfully"
}
```

### Workflow Execution

**Request:**
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1",
    "options": {
      "model": "gpt-3.5-turbo",
      "temperature": 0.1
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "finalResult": {
      "id": 1,
      "name": "Leanne Graham",
      "email": "Sincere@april.biz"
    },
    "allResults": {
      "api_call": {
        "status": 200,
        "data": {
          "id": 1,
          "name": "Leanne Graham",
          "email": "Sincere@april.biz"
        }
      }
    },
    "executionOrder": ["api_call"],
    "errors": [],
    "executionTime": 1234,
    "traceId": "trace-123"
  },
  "message": "Workflow executed successfully"
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
import { ClearAIClient } from '@clear-ai/client-sdk';

const client = new ClearAIClient({
  baseURL: 'http://localhost:3001',
  apiKey: 'your-api-key', // Optional
});

// Execute a tool
const result = await client.tools.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});

// Execute a workflow
const workflow = await client.workflows.execute({
  query: 'Get weather for London',
  options: { model: 'gpt-3.5-turbo' }
});
```

### Python

```python
from clear_ai import ClearAIClient

client = ClearAIClient(
    base_url="http://localhost:3001",
    api_key="your-api-key"  # Optional
)

# Execute a tool
result = client.tools.execute("calculator", {
    "operation": "add",
    "a": 5,
    "b": 3
})

# Execute a workflow
workflow = client.workflows.execute({
    "query": "Get weather for London",
    "options": {"model": "gpt-3.5-turbo"}
})
```

## Testing

### Interactive API Testing

Use the built-in Swagger UI at http://localhost:3001/api-docs to test APIs interactively.

### cURL Examples

```bash
# Health check
curl http://localhost:3001/api/health

# List available tools
curl http://localhost:3001/api/tools

# Execute a tool
curl -X POST http://localhost:3001/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"toolName": "calculator", "args": {"operation": "add", "a": 5, "b": 3}}'

# Execute a workflow
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "Add 5 and 3"}'
```

### Postman Collection

A Postman collection is available for testing all APIs. Import the collection from the `/docs/postman` directory.

## Versioning

APIs are versioned using URL paths:
- Current version: `/api/v1/` (default)
- Future versions: `/api/v2/`, `/api/v3/`, etc.

## Changelog

### v1.0.0
- Initial API release
- Tool execution endpoints
- LangGraph workflow endpoints
- MCP integration
- User management endpoints

## Support

For API support:
- 📖 **Documentation**: This comprehensive guide
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📧 **Contact**: Reach out to the maintainers

## Next Steps

1. **Explore Server APIs**: Start with [Health APIs](/docs/api/server/health)
2. **Learn Tool Execution**: Check out [Tool Execution APIs](/docs/api/server/tools)
3. **Understand Workflows**: Dive into [LangGraph APIs](/docs/api/server/langgraph)
4. **Build Integrations**: Use the [Client APIs](/docs/api/client/services)
5. **Create Custom Tools**: Follow the [MCP Tool APIs](/docs/api/mcp/api-call)
