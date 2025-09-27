# Tool Execution API

A simple tool execution service based on SimpleLangChainService that allows you to register and execute tools with full tracing support.

## Features

- **Tool Registration**: Register custom tools with parameter definitions
- **Tool Execution**: Execute tools with arguments and get results
- **Parallel Execution**: Execute multiple tools simultaneously
- **Sequential Execution**: Execute tools one after another
- **LLM Integration**: Use LLM to extract parameters from natural language
- **Tracing**: Full Langfuse tracing support for all executions
- **Error Handling**: Comprehensive error handling and validation

## API Endpoints

### Tools Management

- `GET /api/tools` - Get all registered tools
- `GET /api/tools/:toolName` - Get a specific tool
- `POST /api/tools/register` - Register a new tool
- `DELETE /api/tools/:toolName` - Remove a tool
- `POST /api/tools/clear` - Clear all tools

### Tool Execution

- `POST /api/tools/execute` - Execute a single tool
- `POST /api/tools/execute-multiple` - Execute multiple tools in parallel
- `POST /api/tools/execute-sequential` - Execute multiple tools sequentially
- `POST /api/tools/execute-with-llm` - Execute tool using LLM for parameter extraction
- `POST /api/tools/mcp` - **MCP-style execution** - Execute tool based on natural language query

### Utilities

- `GET /api/tools/stats` - Get execution statistics
- `GET /api/tools/definitions` - Get tool definitions for LLM function calling

## Sample Tools

The API comes with sample tools pre-registered, including an automatic "unknown" fallback tool:

### 1. Calculator
Performs basic arithmetic operations.

**Parameters:**
- `operation` (string, required): Operation to perform (add, subtract, multiply, divide)
- `a` (number, required): First number
- `b` (number, required): Second number

**Example:**
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

### 2. Greet
Generates personalized greeting messages.

**Parameters:**
- `name` (string, required): Name of the person to greet
- `language` (string, optional): Language for greeting (en, es, fr, de)

**Example:**
```json
{
  "toolName": "greet",
  "args": {
    "name": "Alice",
    "language": "en"
  }
}
```

### 3. Weather
Returns mock weather information for a location.

**Parameters:**
- `location` (string, required): City or location name
- `unit` (string, optional): Temperature unit (celsius, fahrenheit)

**Example:**
```json
{
  "toolName": "weather",
  "args": {
    "location": "New York",
    "unit": "celsius"
  }
}
```

### 4. Unknown (Fallback Tool)
Automatically used when the LLM cannot determine which specific tool matches the user's query.

**Parameters:**
- `query` (string, required): The original user query that could not be processed
- `reason` (string, optional): Reason why no specific tool could be matched

**Example Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "result": {
      "message": "I couldn't determine how to help with your query: \"How do I make coffee?\"",
      "reason": "No specific tool matched your request",
      "suggestion": "Please try rephrasing your request or ask for help with a specific task like calculations, greetings, or weather information.",
      "availableTools": ["calculator", "greet", "weather"]
    },
    "toolName": "unknown",
    "reasoning": "No specific tool could handle this query"
  }
}
```

## Testing

Run the test script to verify the API is working:

```bash
# Start the server first
npm run dev

# In another terminal, run the test script
node test-tools.js
```

## Usage Examples

### Execute a Single Tool

```bash
curl -X POST http://localhost:3001/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "calculator",
    "args": {
      "operation": "multiply",
      "a": 4,
      "b": 7
    }
  }'
```

### Execute Multiple Tools in Parallel

```bash
curl -X POST http://localhost:3001/api/tools/execute-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "toolExecutions": [
      {
        "toolName": "calculator",
        "args": { "operation": "add", "a": 2, "b": 3 }
      },
      {
        "toolName": "greet",
        "args": { "name": "Bob", "language": "es" }
      }
    ]
  }'
```

### Execute Tool with LLM Parameter Extraction

```bash
curl -X POST http://localhost:3001/api/tools/execute-with-llm \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "calculator",
    "userQuery": "What is 15 multiplied by 8?"
  }'
```

### MCP-Style Execution (Recommended)

The simplest way to use the API - just provide a natural language query and let the system figure out which tool to use:

```bash
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "What is 15 multiplied by 8?"
  }'
```

```bash
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Greet Alice in Spanish"
  }'
```

```bash
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "What's the weather like in Tokyo?"
  }'
```

### Incomplete Query Examples

The system will ask for more information when queries are incomplete:

```bash
# Incomplete math query
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Calculate something"
  }'
# Response: Asks for operation and numbers

# Incomplete greeting query  
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Greet someone"
  }'
# Response: Asks for name and optionally language

# Incomplete weather query
curl -X POST http://localhost:3001/api/tools/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "What's the weather?"
  }'
# Response: Asks for location
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    "success": true,
    "result": "actual_result_here",
    "toolName": "tool_name",
    "executionTime": 123,
    "traceId": "optional_trace_id",
    "reasoning": "Why this tool was chosen (MCP-style only)"
  },
  "message": "Success message"
}
```

### MCP-Style Response

For MCP-style execution, the response includes additional reasoning and validation:

**Successful execution:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "result": 120,
    "toolName": "calculator",
    "executionTime": 1500,
    "traceId": "trace_123",
    "reasoning": "User asked for multiplication, calculator tool can handle this with operation 'multiply'"
  },
  "message": "MCP execution successful"
}
```

**Incomplete query (needs more information):**
```json
{
  "success": true,
  "data": {
    "success": false,
    "error": "Incomplete query - missing required information",
    "toolName": "calculator",
    "reasoning": "User wants to do math but didn't specify the operation or numbers",
    "needsMoreInfo": true,
    "missingInfo": ["operation", "first number", "second number"],
    "followUpQuestion": "What math operation would you like to perform and what numbers should I use?",
    "executionTime": 800,
    "traceId": "trace_456"
  },
  "message": "Query incomplete - more information needed"
}
```

## Error Handling

The API provides detailed error messages for common issues:

- **Tool not found**: When trying to execute a non-existent tool
- **Missing parameters**: When required parameters are not provided
- **Invalid parameters**: When parameter types don't match the schema
- **Execution timeout**: When tool execution takes too long
- **Tool execution error**: When the tool itself throws an error

## Integration with Langfuse

All tool executions are automatically traced in Langfuse with:
- Input parameters
- Execution results
- Performance metrics
- Error details
- User and session information

## Custom Tool Development

To create a custom tool, define it with the `ToolDefinition` interface:

```typescript
const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Description of what the tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of param1'
      },
      param2: {
        type: 'number',
        description: 'Description of param2'
      }
    },
    required: ['param1']
  },
  execute: async (args: Record<string, any>) => {
    // Your tool logic here
    return { result: 'success' }
  }
}
```

Then register it via the API or directly in the controller.
