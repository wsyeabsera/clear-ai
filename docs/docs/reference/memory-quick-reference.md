# Memory System Quick Reference

Quick reference for the Clear-AI Memory System APIs, configuration, and usage patterns.

## API Endpoints

### Memory Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/memory/episodic` | Store episodic memory |
| `GET` | `/api/memory/episodic/:id` | Get episodic memory |
| `POST` | `/api/memory/episodic/search` | Search episodic memories |
| `PUT` | `/api/memory/episodic/:id` | Update episodic memory |
| `DELETE` | `/api/memory/episodic/:id` | Delete episodic memory |
| `POST` | `/api/memory/semantic` | Store semantic memory |
| `GET` | `/api/memory/semantic/:id` | Get semantic memory |
| `POST` | `/api/memory/semantic/search` | Search semantic memories |
| `PUT` | `/api/memory/semantic/:id` | Update semantic memory |
| `DELETE` | `/api/memory/semantic/:id` | Delete semantic memory |

### Chat Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/memory-chat/initialize` | Initialize memory service |
| `POST` | `/api/memory-chat/chat` | Chat with memory context |
| `GET` | `/api/memory-chat/history/:userId/:sessionId` | Get chat history |
| `POST` | `/api/memory-chat/search` | Search during chat |
| `POST` | `/api/memory-chat/knowledge` | Store knowledge |
| `POST` | `/api/memory-chat/knowledge/search` | Search knowledge |

### Context & Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/memory/context/:userId/:sessionId` | Get memory context |
| `POST` | `/api/memory/search` | Search all memories |
| `GET` | `/api/memory/stats/:userId` | Get memory statistics |
| `DELETE` | `/api/memory/clear/:userId` | Clear user memories |
| `GET` | `/api/memory/related/:memoryId` | Get related memories |

## Request/Response Examples

### Store Episodic Memory

```bash
curl -X POST http://localhost:3001/api/memory/episodic \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "content": "User asked about machine learning",
    "context": {"topic": "AI"},
    "metadata": {
      "source": "chat",
      "importance": 0.8,
      "tags": ["AI", "machine learning"]
    }
  }'
```

### Store Semantic Memory

```bash
curl -X POST http://localhost:3001/api/memory/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "concept": "Machine Learning",
    "description": "A subset of AI that focuses on algorithms that can learn from data",
    "metadata": {
      "category": "AI",
      "confidence": 0.9,
      "source": "wikipedia"
    }
  }'
```

### Chat with Memory

```bash
curl -X POST http://localhost:3001/api/memory-chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "message": "What did we discuss about AI?",
    "includeMemories": true
  }'
```

### Search Memories

```bash
curl -X POST http://localhost:3001/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "query": "machine learning",
    "type": "both",
    "limit": 10
  }'
```

## Configuration

### Environment Variables

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j

# Pinecone (optional)
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=clear-ai-memories

# Memory Settings
MEMORY_EMBEDDING_MODEL=nomic-embed-text
MEMORY_EMBEDDING_DIMENSIONS=768
MEMORY_MAX_CONTEXT_MEMORIES=50
MEMORY_SIMILARITY_THRESHOLD=0.7
OLLAMA_BASE_URL=http://localhost:11434
```

### Service Configuration

```typescript
const memoryConfig = {
  neo4j: {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: 'password',
    database: 'neo4j'
  },
  pinecone: {
    apiKey: 'your_pinecone_api_key',
    environment: 'your_environment',
    indexName: 'clear-ai-memories'
  },
  embedding: {
    model: 'nomic-embed-text',
    dimensions: 768
  }
};
```

## TypeScript Types

### Episodic Memory

```typescript
interface EpisodicMemory {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  content: string;
  context: Record<string, any>;
  metadata: {
    source: string;
    importance: number; // 0-1
    tags: string[];
    location?: string;
    participants?: string[];
  };
  relationships: {
    previous?: string;
    next?: string;
    related?: string[];
  };
}
```

### Semantic Memory

```typescript
interface SemanticMemory {
  id: string;
  userId: string;
  concept: string;
  description: string;
  metadata: {
    category: string;
    confidence: number; // 0-1
    source: string;
    lastAccessed: Date;
    accessCount: number;
  };
  relationships: {
    similar?: string[];
    parent?: string;
    children?: string[];
  };
}
```

### Memory Search Query

```typescript
interface MemorySearchQuery {
  userId: string;
  query?: string;
  type?: 'episodic' | 'semantic' | 'both';
  limit?: number;
  threshold?: number;
  filters?: {
    timeRange?: { start: Date; end: Date };
    tags?: string[];
    categories?: string[];
    importance?: { min: number; max: number };
  };
}
```

## Programmatic Usage

### Initialize Service

```typescript
import { MemoryContextService } from '@clear-ai/shared';

const memoryService = new MemoryContextService(config, langchainConfig);
await memoryService.initialize();
```

### Store Memories

```typescript
// Episodic memory
const episodicMemory = await memoryService.storeEpisodicMemory({
  userId: 'user123',
  sessionId: 'session456',
  content: 'User asked about machine learning',
  context: { topic: 'AI' },
  metadata: {
    source: 'chat',
    importance: 0.8,
    tags: ['AI', 'machine learning']
  },
  relationships: { previous: undefined, next: undefined, related: [] }
});

// Semantic memory
const semanticMemory = await memoryService.storeSemanticMemory({
  userId: 'user123',
  concept: 'Machine Learning',
  description: 'A subset of AI that focuses on algorithms that can learn from data',
  metadata: {
    category: 'AI',
    confidence: 0.9,
    source: 'wikipedia',
    lastAccessed: new Date(),
    accessCount: 0
  },
  relationships: { similar: [], parent: undefined, children: [] }
});
```

### Search Memories

```typescript
// Search episodic memories
const episodicResults = await memoryService.searchEpisodicMemories({
  userId: 'user123',
  tags: ['AI'],
  limit: 10
});

// Search semantic memories
const semanticResults = await memoryService.searchSemanticMemories({
  userId: 'user123',
  query: 'machine learning',
  threshold: 0.7,
  limit: 10
});

// Search all memories
const allResults = await memoryService.searchMemories({
  userId: 'user123',
  query: 'artificial intelligence',
  type: 'both',
  limit: 20
});
```

### Context Enhancement

```typescript
const enhanced = await memoryService.enhanceContextWithMemories(
  'user123',
  'session456',
  'Tell me about machine learning'
);
```

## Test Commands

### Test System Components

```bash
# Test Ollama embeddings
node test-ollama-embeddings.js

# Test Neo4j connection
node test-neo4j-connection.js

# Test memory system
node test-neo4j-only.js

# Test full system
node test-memory-system.js

# Start test server
node test-memory-server.js
```

### Manual API Testing

```bash
# Test memory storage
curl -X POST http://localhost:3006/test/episodic \
  -H "Content-Type: application/json" \
  -d '{}'

# Test memory stats
curl http://localhost:3006/test/stats/user123

# Test chat
curl -X POST http://localhost:3001/api/memory-chat/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","sessionId":"session456","message":"Hello"}'
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Common Error Messages

| Error | Description | Solution |
|-------|-------------|----------|
| `Memory not found` | Requested memory doesn't exist | Check memory ID |
| `Validation error` | Invalid request data | Check request format |
| `Service not initialized` | Memory service not ready | Initialize service first |
| `Pinecone service not available` | Pinecone not configured | Add Pinecone credentials |
| `Neo4j connection failed` | Can't connect to Neo4j | Check Neo4j is running |

## Performance Tips

1. **Use appropriate similarity thresholds** (0.7-0.8)
2. **Limit context window size** (50 memories)
3. **Cache frequently accessed memories**
4. **Use batch operations** for bulk storage
5. **Monitor memory usage** and cleanup regularly

## Security Notes

1. **Use strong Neo4j passwords**
2. **Secure Pinecone API keys**
3. **Implement user authentication**
4. **Regular data backups**
5. **Local embeddings keep data private**

## Quick Setup

```bash
# 1. Install dependencies
yarn install && yarn build:shared

# 2. Start Neo4j Desktop and create database

# 3. Start Ollama
ollama serve
ollama pull nomic-embed-text

# 4. Test system
node test-ollama-embeddings.js
node test-neo4j-connection.js
node test-neo4j-only.js

# 5. Start test server
node test-memory-server.js
```

## Related Documentation

- [Memory System Features](/docs/features/memory-system)
- [Memory System APIs](/docs/api/server/memory)
- [Memory Chat APIs](/docs/api/server/memory-chat)
- [Memory Setup Guide](/docs/getting-started/memory-setup)
- [Memory Integration Examples](/docs/examples/memory-integration)
