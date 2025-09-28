# Tool Execution APIs

The Tool Execution APIs provide comprehensive functionality for registering, managing, and executing tools in the Clear AI system. These APIs support both individual tool execution and complex multi-tool workflows.

## Base URL

```
http://localhost:3001/api/tools
```

## Endpoints

### GET `/api/tools`

Get all registered tools.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "calculator",
      "description": "Perform basic arithmetic operations",
      "parameters": {
        "operation": "string",
        "a": "number",
        "b": "number"
      }
    },
    {
      "name": "api_call",
      "description": "Make HTTP API calls to external services",
      "parameters": {
        "url": "string",
        "method": "string",
        "headers": "object",
        "body": "any"
      }
    }
  ],
  "message": "Tools retrieved successfully"
}
```

### GET `/api/tools/:toolName`

Get a specific tool by name.

**Parameters:**
- `toolName` (string): Name of the tool

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "calculator",
    "description": "Perform basic arithmetic operations",
    "parameters": {
      "operation": "string",
      "a": "number",
      "b": "number"
    }
  },
  "message": "Tool retrieved successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Tool not found",
  "error": "Tool 'nonexistent' not found"
}
```

### POST `/api/tools/register`

Register a new tool.

**Request Body:**
```json
{
  "name": "weather",
  "description": "Get weather information for a city",
  "parameters": {
    "city": "string",
    "country": "string",
    "units": "string"
  },
  "execute": "function"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "weather",
    "description": "Get weather information for a city",
    "parameters": {
      "city": "string",
      "country": "string",
      "units": "string"
    }
  },
  "message": "Tool registered successfully"
}
```

### DELETE `/api/tools/:toolName`

Remove a tool by name.

**Parameters:**
- `toolName` (string): Name of the tool to remove

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "weather"
  },
  "message": "Tool removed successfully"
}
```

### POST `/api/tools/clear`

Clear all registered tools.

**Response:**
```json
{
  "success": true,
  "data": {
    "cleared": 5
  },
  "message": "All tools cleared successfully"
}
```

## Tool Execution Endpoints

### POST `/api/tools/execute`

Execute a single tool.

**Request Body:**
```json
{
  "toolName": "calculator",
  "args": {
    "operation": "add",
    "a": 5,
    "b": 3
  }
}
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

**Error Response:**
```json
{
  "success": false,
  "message": "Tool execution failed",
  "error": "Invalid operation: 'divide'",
  "details": {
    "toolName": "calculator",
    "args": {
      "operation": "divide",
      "a": 5,
      "b": 0
    }
  }
}
```

### POST `/api/tools/execute-multiple`

Execute multiple tools in parallel.

**Request Body:**
```json
{
  "tools": [
    {
      "toolName": "calculator",
      "args": {
        "operation": "add",
        "a": 5,
        "b": 3
      }
    },
    {
      "toolName": "calculator",
      "args": {
        "operation": "multiply",
        "a": 4,
        "b": 2
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "toolName": "calculator",
        "success": true,
        "data": {
          "result": 8,
          "executionTime": 45
        }
      },
      {
        "toolName": "calculator",
        "success": true,
        "data": {
          "result": 8,
          "executionTime": 42
        }
      }
    ],
    "totalExecutionTime": 45,
    "errors": []
  },
  "message": "Tools executed successfully"
}
```

### POST `/api/tools/execute-sequential`

Execute multiple tools sequentially.

**Request Body:**
```json
{
  "tools": [
    {
      "toolName": "api_call",
      "args": {
        "url": "https://api.example.com/users/1",
        "method": "GET"
      }
    },
    {
      "toolName": "json_reader",
      "args": {
        "jsonString": "{{previous_result}}",
        "path": "$.name"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "toolName": "api_call",
        "success": true,
        "data": {
          "status": 200,
          "data": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      },
      {
        "toolName": "json_reader",
        "success": true,
        "data": {
          "result": "John Doe",
          "path": "$.name"
        }
      }
    ],
    "totalExecutionTime": 1234,
    "errors": []
  },
  "message": "Tools executed sequentially successfully"
}
```

### POST `/api/tools/execute-with-llm`

Execute tool using LLM for parameter extraction.

**Request Body:**
```json
{
  "query": "Add 5 and 3",
  "toolName": "calculator",
  "options": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": 8,
    "executionTime": 1234,
    "toolName": "calculator",
    "extractedArgs": {
      "operation": "add",
      "a": 5,
      "b": 3
    },
    "llmUsage": {
      "promptTokens": 50,
      "completionTokens": 20,
      "totalTokens": 70
    }
  },
  "message": "Tool executed with LLM successfully"
}
```

### POST `/api/tools/mcp`

MCP-style execution based on natural language query.

**Request Body:**
```json
{
  "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1"
}
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
  "message": "MCP execution completed successfully"
}
```

## Utility Endpoints

### GET `/api/tools/stats`

Get execution statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExecutions": 150,
    "successfulExecutions": 142,
    "failedExecutions": 8,
    "averageExecutionTime": 1234,
    "totalTools": 5,
    "mostUsedTool": "calculator",
    "lastExecution": "2023-01-01T00:00:00.000Z"
  },
  "message": "Statistics retrieved successfully"
}
```

### GET `/api/tools/definitions`

Get tool definitions for LLM function calling.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "calculator",
      "description": "Perform basic arithmetic operations",
      "parameters": {
        "type": "object",
        "properties": {
          "operation": {
            "type": "string",
            "enum": ["add", "subtract", "multiply", "divide"],
            "description": "The arithmetic operation to perform"
          },
          "a": {
            "type": "number",
            "description": "First number"
          },
          "b": {
            "type": "number",
            "description": "Second number"
          }
        },
        "required": ["operation", "a", "b"]
      }
    }
  ],
  "message": "Tool definitions retrieved successfully"
}
```

## Error Handling

### Common Error Types

**Tool Not Found**
```json
{
  "success": false,
  "message": "Tool not found",
  "error": "Tool 'nonexistent' not found"
}
```

**Validation Error**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Invalid input data",
  "details": {
    "field": "operation",
    "message": "Operation must be one of: add, subtract, multiply, divide"
  }
}
```

**Execution Error**
```json
{
  "success": false,
  "message": "Tool execution failed",
  "error": "Division by zero",
  "details": {
    "toolName": "calculator",
    "args": {
      "operation": "divide",
      "a": 5,
      "b": 0
    }
  }
}
```

**Timeout Error**
```json
{
  "success": false,
  "message": "Tool execution timeout",
  "error": "Tool execution exceeded maximum timeout of 30000ms",
  "details": {
    "toolName": "api_call",
    "timeout": 30000
  }
}
```

## Rate Limiting

Rate limiting is not currently implemented but will be added in future versions.

## Examples

### Basic Tool Execution

```bash
# Execute calculator tool
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

### Parallel Tool Execution

```bash
# Execute multiple tools in parallel
curl -X POST http://localhost:3001/api/tools/execute-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [
      {
        "toolName": "calculator",
        "args": {
          "operation": "add",
          "a": 5,
          "b": 3
        }
      },
      {
        "toolName": "calculator",
        "args": {
          "operation": "multiply",
          "a": 4,
          "b": 2
        }
      }
    ]
  }'
```

### LLM-Powered Tool Execution

```bash
# Execute tool with LLM parameter extraction
curl -X POST http://localhost:3001/api/tools/execute-with-llm \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 15 multiplied by 7?",
    "toolName": "calculator",
    "options": {
      "model": "gpt-3.5-turbo",
      "temperature": 0.1
    }
  }'
```

### MCP-Style Execution

```bash
# Execute using natural language
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Get the weather for London and then extract the temperature"
  }'
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { ToolExecutionService } from '@clear-ai/shared';

const toolService = new ToolExecutionService();

// Execute a single tool
const result = await toolService.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});

// Execute multiple tools in parallel
const results = await toolService.executeToolsParallel([
  {
    toolName: 'calculator',
    args: { operation: 'add', a: 5, b: 3 }
  },
  {
    toolName: 'calculator',
    args: { operation: 'multiply', a: 4, b: 2 }
  }
]);

// Execute with LLM
const llmResult = await toolService.executeToolWithLLM(
  'What is 15 multiplied by 7?',
  'calculator',
  { model: 'gpt-3.5-turbo' }
);
```

### Python

```python
from clear_ai import ToolExecutionService

tool_service = ToolExecutionService()

# Execute a single tool
result = tool_service.execute_tool('calculator', {
    'operation': 'add',
    'a': 5,
    'b': 3
})

# Execute multiple tools in parallel
results = tool_service.execute_tools_parallel([
    {
        'toolName': 'calculator',
        'args': {'operation': 'add', 'a': 5, 'b': 3}
    },
    {
        'toolName': 'calculator',
        'args': {'operation': 'multiply', 'a': 4, 'b': 2}
    }
])

# Execute with LLM
llm_result = tool_service.execute_tool_with_llm(
    'What is 15 multiplied by 7?',
    'calculator',
    {'model': 'gpt-3.5-turbo'}
)
```

## Best Practices

### Tool Design

1. **Clear Naming**: Use descriptive, action-oriented names
2. **Comprehensive Descriptions**: Provide detailed descriptions for LLM understanding
3. **Input Validation**: Validate all inputs using Zod schemas
4. **Error Handling**: Provide meaningful error messages
5. **Performance**: Optimize for speed and efficiency

### Error Handling

1. **Graceful Degradation**: Handle errors without crashing
2. **Detailed Logging**: Log errors with context
3. **User-Friendly Messages**: Provide clear error messages
4. **Retry Logic**: Implement retry for transient failures

### Security

1. **Input Sanitization**: Sanitize all inputs
2. **Rate Limiting**: Implement rate limiting (future)
3. **Authentication**: Add authentication (future)
4. **Authorization**: Implement access control (future)

## Troubleshooting

### Common Issues

**Tool Not Found**
- Check tool name spelling
- Verify tool is registered
- Check tool registry

**Validation Errors**
- Verify input schema
- Check required fields
- Validate data types

**Execution Failures**
- Check tool implementation
- Verify external dependencies
- Review error logs

**Performance Issues**
- Monitor execution times
- Optimize tool code
- Consider caching

## Next Steps

1. **Explore Tool Creation**: Learn how to [build custom tools](/docs/tutorials/building-your-first-tool)
2. **Understand Workflows**: Check out [LangGraph workflows](/docs/features/langgraph-workflows)
3. **Learn MCP Integration**: Dive into [MCP tools](/docs/api/mcp/api-call)
4. **Build Applications**: Use the [Client APIs](/docs/api/client/services)
