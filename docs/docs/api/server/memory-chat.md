# Memory Chat APIs

The Memory Chat APIs provide a conversational interface for interacting with the memory system, enabling memory-aware chat applications and intelligent context retrieval.

## Overview

The Memory Chat APIs combine the memory system with LangChain integration to provide:

- Memory-aware conversations
- Context enhancement with relevant memories
- Knowledge storage and retrieval
- Intelligent response generation

## Base URL

All memory chat APIs are available at:
```
http://localhost:3001/api/memory-chat
```

## Authentication

Currently, the memory chat APIs do not require authentication. This will be added in future versions.

## Chat APIs

### Initialize Memory Service

Initialize the memory service with LangChain integration.

**Endpoint:** `POST /api/memory-chat/initialize`

**Request Body:**
```json
{
  "config": {
    "neo4j": {
      "uri": "bolt://localhost:7687",
      "username": "neo4j",
      "password": "password",
      "database": "neo4j"
    },
    "pinecone": {
      "apiKey": "your_pinecone_api_key",
      "environment": "your_environment",
      "indexName": "clear-ai-memories"
    },
    "embedding": {
      "model": "nomic-embed-text",
      "dimensions": 768
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
    "services": ["Neo4j", "Pinecone", "Ollama"],
    "models": {
      "embedding": "nomic-embed-text",
      "llm": "gpt-3.5-turbo"
    }
  },
  "message": "Memory service initialized successfully",
  "tools": ["Neo4j", "Pinecone", "Ollama", "LangChain"]
}
```

### Chat with Memory Context

Send a message and receive a response with memory context.

**Endpoint:** `POST /api/memory-chat/chat`

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "message": "What did we discuss about machine learning?",
  "includeMemories": true,
  "options": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on our previous conversations, we discussed machine learning algorithms, specifically supervised learning techniques like linear regression and decision trees. You were particularly interested in how these algorithms can be applied to real-world data analysis problems.",
    "context": "Previous conversation about machine learning algorithms and their applications",
    "memories": {
      "episodic": [
        {
          "id": "memory-id-123",
          "content": "User asked about machine learning algorithms",
          "timestamp": "2024-01-15T10:30:00Z",
          "importance": 0.8
        }
      ],
      "semantic": [
        {
          "id": "concept-id-123",
          "concept": "Machine Learning",
          "description": "A subset of AI that focuses on algorithms that can learn from data",
          "confidence": 0.9
        }
      ]
    },
    "storedMemory": {
      "id": "memory-id-456",
      "content": "What did we discuss about machine learning?",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    "timestamp": "2024-01-15T11:00:00Z"
  },
  "message": "Chat response generated with memory context",
  "tools": ["Neo4j", "Pinecone", "Ollama", "LangChain"]
}
```

### Get Chat History

Retrieve conversation history for a user session.

**Endpoint:** `GET /api/memory-chat/history/:userId/:sessionId`

**Query Parameters:**
- `limit` (optional): Maximum number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "sessionId": "session456",
    "messages": [
      {
        "id": "memory-id-123",
        "content": "User asked about machine learning algorithms",
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "user",
        "importance": 0.8
      },
      {
        "id": "memory-id-124",
        "content": "Machine learning algorithms are computational methods that can learn patterns from data...",
        "timestamp": "2024-01-15T10:30:15Z",
        "type": "assistant",
        "importance": 0.9
      }
    ],
    "totalCount": 2,
    "hasMore": false
  },
  "message": "Chat history retrieved successfully",
  "tools": ["Neo4j"]
}
```

### Search During Chat

Search for relevant memories during a conversation.

**Endpoint:** `POST /api/memory-chat/search`

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "query": "machine learning algorithms",
  "type": "both",
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "episodic": [
      {
        "id": "memory-id-123",
        "content": "User asked about machine learning algorithms",
        "timestamp": "2024-01-15T10:30:00Z",
        "relevanceScore": 0.95
      }
    ],
    "semantic": [
      {
        "id": "concept-id-123",
        "concept": "Machine Learning",
        "description": "A subset of artificial intelligence...",
        "similarityScore": 0.92
      }
    ]
  },
  "message": "Found 1 episodic and 1 semantic memories",
  "tools": ["Neo4j", "Pinecone", "Ollama"]
}
```

## Knowledge Management APIs

### Store Knowledge

Store a piece of knowledge or concept.

**Endpoint:** `POST /api/memory-chat/knowledge`

**Request Body:**
```json
{
  "userId": "user123",
  "concept": "Deep Learning",
  "description": "A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data",
  "category": "AI",
  "confidence": 0.9,
  "source": "wikipedia"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "concept-id-456",
    "userId": "user123",
    "concept": "Deep Learning",
    "description": "A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data",
    "metadata": {
      "category": "AI",
      "confidence": 0.9,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T11:00:00Z",
      "accessCount": 0
    },
    "relationships": {
      "similar": [],
      "parent": "concept-id-123",
      "children": []
    }
  },
  "message": "Knowledge stored successfully",
  "tools": ["Pinecone", "Ollama"]
}
```

### Get Knowledge

Retrieve a specific piece of knowledge.

**Endpoint:** `GET /api/memory-chat/knowledge/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "concept-id-456",
    "userId": "user123",
    "concept": "Deep Learning",
    "description": "A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data",
    "metadata": {
      "category": "AI",
      "confidence": 0.9,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T11:00:00Z",
      "accessCount": 0
    },
    "relationships": {
      "similar": [],
      "parent": "concept-id-123",
      "children": []
    }
  },
  "message": "Knowledge retrieved successfully",
  "tools": ["Pinecone"]
}
```

### Search Knowledge

Search for knowledge using semantic similarity.

**Endpoint:** `POST /api/memory-chat/knowledge/search`

**Request Body:**
```json
{
  "userId": "user123",
  "query": "neural networks and deep learning",
  "threshold": 0.7,
  "limit": 10,
  "filters": {
    "categories": ["AI", "Technology"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "concept-id-456",
      "concept": "Deep Learning",
      "description": "A subset of machine learning that uses neural networks with multiple layers...",
      "similarityScore": 0.95,
      "metadata": {
        "category": "AI",
        "confidence": 0.9,
        "source": "wikipedia"
      }
    }
  ],
  "message": "Found 1 knowledge items",
  "tools": ["Pinecone", "Ollama"]
}
```

### Update Knowledge

Update an existing piece of knowledge.

**Endpoint:** `PUT /api/memory-chat/knowledge/:id`

**Request Body:**
```json
{
  "description": "Updated description with more technical details about neural network architectures",
  "metadata": {
    "confidence": 0.95,
    "accessCount": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "concept-id-456",
    "userId": "user123",
    "concept": "Deep Learning",
    "description": "Updated description with more technical details about neural network architectures",
    "metadata": {
      "category": "AI",
      "confidence": 0.95,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T11:00:00Z",
      "accessCount": 5
    },
    "relationships": {
      "similar": [],
      "parent": "concept-id-123",
      "children": []
    }
  },
  "message": "Knowledge updated successfully",
  "tools": ["Pinecone", "Ollama"]
}
```

### Delete Knowledge

Delete a piece of knowledge.

**Endpoint:** `DELETE /api/memory-chat/knowledge/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "message": "Knowledge deleted successfully",
  "tools": ["Pinecone"]
}
```

## Context Enhancement APIs

### Enhance Context with Memories

Enhance a query with relevant memories for better context.

**Endpoint:** `POST /api/memory-chat/enhance-context`

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "query": "Tell me about machine learning",
  "maxMemories": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enhancedContext": "Based on our previous conversations about machine learning algorithms and their applications, here's what I can tell you about machine learning...",
    "relevantMemories": {
      "episodic": [
        {
          "id": "memory-id-123",
          "content": "User asked about machine learning algorithms",
          "timestamp": "2024-01-15T10:30:00Z",
          "relevanceScore": 0.9
        }
      ],
      "semantic": [
        {
          "id": "concept-id-123",
          "concept": "Machine Learning",
          "description": "A subset of artificial intelligence...",
          "similarityScore": 0.95
        }
      ]
    }
  },
  "message": "Context enhanced with relevant memories",
  "tools": ["Neo4j", "Pinecone", "Ollama"]
}
```

### Get Memory Insights

Get insights about user's memory patterns and preferences.

**Endpoint:** `GET /api/memory-chat/insights/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalMemories": 150,
    "topics": [
      {
        "topic": "Machine Learning",
        "count": 25,
        "importance": 0.8
      },
      {
        "topic": "Data Science",
        "count": 20,
        "importance": 0.7
      }
    ],
    "recentActivity": {
      "lastConversation": "2024-01-15T11:00:00Z",
      "memoriesToday": 5,
      "memoriesThisWeek": 25
    },
    "preferences": {
      "preferredTopics": ["AI", "Technology"],
      "conversationStyle": "technical",
      "detailLevel": "high"
    }
  },
  "message": "Memory insights retrieved successfully",
  "tools": ["Neo4j", "Pinecone"]
}
```

## Error Responses

### Service Not Initialized
```json
{
  "success": false,
  "error": "Service not initialized",
  "message": "Memory service must be initialized before use"
}
```

### Invalid Chat Data
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid chat data provided",
  "details": {
    "field": "message",
    "message": "Message content is required"
  }
}
```

### Memory Service Error
```json
{
  "success": false,
  "error": "Memory service error",
  "message": "Failed to process memory operation",
  "details": {
    "service": "Pinecone",
    "reason": "Vector similarity search failed"
  }
}
```

## Examples

### Start a Memory-Aware Conversation

```bash
# Initialize the service
curl -X POST http://localhost:3001/api/memory-chat/initialize \
  -H "Content-Type: application/json" \
  -d '{}'

# Send a message with memory context
curl -X POST http://localhost:3001/api/memory-chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "message": "What did we discuss about AI?",
    "includeMemories": true
  }'
```

### Store and Search Knowledge

```bash
# Store knowledge
curl -X POST http://localhost:3001/api/memory-chat/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "concept": "Neural Networks",
    "description": "Computational models inspired by biological neural networks",
    "category": "AI",
    "confidence": 0.9
  }'

# Search knowledge
curl -X POST http://localhost:3001/api/memory-chat/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "query": "neural networks",
    "threshold": 0.7
  }'
```

### Get Chat History

```bash
curl http://localhost:3001/api/memory-chat/history/user123/session456?limit=10
```

## Configuration

### Environment Variables

```env
# Memory System Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=your_database

# Pinecone Configuration (optional)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=clear-ai-memories

# LangChain Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Memory Settings
MEMORY_EMBEDDING_MODEL=nomic-embed-text
MEMORY_EMBEDDING_DIMENSIONS=768
MEMORY_MAX_CONTEXT_MEMORIES=50
MEMORY_SIMILARITY_THRESHOLD=0.7
```

## Best Practices

1. **Initialize the service** before starting conversations
2. **Use meaningful session IDs** to group related conversations
3. **Include memory context** for more intelligent responses
4. **Store important knowledge** for future reference
5. **Regular cleanup** of old or irrelevant memories
6. **Monitor conversation quality** and adjust parameters

## Integration Examples

### React Component

```typescript
import React, { useState, useEffect } from 'react';

const MemoryChat = ({ userId, sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async (message) => {
    const response = await fetch('/api/memory-chat/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        message,
        includeMemories: true
      })
    });
    
    const data = await response.json();
    setMessages(prev => [...prev, data.data]);
  };

  return (
    <div className="memory-chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <p>{msg.message}</p>
            {msg.memories && (
              <div className="memories">
                <h4>Relevant Memories:</h4>
                <ul>
                  {msg.memories.episodic.map(memory => (
                    <li key={memory.id}>{memory.content}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
        placeholder="Type your message..."
      />
    </div>
  );
};
```

### Node.js Integration

```javascript
const axios = require('axios');

class MemoryChatClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async initialize() {
    const response = await axios.post(`${this.baseURL}/api/memory-chat/initialize`);
    return response.data;
  }

  async chat(userId, sessionId, message, options = {}) {
    const response = await axios.post(`${this.baseURL}/api/memory-chat/chat`, {
      userId,
      sessionId,
      message,
      includeMemories: true,
      ...options
    });
    return response.data;
  }

  async storeKnowledge(userId, concept, description, category) {
    const response = await axios.post(`${this.baseURL}/api/memory-chat/knowledge`, {
      userId,
      concept,
      description,
      category,
      confidence: 0.9
    });
    return response.data;
  }
}

// Usage
const client = new MemoryChatClient();
await client.initialize();

const response = await client.chat('user123', 'session456', 'Hello!');
console.log(response.data.message);
```

## Next Steps

1. **Explore Memory APIs**: Check out [Memory System APIs](/docs/api/server/memory)
2. **Learn Integration**: See [Memory Integration Examples](/docs/features/memory-system)
3. **Set up Configuration**: Follow the [Memory Setup Guide](/docs/getting-started/memory-setup)
4. **Build Applications**: Use the [Client SDK](/docs/api/client/services)
