# Intent Classifier API Reference

The Intent Classifier is the **smart routing system** that analyzes user queries and determines the best execution path. Think of it as the "traffic controller" that decides whether your request needs memory, tools, conversation, or a combination of all three.

## 🧠 What is Intent Classification?

Intent Classification automatically analyzes your query and determines:
- **What type of request** it is (conversation, tool execution, memory, etc.)
- **How confident** the classification is
- **What tools** might be needed
- **Whether memory context** would be helpful

This happens **automatically** - you just send your query and the system figures out what to do!

## 🎯 Why Do We Need This?

### The Problem
Without intent classification, you'd need to:
- Manually decide which API to call
- Know whether to include memory context
- Figure out which tools to use
- Handle different response formats

### The Solution
With intent classification:
- **One API call** handles everything
- **Automatic routing** to the right execution path
- **Smart context** inclusion based on query type
- **Consistent responses** across all interaction types

## 🚀 Quick Start

```bash
# Classify a conversation query
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Hello, how are you?",
    "options": {
      "userId": "user123",
      "sessionId": "session456"
    }
  }'

# Classify a tool execution query
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 15 + 27?",
    "options": {
      "userId": "user123",
      "sessionId": "session456"
    }
  }'

# Classify a memory query
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What did we discuss yesterday?",
    "options": {
      "userId": "user123",
      "sessionId": "session456"
    }
  }'
```

## 📋 API Endpoints

### Initialize Intent Classifier

**POST** `/api/intent-classifier/initialize`

Initializes the intent classifier service with LLM and tool registry.

**Request Body:**
```json
{
  "langchainConfig": {
    "openaiApiKey": "your-openai-key",
    "openaiModel": "gpt-3.5-turbo",
    "ollamaBaseUrl": "http://localhost:11434"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "availableIntentTypes": [
      "conversation",
      "tool_execution", 
      "memory_chat",
      "hybrid",
      "knowledge_search"
    ],
    "intentTypeDescriptions": {
      "conversation": "General conversation and casual chat",
      "tool_execution": "Requests requiring calculations or data processing",
      "memory_chat": "Questions about past conversations or personal information",
      "hybrid": "Complex requests combining memory and tools",
      "knowledge_search": "Questions about general knowledge or facts"
    }
  },
  "message": "Intent classifier service initialized successfully"
}
```

### Classify Single Query

**POST** `/api/intent-classifier/classify`

Classifies a single query to determine its intent and execution requirements.

**Request Body:**
```json
{
  "query": "Your question or request",
  "options": {
    "userId": "string (required)",
    "sessionId": "string (required)",
    "includeReasoning": "boolean (default: true)",
    "previousIntents": "array (optional)",
    "context": "object (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intent": {
      "type": "conversation|tool_execution|memory_chat|hybrid|knowledge_search",
      "confidence": 0.95,
      "requiredTools": ["calculator"],
      "memoryContext": true,
      "reasoning": "The query is asking for a mathematical calculation, indicating tool_execution intent"
    },
    "executionPlan": {
      "steps": [
        "Execute calculator tool",
        "Format result for user"
      ],
      "estimatedTime": 500,
      "complexity": "low"
    },
    "metadata": {
      "classificationTime": 150,
      "modelUsed": "gpt-3.5-turbo",
      "confidence": 0.95
    }
  },
  "message": "Query classified successfully"
}
```

### Classify Multiple Queries

**POST** `/api/intent-classifier/classify-batch`

Classifies multiple queries in a single request for better performance.

**Request Body:**
```json
{
  "queries": [
    {
      "id": "query1",
      "query": "Hello, how are you?",
      "options": {
        "userId": "user123",
        "sessionId": "session456"
      }
    },
    {
      "id": "query2", 
      "query": "What is 15 + 27?",
      "options": {
        "userId": "user123",
        "sessionId": "session456"
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
        "id": "query1",
        "intent": {
          "type": "conversation",
          "confidence": 0.9,
          "requiredTools": [],
          "memoryContext": false,
          "reasoning": "Casual greeting indicating conversation intent"
        }
      },
      {
        "id": "query2",
        "intent": {
          "type": "tool_execution",
          "confidence": 0.95,
          "requiredTools": ["calculator"],
          "memoryContext": false,
          "reasoning": "Mathematical calculation requiring tool execution"
        }
      }
    ],
    "summary": {
      "totalQueries": 2,
      "averageConfidence": 0.925,
      "intentDistribution": {
        "conversation": 1,
        "tool_execution": 1,
        "memory_chat": 0,
        "hybrid": 0,
        "knowledge_search": 0
      }
    }
  },
  "message": "Batch classification completed successfully"
}
```

### Get Available Intent Types

**GET** `/api/intent-classifier/intent-types`

Get a list of all available intent types and their descriptions.

**Response:**
```json
{
  "success": true,
  "data": {
    "intentTypes": [
      {
        "type": "conversation",
        "description": "General conversation and casual chat",
        "examples": [
          "Hello, how are you?",
          "Tell me a joke",
          "What's the weather like?"
        ],
        "characteristics": [
          "Casual language",
          "No specific action required",
          "Social interaction"
        ]
      },
      {
        "type": "tool_execution",
        "description": "Requests requiring calculations or data processing",
        "examples": [
          "What is 15 + 27?",
          "Calculate the area of a circle",
          "Get the current time"
        ],
        "characteristics": [
          "Specific action required",
          "Data processing needed",
          "Tool execution necessary"
        ]
      }
    ]
  }
}
```

### Get Classification Statistics

**GET** `/api/intent-classifier/stats`

Get statistics about classification performance and usage.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClassifications": 1250,
    "averageConfidence": 0.89,
    "intentDistribution": {
      "conversation": 450,
      "tool_execution": 300,
      "memory_chat": 250,
      "hybrid": 150,
      "knowledge_search": 100
    },
    "performance": {
      "averageClassificationTime": 180,
      "successRate": 0.98,
      "errorRate": 0.02
    },
    "recentActivity": {
      "lastHour": 25,
      "lastDay": 300,
      "lastWeek": 1250
    }
  }
}
```

## 🎯 Intent Types Explained

### 1. **Conversation** (`conversation`)

**When it's used:**
- Casual greetings and small talk
- General questions without specific actions
- Social interactions

**Examples:**
- "Hello, how are you?"
- "Tell me a joke"
- "What's your favorite color?"
- "Good morning!"

**Characteristics:**
- No specific action required
- Casual, conversational language
- Social interaction focus

**Confidence indicators:**
- Greeting words (hello, hi, hey)
- Casual language
- No specific requests

### 2. **Tool Execution** (`tool_execution`)

**When it's used:**
- Mathematical calculations
- Data processing requests
- Specific actions that need tools

**Examples:**
- "What is 15 + 27?"
- "Calculate the area of a circle with radius 5"
- "Get the current time"
- "Convert 100 USD to EUR"

**Characteristics:**
- Specific action required
- Data processing needed
- Tool execution necessary

**Confidence indicators:**
- Mathematical operations (+, -, *, /)
- Specific calculations
- Data conversion requests

### 3. **Memory Chat** (`memory_chat`)

**When it's used:**
- Questions about past conversations
- Personal information requests
- Memory-related queries

**Examples:**
- "What did we discuss yesterday?"
- "Remember that I like Python"
- "What do you know about me?"
- "Tell me about our previous conversation"

**Characteristics:**
- References to past interactions
- Personal information
- Memory retrieval needed

**Confidence indicators:**
- Past tense references (discussed, talked about)
- Personal pronouns (I, we, our)
- Memory-related keywords (remember, recall, know about)

### 4. **Hybrid** (`hybrid`)

**When it's used:**
- Complex requests combining memory and tools
- Context-dependent calculations
- Multi-step processes

**Examples:**
- "Based on what you know about me, help me calculate compound interest"
- "Using my previous calculations, what's the total cost?"
- "Remember I like Python, then find me a tutorial"

**Characteristics:**
- Combines memory and tools
- Context-dependent
- Multi-step process

**Confidence indicators:**
- References to previous context
- Complex requests
- Multiple action types

### 5. **Knowledge Search** (`knowledge_search`)

**When it's used:**
- Questions about general knowledge
- Factual information requests
- Educational queries

**Examples:**
- "What is machine learning?"
- "Explain quantum computing"
- "How does photosynthesis work?"
- "What is the capital of France?"

**Characteristics:**
- Factual information requests
- Educational content
- General knowledge

**Confidence indicators:**
- Question words (what, how, why, when)
- Factual information requests
- Educational content

## ⚙️ Configuration Options

### Classification Options

```json
{
  "includeReasoning": true,           // Include reasoning in response
  "confidenceThreshold": 0.7,         // Minimum confidence for classification
  "maxRetries": 3,                    // Max retries for failed classifications
  "timeout": 5000                     // Classification timeout (ms)
}
```

### Context Options

```json
{
  "previousIntents": ["conversation"], // Previous intent history
  "context": {                        // Additional context
    "userPreferences": ["Python", "AI"],
    "sessionType": "technical_support"
  },
  "hintIntent": "tool_execution"      // Hint for expected intent
}
```

### Model Options

```json
{
  "model": "gpt-3.5-turbo",          // LLM model for classification
  "temperature": 0.1,                 // Low temperature for consistency
  "maxTokens": 200,                   // Max tokens for classification
  "topP": 0.9                        // Nucleus sampling
}
```

## 🔧 Advanced Usage

### Custom Intent Hints

Provide hints about expected intent:

```json
{
  "query": "Calculate the area of a circle",
  "options": {
    "hintIntent": "tool_execution",
    "context": {
      "expectedTools": ["calculator"],
      "complexity": "medium"
    }
  }
}
```

### Context-Aware Classification

Include context for better classification:

```json
{
  "query": "What's the result?",
  "options": {
    "context": {
      "previousQuery": "Calculate 15 + 27",
      "sessionType": "mathematical",
      "userLevel": "beginner"
    }
  }
}
```

### Batch Processing

Classify multiple queries efficiently:

```json
{
  "queries": [
    {"id": "1", "query": "Hello", "options": {...}},
    {"id": "2", "query": "What is 2+2?", "options": {...}},
    {"id": "3", "query": "Remember I like Python", "options": {...}}
  ],
  "options": {
    "parallel": true,
    "maxConcurrency": 5
  }
}
```

## 🚨 Error Handling

### Common Errors

**Invalid Query:**
```json
{
  "success": false,
  "error": "Invalid query format",
  "message": "Query must be a non-empty string"
}
```

**Service Not Initialized:**
```json
{
  "success": false,
  "error": "Intent classifier not initialized",
  "message": "Please initialize the service first"
}
```

**Classification Failed:**
```json
{
  "success": false,
  "error": "Classification failed",
  "message": "Unable to classify query after 3 attempts",
  "details": {
    "query": "Unclear request",
    "attempts": 3,
    "lastError": "Low confidence score"
  }
}
```

**Timeout Error:**
```json
{
  "success": false,
  "error": "Classification timeout",
  "message": "Classification took longer than 5000ms",
  "details": {
    "timeout": 5000,
    "actualTime": 5200
  }
}
```

## 📊 Performance Metrics

### Classification Metrics

```json
{
  "metadata": {
    "classificationTime": 150,        // Time to classify (ms)
    "confidence": 0.95,               // Classification confidence
    "modelUsed": "gpt-3.5-turbo",    // Model used for classification
    "tokensUsed": 45,                 // Tokens consumed
    "retries": 0                      // Number of retries needed
  }
}
```

### Batch Processing Metrics

```json
{
  "summary": {
    "totalQueries": 10,              // Total queries processed
    "successfulClassifications": 9,   // Successful classifications
    "failedClassifications": 1,       // Failed classifications
    "averageConfidence": 0.89,        // Average confidence score
    "totalTime": 1200,                // Total processing time (ms)
    "averageTime": 120                // Average time per query (ms)
  }
}
```

## 🧪 Testing

### Test Individual Classifications

```bash
# Test conversation classification
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -d '{"query": "Hello", "options": {"userId": "test", "sessionId": "test"}}'

# Test tool execution classification
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -d '{"query": "What is 2+2?", "options": {"userId": "test", "sessionId": "test"}}'

# Test memory classification
curl -X POST http://localhost:3001/api/intent-classifier/classify \
  -d '{"query": "Remember I like Python", "options": {"userId": "test", "sessionId": "test"}}'
```

### Test Batch Classification

```bash
curl -X POST http://localhost:3001/api/intent-classifier/classify-batch \
  -d '{
    "queries": [
      {"id": "1", "query": "Hello", "options": {"userId": "test", "sessionId": "test"}},
      {"id": "2", "query": "What is 2+2?", "options": {"userId": "test", "sessionId": "test"}}
    ]
  }'
```

## 🔗 Integration Examples

### JavaScript/TypeScript

```typescript
class IntentClassifier {
  constructor(private baseURL: string) {}

  async classifyQuery(query: string, options: ClassificationOptions) {
    const response = await fetch(`${this.baseURL}/api/intent-classifier/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, options })
    });
    return response.json();
  }

  async classifyBatch(queries: Query[]) {
    const response = await fetch(`${this.baseURL}/api/intent-classifier/classify-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries })
    });
    return response.json();
  }
}

// Usage
const classifier = new IntentClassifier('http://localhost:3001');

// Classify single query
const result = await classifier.classifyQuery('Hello, how are you?', {
  userId: 'user123',
  sessionId: 'session456'
});

console.log(`Intent: ${result.data.intent.type}`);
console.log(`Confidence: ${result.data.intent.confidence}`);
```

### Python

```python
import requests

class IntentClassifier:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def classify_query(self, query: str, options: dict):
        response = requests.post(
            f"{self.base_url}/api/intent-classifier/classify",
            json={"query": query, "options": options}
        )
        return response.json()
    
    def classify_batch(self, queries: list):
        response = requests.post(
            f"{self.base_url}/api/intent-classifier/classify-batch",
            json={"queries": queries}
        )
        return response.json()

# Usage
classifier = IntentClassifier("http://localhost:3001")

# Classify single query
result = classifier.classify_query("Hello, how are you?", {
    "userId": "user123",
    "sessionId": "session456"
})

print(f"Intent: {result['data']['intent']['type']}")
print(f"Confidence: {result['data']['intent']['confidence']}")
```

## 🎯 Best Practices

### 1. **Use Consistent User Context**
```json
{
  "userId": "user-12345",    // Keep consistent
  "sessionId": "session-67890"  // Can change per session
}
```

### 2. **Include Previous Intent History**
```json
{
  "previousIntents": ["conversation", "tool_execution"],
  "context": {
    "sessionType": "technical_support",
    "userLevel": "intermediate"
  }
}
```

### 3. **Handle Low Confidence Results**
```typescript
const result = await classifier.classifyQuery(query, options);
if (result.data.intent.confidence < 0.7) {
  // Ask for clarification or use fallback
  console.log('Low confidence classification, asking for clarification');
}
```

### 4. **Use Batch Processing for Multiple Queries**
```typescript
// More efficient than individual calls
const results = await classifier.classifyBatch([
  { id: '1', query: 'Hello', options: {...} },
  { id: '2', query: 'What is 2+2?', options: {...} }
]);
```

## 🚀 Next Steps

1. **Start Simple**: Begin with basic classification queries
2. **Add Context**: Include user context for better accuracy
3. **Use Batch Processing**: Process multiple queries efficiently
4. **Monitor Performance**: Track confidence scores and accuracy
5. **Integrate with Agent**: Use classification results to route queries

The Intent Classifier is your smart routing system that makes the agent API work seamlessly. Just send your query and let it figure out the best execution path! 🎉
