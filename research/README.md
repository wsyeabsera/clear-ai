# LangGraph Implementation Research

## Overview

This document provides comprehensive research and testing results for the LangGraph implementation in the Clear-AI project. The implementation includes a workflow service that can execute tool chains using natural language queries, with support for sequential and parallel execution patterns.

## Architecture

### Components

1. **LangGraphController** (`packages/server/src/controllers/langGraphController.ts`)
   - Main controller handling workflow execution
   - Provides REST API endpoints for workflow management
   - Integrates with ToolExecutionService and SimpleWorkflowService

2. **LangGraphRoutes** (`packages/server/src/routes/langGraphRoutes.ts`)
   - Express routes for LangGraph functionality
   - Swagger documentation for all endpoints
   - Error handling and validation

3. **SimpleWorkflowService** (`packages/shared/src/workflows/SimpleWorkflowService.ts`)
   - Core workflow execution engine
   - Tool chaining and orchestration
   - Natural language query analysis

### Available Tools

The system includes 5 registered tools:

1. **unknown** - Fallback tool when query cannot be matched
2. **api_call** - Make HTTP API calls to external services
3. **json_reader** - Parse and read JSON data with optional path extraction
4. **file_reader** - Read files, list directories, or get file information
5. **execute_parallel** - Execute multiple MCP tools in parallel with error handling

### Supported Models

- **openai** - OpenAI GPT models
- **mistral-ollama** - Mistral via Ollama
- **ollama** - Local Ollama models
- **groq** - Groq inference API

## API Endpoints

### Base URL
```
http://localhost:3001/api/langgraph
```

### 1. Get Workflow Statistics
```bash
curl -X GET http://localhost:3001/api/langgraph/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availableTools": 5,
    "toolNames": ["unknown", "api_call", "json_reader", "file_reader", "execute_parallel"],
    "toolDescriptions": [
      {
        "name": "api_call",
        "description": "Make HTTP API calls to external services"
      },
      // ... other tools
    ],
    "langchainModels": ["openai", "mistral-ollama", "ollama", "groq"],
    "currentModel": "mistral-ollama"
  },
  "message": "Workflow statistics retrieved successfully"
}
```

### 2. Execute Custom Workflow
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1",
    "options": {
      "model": "ollama",
      "temperature": 0.1
    }
  }'
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "finalResult": {
      "workflow": "Make an API call to https://jsonplaceholder.typicode.com/users/1",
      "steps": ["api_call"],
      "results": {
        "api_call": {
          "success": true,
          "result": {
            "status": 200,
            "statusText": "OK",
            "data": {
              "id": 1,
              "name": "Leanne Graham",
              "username": "Bret",
              "email": "Sincere@april.biz"
              // ... full user data
            }
          },
          "toolName": "api_call",
          "executionTime": 67
        }
      },
      "success": true,
      "executionTime": 1440,
      "summary": "Executed 1 tools: api_call"
    },
    "allResults": { /* same as results above */ },
    "executionOrder": ["api_call"],
    "errors": [],
    "executionTime": 1441,
    "messages": [
      // LangChain message objects tracking conversation flow
    ]
  },
  "message": "Workflow executed successfully"
}
```

### 3. Test API Call Workflow
```bash
curl -X POST http://localhost:3001/api/langgraph/test/api-call \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jsonplaceholder.typicode.com/users/1"}'
```

### 4. Test Multi-Step Workflow
```bash
curl -X POST http://localhost:3001/api/langgraph/test/multi-step
```

**Description:** Executes a workflow that makes two sequential API calls:
1. Get user data from `https://jsonplaceholder.typicode.com/users/1`
2. Get user posts from `https://jsonplaceholder.typicode.com/posts?userId=1`

**Response includes:**
- Sequential execution of 2 API calls
- Execution order: `["api_call", "api_call"]`
- Total execution time: ~900ms

### 5. Test Parallel Workflow
```bash
curl -X POST http://localhost:3001/api/langgraph/test/parallel
```

**Description:** Executes parallel API calls to two different user endpoints.

**Response includes:**
- Parallel execution using `execute_parallel` tool
- Results from both API calls executed simultaneously
- Execution order: `["api_call", "execute_parallel"]`
- Total execution time: ~840ms

## Test Results Summary

### ✅ Successful Tests

1. **Health Check** - Server responds correctly
2. **Workflow Statistics** - Returns complete tool and model information
3. **Single API Call** - Successfully executes HTTP requests
4. **Multi-Step Workflow** - Sequential tool execution works
5. **Parallel Workflow** - Concurrent tool execution works

### ✅ Enhanced Success

1. **LLM-Based Tool Chaining** - Successfully implemented and tested dynamic argument extraction
   - **API Call + JSON Parsing**: ✅ Works perfectly - LLM extracts JSON data from API response for json_reader tool
   - **Multi-step Workflows**: ✅ LLM successfully passes data between tools in sequence
   - **Model Performance**: OpenAI (3-4s) vs Ollama (13s) - 3x faster with OpenAI
   - **Debug Logging**: Comprehensive logging shows LLM argument extraction in action
   - **Schema Validation**: Automatic type conversion and parameter validation

### Performance Metrics

- **Single API Call**: ~270-1440ms execution time
- **Multi-Step (2 calls)**: ~900ms execution time  
- **Parallel (2 calls)**: ~840ms execution time
- **LLM-Enhanced Chaining (Ollama)**: ~13 seconds (includes LLM processing time)
- **LLM-Enhanced Chaining (OpenAI)**: ~3-4 seconds (3x faster than Ollama)
- **API Response Size**: ~6-18KB depending on complexity

## Key Features

### 1. Natural Language Query Analysis
The system uses LLM to analyze user queries and determine tool execution order:
```
Query: "Make an API call to https://jsonplaceholder.typicode.com/users/1"
Analysis: Execute tools in order: api_call
```

### 2. Tool Registration and Discovery
- Automatic tool registration from MCP ToolRegistry
- Zod schema to JSON schema conversion
- Dynamic tool availability checking

### 3. Error Handling and Recovery
- Individual tool failure doesn't stop entire workflow
- Detailed error reporting in response
- Graceful degradation with partial results

### 4. Execution Tracking
- Complete execution order tracking
- Individual tool execution times
- Total workflow execution time
- LangChain message conversation flow

### 5. Parallel Execution Support
- Uses `execute_parallel` tool for concurrent operations
- Maintains execution order and results
- Error handling for parallel operations

### 6. LLM-Based Dynamic Argument Extraction ⭐ NEW
- **Intelligent Context Passing**: LLM automatically extracts arguments from previous tool results
- **Schema Validation**: Validates extracted arguments against tool parameter schemas
- **Fallback Mechanism**: Falls back to simple regex extraction if LLM fails
- **Type Conversion**: Automatically converts data types to match tool requirements
- **Debug Logging**: Comprehensive logging for troubleshooting and monitoring

**Example**: When an API call returns JSON data, the LLM automatically extracts the `jsonString` parameter for the `json_reader` tool, enabling seamless tool chaining.

## Current Limitations

1. **Complex Parameter Extraction**: LLM extraction works well for simple cases but may struggle with complex multi-step workflows
2. **Error Recovery**: No retry logic for failed tools
3. **Tool Dependencies**: No explicit dependency management between tools
4. **URL Construction**: LLM may not always construct complex URLs from previous results

## Recommendations for Improvement

### 1. Enhanced Context Passing
```typescript
// Implement automatic result passing between tools
private passContextToNextTool(previousResult: any, nextToolName: string): any {
  // Extract relevant data from previous result
  // Transform for next tool's expected parameters
  // Handle type conversions and validations
}
```

### 2. Improved Parameter Extraction
```typescript
// Better query analysis for tool parameters
private extractToolArgs(userQuery: string, toolName: string, previousResults?: any): Record<string, any> {
  // Use LLM to extract parameters from query
  // Include previous results in context
  // Handle dynamic parameter generation
}
```

### 3. Tool Dependency Management
```typescript
interface ToolDependency {
  toolName: string;
  dependsOn: string[];
  requiredParameters: string[];
}
```

### 4. Retry Logic
```typescript
private async executeWithRetry(toolName: string, args: any, maxRetries: number = 3): Promise<any> {
  // Implement exponential backoff
  // Handle different error types
  // Log retry attempts
}
```

## Usage Examples

### Example 1: Simple API Call
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "Get user data from https://jsonplaceholder.typicode.com/users/1"}'
```

### Example 2: Multi-Step Data Processing
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Get user 1 data and then get their posts",
    "options": {"model": "ollama", "temperature": 0.1}
  }'
```

### Example 3: Parallel Data Fetching
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Fetch data for users 1 and 2 in parallel"
  }'
```

### Example 4: LLM-Enhanced Tool Chaining ⭐ NEW
```bash
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1 and then parse the JSON response to extract the user name",
    "options": {
      "model": "openai",
      "temperature": 0.1
    }
  }'
```

**Result**: The LLM automatically extracts the JSON data from the API response and passes it to the `json_reader` tool, enabling seamless tool chaining without manual parameter extraction.

## Environment Setup

### Required Environment Variables
```bash
# LLM Configuration
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4
MISTRAL_API_KEY=your_mistral_key
MISTRAL_MODEL=mistral-large
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama3-8b-8192
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Langfuse (Optional)
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### Starting the Server
```bash
cd packages/server
npm run dev
```

The server will start on `http://localhost:3001` with hot reload enabled.

## Conclusion

The LangGraph implementation successfully provides:

1. **Natural Language Workflow Execution** - Users can describe workflows in plain English
2. **Tool Orchestration** - Automatic tool selection and execution ordering
3. **Parallel Execution** - Support for concurrent tool execution
4. **Comprehensive Monitoring** - Detailed execution tracking and error reporting
5. **Extensible Architecture** - Easy to add new tools and capabilities

The system is production-ready for basic workflow automation but would benefit from enhanced context passing and parameter extraction for more complex use cases.

---

**Tools Used**: curl, LangGraph Controller, SimpleWorkflowService, ToolExecutionService, MCP ToolRegistry
**Message**: LangGraph implementation research completed with comprehensive testing and documentation
