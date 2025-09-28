# LangGraph APIs

The LangGraph APIs provide workflow orchestration capabilities using LangGraph for complex AI task execution.

## Endpoints

### POST /api/langgraph/execute

Execute a LangGraph workflow with natural language queries.

**Request Body:**
```json
{
  "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1",
  "options": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.1,
    "maxIterations": 10
  }
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
  "message": "Workflow executed successfully"
}
```

### POST /api/langgraph/execute-custom

Execute a custom LangGraph workflow with defined steps.

**Request Body:**
```json
{
  "workflow": {
    "name": "user-research",
    "steps": [
      {
        "id": "search",
        "type": "api_call",
        "config": {
          "url": "https://api.example.com/search",
          "method": "GET"
        }
      },
      {
        "id": "analyze",
        "type": "llm_call",
        "config": {
          "prompt": "Analyze the search results: {{search.result}}",
          "model": "gpt-3.5-turbo"
        }
      }
    ]
  },
  "inputs": {
    "query": "artificial intelligence trends"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "user-research-123",
    "status": "completed",
    "results": {
      "search": {
        "status": "completed",
        "result": { "articles": [...] }
      },
      "analyze": {
        "status": "completed",
        "result": "Analysis of AI trends..."
      }
    },
    "executionTime": 2500,
    "traceId": "trace-456"
  },
  "message": "Custom workflow executed successfully"
}
```

### GET /api/langgraph/workflows

List available predefined workflows.

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "api-research",
        "name": "API Research Workflow",
        "description": "Research APIs and analyze results",
        "steps": 3,
        "estimatedTime": "30s"
      },
      {
        "id": "data-analysis",
        "name": "Data Analysis Workflow",
        "description": "Analyze data using multiple tools",
        "steps": 5,
        "estimatedTime": "60s"
      }
    ]
  },
  "message": "Workflows retrieved successfully"
}
```

### GET /api/langgraph/workflows/:id

Get details about a specific workflow.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "api-research",
    "name": "API Research Workflow",
    "description": "Research APIs and analyze results",
    "steps": [
      {
        "id": "search",
        "name": "Search APIs",
        "type": "api_call",
        "description": "Search for relevant APIs"
      },
      {
        "id": "analyze",
        "name": "Analyze Results",
        "type": "llm_call",
        "description": "Analyze the search results"
      }
    ],
    "estimatedTime": "30s",
    "requiredTools": ["api_call", "llm_call"]
  },
  "message": "Workflow details retrieved successfully"
}
```

## Workflow Configuration

### Step Types

#### API Call Step
```json
{
  "id": "api_call_step",
  "type": "api_call",
  "config": {
    "url": "https://api.example.com/endpoint",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{token}}"
    },
    "params": {
      "query": "{{input.query}}"
    }
  }
}
```

#### LLM Call Step
```json
{
  "id": "llm_step",
  "type": "llm_call",
  "config": {
    "prompt": "Analyze this data: {{previous_step.result}}",
    "model": "gpt-3.5-turbo",
    "temperature": 0.1,
    "maxTokens": 1000
  }
}
```

#### Tool Execution Step
```json
{
  "id": "tool_step",
  "type": "tool_execution",
  "config": {
    "toolName": "calculator",
    "args": {
      "operation": "add",
      "a": "{{input.number1}}",
      "b": "{{input.number2}}"
    }
  }
}
```

## Error Handling

### Workflow Execution Errors
```json
{
  "success": false,
  "message": "Workflow execution failed",
  "error": "Step 'api_call' failed: Connection timeout",
  "details": {
    "workflowId": "user-research-123",
    "failedStep": "api_call",
    "stepNumber": 1,
    "executionTime": 5000,
    "traceId": "trace-789"
  }
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Workflow validation failed",
  "error": "Invalid step configuration",
  "details": {
    "step": "api_call",
    "field": "url",
    "message": "URL is required"
  }
}
```

## Usage Examples

### Basic Workflow Execution
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Get weather for London and analyze the data",
    "options": {
      "model": "gpt-3.5-turbo",
      "temperature": 0.1
    }
  }'
```

### Custom Workflow Execution
```bash
curl -X POST http://localhost:3001/api/langgraph/execute-custom \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "name": "weather-analysis",
      "steps": [
        {
          "id": "get_weather",
          "type": "api_call",
          "config": {
            "url": "https://api.openweathermap.org/data/2.5/weather",
            "params": {
              "q": "London",
              "appid": "{{api_key}}"
            }
          }
        }
      ]
    },
    "inputs": {
      "api_key": "your-api-key"
    }
  }'
```

### JavaScript/TypeScript
```typescript
import { ClearAIClient } from 'clear-ai';

const client = new ClearAIClient({
  baseURL: 'http://localhost:3001'
});

// Execute a simple workflow
const result = await client.langgraph.execute({
  query: "Research AI trends and summarize findings",
  options: {
    model: "gpt-3.5-turbo",
    temperature: 0.1
  }
});

// Execute a custom workflow
const customResult = await client.langgraph.executeCustom({
  workflow: {
    name: "data-analysis",
    steps: [
      {
        id: "fetch_data",
        type: "api_call",
        config: {
          url: "https://api.example.com/data",
          method: "GET"
        }
      }
    ]
  },
  inputs: {
    query: "analyze this data"
  }
});
```

## Best Practices

1. **Keep workflows simple**: Break complex tasks into smaller, manageable steps
2. **Use error handling**: Implement proper error handling for each step
3. **Monitor execution time**: Set reasonable timeouts for long-running workflows
4. **Validate inputs**: Always validate input data before processing
5. **Use trace IDs**: Include trace IDs for debugging and monitoring
