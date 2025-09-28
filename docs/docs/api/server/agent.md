# Agent API Reference

The Agent API is the **unified interface** that combines memory management, tool execution, and conversational AI into a single intelligent system. Think of it as the "brain" of Clear-AI that can understand what you want and execute the right actions.

## 🧠 What is the Agent System?

The Agent System is like having a smart assistant that can:
- **Remember** previous conversations (using memory)
- **Execute tools** when you need calculations or data
- **Have conversations** naturally
- **Combine** memory and tools for complex tasks

Instead of calling separate APIs for memory, tools, or chat, you just send your request to the agent and it figures out what to do!

## 🚀 Quick Start

```bash
# Basic conversation
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Hello, how are you?",
    "options": {
      "userId": "user123",
      "sessionId": "session456"
    }
  }'

# Tool execution
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 15 + 27?",
    "options": {
      "userId": "user123",
      "sessionId": "session456"
    }
  }'

# Memory + conversation
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Remember that I like Python programming",
    "options": {
      "userId": "user123",
      "sessionId": "session456",
      "includeMemoryContext": true
    }
  }'
```

## 📋 API Endpoints

### Initialize Agent Service

**POST** `/api/agent/initialize`

Initializes the agent service with all required dependencies.

**Request Body:**
```json
{
  "memoryConfig": {
    "neo4j": {
      "uri": "bolt://localhost:7687",
      "username": "neo4j",
      "password": "password"
    },
    "pinecone": {
      "apiKey": "your-pinecone-key",
      "environment": "your-environment",
      "indexName": "clear-ai-memories"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "capabilities": [
      "conversation",
      "tool_execution", 
      "memory_management",
      "intent_classification"
    ]
  },
  "message": "Agent service initialized successfully"
}
```

### Execute Query

**POST** `/api/agent/execute`

The main endpoint for interacting with the agent. Send any query and the agent will figure out what to do.

**Request Body:**
```json
{
  "query": "Your question or request",
  "options": {
    "userId": "string (required)",
    "sessionId": "string (required)",
    "includeMemoryContext": "boolean (default: true)",
    "maxMemoryResults": "number (default: 10)",
    "model": "string (default: 'openai')",
    "temperature": "number (default: 0.7)",
    "includeReasoning": "boolean (default: true)",
    "previousIntents": "array (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "response": "The agent's response",
    "intent": {
      "type": "conversation|tool_execution|memory_chat|hybrid|knowledge_search",
      "confidence": 0.9,
      "requiredTools": [],
      "memoryContext": true,
      "reasoning": "Why this intent was chosen"
    },
    "memoryContext": {
      "userId": "user123",
      "sessionId": "session456",
      "episodicMemories": [...],
      "semanticMemories": [...],
      "contextWindow": {
        "startTime": "2025-01-01T00:00:00Z",
        "endTime": "2025-01-01T00:05:00Z",
        "relevanceScore": 0.85
      }
    },
    "toolResults": [...],
    "reasoning": "Detailed reasoning for the response",
    "metadata": {
      "executionTime": 1500,
      "memoryRetrieved": 5,
      "toolsExecuted": 1,
      "confidence": 0.9
    }
  },
  "message": "Query executed successfully (conversation)"
}
```

### Get Agent Status

**GET** `/api/agent/status`

Get the current status and capabilities of the agent service.

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "capabilities": [
      "conversation",
      "tool_execution",
      "memory_management", 
      "intent_classification"
    ],
    "memoryService": {
      "neo4j": "connected",
      "pinecone": "connected"
    },
    "toolRegistry": {
      "totalTools": 15,
      "availableTools": ["calculator", "api_call", "file_read", ...]
    },
    "llmService": {
      "providers": ["openai", "ollama", "mistral", "groq"],
      "currentModel": "gpt-3.5-turbo"
    }
  }
}
```

### Test Agent

**POST** `/api/agent/test`

Run comprehensive tests to validate agent functionality.

**Response:**
```json
{
  "success": true,
  "data": {
    "testResults": [
      {
        "query": "Hello, how are you?",
        "description": "Simple conversation",
        "expectedIntent": "conversation",
        "actualIntent": "conversation",
        "confidence": 0.9,
        "success": true,
        "response": "Hello! I'm doing well, thank you for asking.",
        "reasoning": "Intent: conversation (confidence: 0.9)",
        "metadata": {
          "executionTime": 1200,
          "memoryRetrieved": 0,
          "toolsExecuted": 0,
          "confidence": 0.9
        }
      }
    ],
    "summary": {
      "totalTests": 5,
      "successfulExecutions": 5,
      "accuracy": 1.0,
      "averageConfidence": 0.96
    }
  },
  "message": "Agent test completed with 100% accuracy"
}
```

## 🎯 Intent Types

The agent automatically classifies your query into one of these intent types:

### 1. **Conversation** (`conversation`)
- **When**: General chat, greetings, casual questions
- **Example**: "Hello, how are you?", "Tell me a joke"
- **What happens**: Direct response from the LLM

### 2. **Tool Execution** (`tool_execution`)
- **When**: Requests that need calculations or data processing
- **Example**: "What is 15 + 27?", "Get the weather in London"
- **What happens**: Executes appropriate tools and returns results

### 3. **Memory Chat** (`memory_chat`)
- **When**: Questions about past conversations or personal info
- **Example**: "What did we discuss yesterday?", "Remember that I like Python"
- **What happens**: Searches memory and provides context-aware responses

### 4. **Hybrid** (`hybrid`)
- **When**: Complex requests that need both memory and tools
- **Example**: "Based on what you know about me, help me calculate compound interest"
- **What happens**: Combines memory context with tool execution

### 5. **Knowledge Search** (`knowledge_search`)
- **When**: Questions about general knowledge or facts
- **Example**: "What is machine learning?", "Explain quantum computing"
- **What happens**: Searches semantic memory for relevant information

## ⚙️ Configuration Options

### Memory Context Options

```json
{
  "includeMemoryContext": true,        // Include relevant memories
  "maxMemoryResults": 10,              // Max memories to retrieve
  "memoryThreshold": 0.7               // Relevance threshold
}
```

### Model Options

```json
{
  "model": "openai",                   // LLM provider
  "temperature": 0.7,                  // Creativity level (0-1)
  "maxTokens": 1000,                   // Max response length
  "topP": 0.9                         // Nucleus sampling
}
```

### Tool Options

```json
{
  "includeReasoning": true,            // Show reasoning process
  "toolTimeout": 30000,                // Tool execution timeout (ms)
  "maxToolRetries": 3                  // Max retries for failed tools
}
```

## 🔧 Advanced Usage

### Custom Intent Classification

You can provide hints about the expected intent:

```json
{
  "query": "Calculate the area of a circle with radius 5",
  "options": {
    "previousIntents": ["tool_execution"],
    "hintIntent": "tool_execution"
  }
}
```

### Memory-Enhanced Tool Execution

```json
{
  "query": "Based on my previous calculations, what's the compound interest on $10,000?",
  "options": {
    "includeMemoryContext": true,
    "maxMemoryResults": 5,
    "memorySearchTerms": ["interest", "calculation", "financial"]
  }
}
```

### Multi-Session Context

```json
{
  "query": "Continue our discussion about machine learning",
  "options": {
    "userId": "user123",
    "sessionId": "new-session-456",
    "includeMemoryContext": true,
    "crossSessionMemory": true
  }
}
```

## 🚨 Error Handling

### Common Errors

**Invalid Query:**
```json
{
  "success": false,
  "error": "Missing or invalid query",
  "message": "Query is required and must be a string"
}
```

**Service Not Initialized:**
```json
{
  "success": false,
  "error": "Agent service not initialized",
  "message": "Please initialize the agent service first"
}
```

**Memory Service Error:**
```json
{
  "success": false,
  "error": "Memory service unavailable",
  "message": "Neo4j or Pinecone connection failed"
}
```

**Tool Execution Error:**
```json
{
  "success": false,
  "error": "Tool execution failed",
  "message": "Calculator tool returned an error",
  "details": {
    "toolName": "calculator",
    "error": "Division by zero"
  }
}
```

## 📊 Performance Metrics

The agent provides detailed performance metrics:

```json
{
  "metadata": {
    "executionTime": 1500,           // Total execution time (ms)
    "memoryRetrieved": 5,            // Number of memories retrieved
    "toolsExecuted": 1,              // Number of tools executed
    "confidence": 0.9,               // Overall confidence score
    "intentClassificationTime": 200, // Intent classification time (ms)
    "memorySearchTime": 300,         // Memory search time (ms)
    "toolExecutionTime": 800,        // Tool execution time (ms)
    "llmResponseTime": 200           // LLM response time (ms)
  }
}
```

## 🧪 Testing

### Test Individual Components

```bash
# Test conversation
curl -X POST http://localhost:3001/api/agent/execute \
  -d '{"query": "Hello", "options": {"userId": "test", "sessionId": "test"}}'

# Test tool execution
curl -X POST http://localhost:3001/api/agent/execute \
  -d '{"query": "What is 2+2?", "options": {"userId": "test", "sessionId": "test"}}'

# Test memory
curl -X POST http://localhost:3001/api/agent/execute \
  -d '{"query": "Remember I like Python", "options": {"userId": "test", "sessionId": "test"}}'
```

### Run Full Test Suite

```bash
# Run comprehensive tests
curl -X POST http://localhost:3001/api/agent/test
```

## 🔗 Integration Examples

### JavaScript/TypeScript

```typescript
class ClearAIAgent {
  constructor(private baseURL: string) {}

  async executeQuery(query: string, options: AgentOptions) {
    const response = await fetch(`${this.baseURL}/api/agent/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, options })
    });
    return response.json();
  }

  async chat(message: string, userId: string, sessionId: string) {
    return this.executeQuery(message, {
      userId,
      sessionId,
      includeMemoryContext: true,
      includeReasoning: true
    });
  }
}

// Usage
const agent = new ClearAIAgent('http://localhost:3001');

// Simple chat
const response = await agent.chat('Hello!', 'user123', 'session456');

// Tool execution
const calc = await agent.executeQuery('What is 15 * 27?', {
  userId: 'user123',
  sessionId: 'session456'
});

// Memory-enhanced conversation
const memory = await agent.executeQuery('What do you know about me?', {
  userId: 'user123',
  sessionId: 'session456',
  includeMemoryContext: true
});
```

### Python

```python
import requests

class ClearAIAgent:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def execute_query(self, query: str, options: dict):
        response = requests.post(
            f"{self.base_url}/api/agent/execute",
            json={"query": query, "options": options}
        )
        return response.json()
    
    def chat(self, message: str, user_id: str, session_id: str):
        return self.execute_query(message, {
            "userId": user_id,
            "sessionId": session_id,
            "includeMemoryContext": True,
            "includeReasoning": True
        })

# Usage
agent = ClearAIAgent("http://localhost:3001")

# Simple chat
response = agent.chat("Hello!", "user123", "session456")

# Tool execution
calc = agent.execute_query("What is 15 * 27?", {
    "userId": "user123",
    "sessionId": "session456"
})
```

## 🎯 Best Practices

### 1. **Use Consistent User IDs**
```json
{
  "userId": "user-12345",  // Keep this consistent
  "sessionId": "session-67890"  // Can change per conversation
}
```

### 2. **Enable Memory Context for Conversations**
```json
{
  "includeMemoryContext": true,  // Always enable for better responses
  "maxMemoryResults": 10         // Adjust based on your needs
}
```

### 3. **Use Appropriate Models**
```json
{
  "model": "gpt-3.5-turbo",  // Good for most tasks
  "temperature": 0.7,         // Balanced creativity
  "includeReasoning": true    // Helpful for debugging
}
```

### 4. **Handle Errors Gracefully**
```typescript
try {
  const response = await agent.executeQuery(query, options);
  if (response.success) {
    console.log(response.data.response);
  } else {
    console.error('Agent error:', response.error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## 🚀 Next Steps

1. **Start Simple**: Begin with basic conversation queries
2. **Add Memory**: Enable memory context for better responses  
3. **Use Tools**: Try tool execution for calculations and data
4. **Combine Features**: Use hybrid intents for complex tasks
5. **Monitor Performance**: Check execution times and confidence scores

The Agent API is designed to be your one-stop interface for all AI interactions. Just send your query and let the agent figure out the rest! 🎉
