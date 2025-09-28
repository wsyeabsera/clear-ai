# Memory System APIs

The Memory System provides intelligent memory management for AI applications using Neo4j for episodic memory and Pinecone for semantic memory, with local Ollama embeddings for privacy.

## Overview

The Memory System consists of two types of memory:

- **Episodic Memory** (Neo4j): Stores conversation history, user interactions, and temporal relationships
- **Semantic Memory** (Pinecone): Stores knowledge, concepts, and facts as vector embeddings

## Base URL

All memory APIs are available at:
```
http://localhost:3001/api/memory
```

## Authentication

Currently, the memory APIs do not require authentication. This will be added in future versions.

## Episodic Memory APIs

### Store Episodic Memory

Store a new episodic memory (conversation, interaction, etc.).

**Endpoint:** `POST /api/memory/episodic`

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "content": "User asked about machine learning algorithms",
  "context": {
    "conversation_turn": 1,
    "topic": "AI"
  },
  "metadata": {
    "source": "chat",
    "importance": 0.8,
    "tags": ["AI", "machine learning"],
    "location": "web_interface"
  },
  "relationships": {
    "previous": "memory-id-123",
    "next": "memory-id-456",
    "related": ["memory-id-789"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-id-123",
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2024-01-15T10:30:00Z",
    "content": "User asked about machine learning algorithms",
    "context": {
      "conversation_turn": 1,
      "topic": "AI"
    },
    "metadata": {
      "source": "chat",
      "importance": 0.8,
      "tags": ["AI", "machine learning"],
      "location": "web_interface"
    },
    "relationships": {
      "previous": "memory-id-123",
      "next": "memory-id-456",
      "related": ["memory-id-789"]
    }
  },
  "message": "Episodic memory stored successfully",
  "tools": ["Neo4j", "Ollama"]
}
```

### Get Episodic Memory

Retrieve a specific episodic memory by ID.

**Endpoint:** `GET /api/memory/episodic/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-id-123",
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2024-01-15T10:30:00Z",
    "content": "User asked about machine learning algorithms",
    "context": {
      "conversation_turn": 1,
      "topic": "AI"
    },
    "metadata": {
      "source": "chat",
      "importance": 0.8,
      "tags": ["AI", "machine learning"],
      "location": "web_interface"
    },
    "relationships": {
      "previous": "memory-id-123",
      "next": "memory-id-456",
      "related": ["memory-id-789"]
    }
  },
  "message": "Episodic memory retrieved successfully",
  "tools": ["Neo4j"]
}
```

### Search Episodic Memories

Search for episodic memories with various filters.

**Endpoint:** `POST /api/memory/episodic/search`

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "tags": ["AI", "machine learning"],
  "importance": {
    "min": 0.7,
    "max": 1.0
  },
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "memory-id-123",
      "userId": "user123",
      "sessionId": "session456",
      "timestamp": "2024-01-15T10:30:00Z",
      "content": "User asked about machine learning algorithms",
      "context": {
        "conversation_turn": 1,
        "topic": "AI"
      },
      "metadata": {
        "source": "chat",
        "importance": 0.8,
        "tags": ["AI", "machine learning"],
        "location": "web_interface"
      },
      "relationships": {
        "previous": "memory-id-123",
        "next": "memory-id-456",
        "related": ["memory-id-789"]
      }
    }
  ],
  "message": "Found 1 episodic memories",
  "tools": ["Neo4j"]
}
```

### Update Episodic Memory

Update an existing episodic memory.

**Endpoint:** `PUT /api/memory/episodic/:id`

**Request Body:**
```json
{
  "content": "Updated content",
  "metadata": {
    "importance": 0.9,
    "tags": ["AI", "machine learning", "updated"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-id-123",
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2024-01-15T10:30:00Z",
    "content": "Updated content",
    "context": {
      "conversation_turn": 1,
      "topic": "AI"
    },
    "metadata": {
      "source": "chat",
      "importance": 0.9,
      "tags": ["AI", "machine learning", "updated"],
      "location": "web_interface"
    },
    "relationships": {
      "previous": "memory-id-123",
      "next": "memory-id-456",
      "related": ["memory-id-789"]
    }
  },
  "message": "Episodic memory updated successfully",
  "tools": ["Neo4j"]
}
```

### Delete Episodic Memory

Delete a specific episodic memory.

**Endpoint:** `DELETE /api/memory/episodic/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "message": "Episodic memory deleted successfully",
  "tools": ["Neo4j"]
}
```

## Semantic Memory APIs

### Store Semantic Memory

Store a new semantic memory (knowledge, concept, fact).

**Endpoint:** `POST /api/memory/semantic`

**Request Body:**
```json
{
  "userId": "user123",
  "concept": "Machine Learning",
  "description": "A subset of artificial intelligence that focuses on algorithms that can learn from data",
  "metadata": {
    "category": "AI",
    "confidence": 0.9,
    "source": "wikipedia",
    "lastAccessed": "2024-01-15T10:30:00Z",
    "accessCount": 0
  },
  "relationships": {
    "similar": ["concept-id-456"],
    "parent": "concept-id-789",
    "children": ["concept-id-101", "concept-id-102"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "concept-id-123",
    "userId": "user123",
    "concept": "Machine Learning",
    "description": "A subset of artificial intelligence that focuses on algorithms that can learn from data",
    "metadata": {
      "category": "AI",
      "confidence": 0.9,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T10:30:00Z",
      "accessCount": 0
    },
    "relationships": {
      "similar": ["concept-id-456"],
      "parent": "concept-id-789",
      "children": ["concept-id-101", "concept-id-102"]
    }
  },
  "message": "Semantic memory stored successfully",
  "tools": ["Pinecone", "Ollama"]
}
```

### Get Semantic Memory

Retrieve a specific semantic memory by ID.

**Endpoint:** `GET /api/memory/semantic/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "concept-id-123",
    "userId": "user123",
    "concept": "Machine Learning",
    "description": "A subset of artificial intelligence that focuses on algorithms that can learn from data",
    "metadata": {
      "category": "AI",
      "confidence": 0.9,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T10:30:00Z",
      "accessCount": 0
    },
    "relationships": {
      "similar": ["concept-id-456"],
      "parent": "concept-id-789",
      "children": ["concept-id-101", "concept-id-102"]
    }
  },
  "message": "Semantic memory retrieved successfully",
  "tools": ["Pinecone"]
}
```

### Search Semantic Memories

Search for semantic memories using vector similarity.

**Endpoint:** `POST /api/memory/semantic/search`

**Request Body:**
```json
{
  "userId": "user123",
  "query": "artificial intelligence algorithms",
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
      "id": "concept-id-123",
      "userId": "user123",
      "concept": "Machine Learning",
      "description": "A subset of artificial intelligence that focuses on algorithms that can learn from data",
      "metadata": {
        "category": "AI",
        "confidence": 0.9,
        "source": "wikipedia",
        "lastAccessed": "2024-01-15T10:30:00Z",
        "accessCount": 0
      },
      "relationships": {
        "similar": ["concept-id-456"],
        "parent": "concept-id-789",
        "children": ["concept-id-101", "concept-id-102"]
      }
    }
  ],
  "message": "Found 1 semantic memories",
  "tools": ["Pinecone", "Ollama"]
}
```

### Update Semantic Memory

Update an existing semantic memory.

**Endpoint:** `PUT /api/memory/semantic/:id`

**Request Body:**
```json
{
  "description": "Updated description with more details",
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
    "id": "concept-id-123",
    "userId": "user123",
    "concept": "Machine Learning",
    "description": "Updated description with more details",
    "metadata": {
      "category": "AI",
      "confidence": 0.95,
      "source": "wikipedia",
      "lastAccessed": "2024-01-15T10:30:00Z",
      "accessCount": 5
    },
    "relationships": {
      "similar": ["concept-id-456"],
      "parent": "concept-id-789",
      "children": ["concept-id-101", "concept-id-102"]
    }
  },
  "message": "Semantic memory updated successfully",
  "tools": ["Pinecone", "Ollama"]
}
```

### Delete Semantic Memory

Delete a specific semantic memory.

**Endpoint:** `DELETE /api/memory/semantic/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "message": "Semantic memory deleted successfully",
  "tools": ["Pinecone"]
}
```

## Context and Search APIs

### Get Memory Context

Retrieve memory context for a user session.

**Endpoint:** `GET /api/memory/context/:userId/:sessionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "sessionId": "session456",
    "episodic": [
      {
        "id": "memory-id-123",
        "content": "User asked about machine learning",
        "timestamp": "2024-01-15T10:30:00Z",
        "importance": 0.8
      }
    ],
    "semantic": [
      {
        "id": "concept-id-123",
        "concept": "Machine Learning",
        "description": "A subset of AI...",
        "confidence": 0.9
      }
    ]
  },
  "message": "Memory context retrieved successfully",
  "tools": ["Neo4j", "Pinecone"]
}
```

### Search All Memories

Search across both episodic and semantic memories.

**Endpoint:** `POST /api/memory/search`

**Request Body:**
```json
{
  "userId": "user123",
  "query": "machine learning algorithms",
  "type": "both",
  "limit": 20,
  "filters": {
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "tags": ["AI"],
    "categories": ["Technology"]
  }
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
        "relevanceScore": 0.85
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

## Utility APIs

### Get Memory Statistics

Get comprehensive statistics about user memories.

**Endpoint:** `GET /api/memory/stats/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "episodic": {
      "count": 150,
      "oldest": "2024-01-01T00:00:00Z",
      "newest": "2024-01-15T10:30:00Z"
    },
    "semantic": {
      "count": 25,
      "categories": ["AI", "Technology", "Science"]
    }
  },
  "message": "Memory statistics retrieved successfully",
  "tools": ["Neo4j", "Pinecone"]
}
```

### Clear User Memories

Clear all memories for a specific user.

**Endpoint:** `DELETE /api/memory/clear/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "cleared": true
  },
  "message": "User memories cleared successfully",
  "tools": ["Neo4j", "Pinecone"]
}
```

### Get Related Memories

Get memories related to a specific memory.

**Endpoint:** `GET /api/memory/related/:memoryId`

**Query Parameters:**
- `relationshipType` (optional): Type of relationship to search for

**Response:**
```json
{
  "success": true,
  "data": {
    "episodic": [
      {
        "id": "memory-id-456",
        "content": "Related conversation about AI",
        "timestamp": "2024-01-14T15:20:00Z",
        "relationship": "related"
      }
    ],
    "semantic": [
      {
        "id": "concept-id-789",
        "concept": "Artificial Intelligence",
        "description": "Broader concept...",
        "relationship": "parent"
      }
    ]
  },
  "message": "Found 1 episodic and 1 semantic related memories",
  "tools": ["Neo4j", "Pinecone"]
}
```

## Error Responses

### Memory Not Found
```json
{
  "success": false,
  "error": "Memory not found",
  "message": "The requested memory does not exist"
}
```

### Invalid Memory Data
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid memory data provided",
  "details": {
    "field": "userId",
    "message": "User ID is required"
  }
}
```

### Service Unavailable
```json
{
  "success": false,
  "error": "Service unavailable",
  "message": "Memory service is not available",
  "details": {
    "service": "Pinecone",
    "reason": "API key not configured"
  }
}
```

## Examples

### Store Conversation Memory

```bash
curl -X POST http://localhost:3001/api/memory/episodic \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "content": "User asked about machine learning algorithms",
    "context": {
      "conversation_turn": 1,
      "topic": "AI"
    },
    "metadata": {
      "source": "chat",
      "importance": 0.8,
      "tags": ["AI", "machine learning"]
    }
  }'
```

### Search for AI-related Memories

```bash
curl -X POST http://localhost:3001/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "query": "artificial intelligence",
    "type": "both",
    "limit": 10
  }'
```

### Get Memory Statistics

```bash
curl http://localhost:3001/api/memory/stats/user123
```

## Configuration

### Environment Variables

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=your_database

# Pinecone Configuration (optional)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=clear-ai-memories

# Memory System Settings
MEMORY_EMBEDDING_MODEL=nomic-embed-text
MEMORY_EMBEDDING_DIMENSIONS=768
MEMORY_MAX_CONTEXT_MEMORIES=50
MEMORY_SIMILARITY_THRESHOLD=0.7
OLLAMA_BASE_URL=http://localhost:11434
```

## Rate Limiting

Memory APIs are not currently rate-limited, but this will be implemented in future versions.

## Best Practices

1. **Use appropriate importance scores** (0.0-1.0) to help with memory retrieval
2. **Add relevant tags** to make memories easier to find
3. **Set up relationships** between related memories
4. **Regular cleanup** of old or irrelevant memories
5. **Monitor memory usage** to avoid storage limits

## Next Steps

1. **Explore Memory Chat APIs**: Check out [Memory Chat APIs](/docs/api/server/memory-chat)
2. **Learn Integration**: See [Memory Integration Examples](/docs/features/memory-system)
3. **Set up Configuration**: Follow the [Memory Setup Guide](/docs/getting-started/memory-setup)
4. **Build Applications**: Use the [Client SDK](/docs/api/client/services)
