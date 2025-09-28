# Memory System with Neo4j and Pinecone

This document describes the memory system implementation that combines Neo4j for episodic memory and Pinecone for semantic memory, using Ollama's local text embeddings.

## Overview

The memory system provides two types of memory storage:

1. **Episodic Memory** (Neo4j): Stores conversation history, user interactions, and contextual information
2. **Semantic Memory** (Pinecone): Stores knowledge, concepts, and facts with vector embeddings for similarity search

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Chat Client   │───▶│  Memory Context  │───▶│   Neo4j DB      │
│                 │    │     Service      │    │ (Episodic)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Pinecone      │
                       │ (Semantic)      │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Ollama      │
                       │ (Embeddings)    │
                       └─────────────────┘
```

## Prerequisites

### 1. Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull the embedding model
ollama pull nomic-embed-text
```

### 2. Neo4j Setup
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Install and create a new project
3. Add a new local database
4. Set a password and start the database
5. Note your connection details (bolt://localhost:7687)

### 3. Pinecone Setup
1. Create account at https://www.pinecone.io/
2. Create a new project
3. Get your API key and environment
4. Update environment variables

## Environment Configuration

Copy `packages/server/env.memory.example` to `packages/server/.env` and configure:

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=clear-ai-memories

# Memory System Settings (using Ollama)
MEMORY_EMBEDDING_MODEL=nomic-embed-text
MEMORY_EMBEDDING_DIMENSIONS=768
MEMORY_MAX_CONTEXT_MEMORIES=50
MEMORY_SIMILARITY_THRESHOLD=0.7
OLLAMA_BASE_URL=http://localhost:11434
```

## Installation

1. Install dependencies:
```bash
yarn install
```

2. Build the packages:
```bash
yarn build:shared
```

3. Start the server:
```bash
cd packages/server
yarn dev
```

## Testing

### 1. Test Ollama Connection
```bash
node test-ollama-embeddings.js
```

### 2. Test Memory System
```bash
node test-memory-system.js
```

## API Endpoints

### Memory Management
- `POST /api/memory/episodic` - Store episodic memory
- `GET /api/memory/episodic/:id` - Get episodic memory
- `POST /api/memory/episodic/search` - Search episodic memories
- `POST /api/memory/semantic` - Store semantic memory
- `GET /api/memory/semantic/:id` - Get semantic memory
- `POST /api/memory/semantic/search` - Search semantic memories

### Chat Integration
- `POST /api/memory-chat/initialize` - Initialize memory service
- `POST /api/memory-chat/chat` - Chat with memory context
- `GET /api/memory-chat/history/:userId/:sessionId` - Get conversation history
- `POST /api/memory-chat/search` - Search memories during chat
- `POST /api/memory-chat/knowledge` - Store knowledge during chat

### Utility
- `GET /api/memory/stats/:userId` - Get memory statistics
- `DELETE /api/memory/clear/:userId` - Clear user memories

## Usage Examples

### 1. Store Episodic Memory
```javascript
const response = await fetch('http://localhost:3001/api/memory/episodic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    sessionId: 'session456',
    content: 'User asked about machine learning',
    context: { topic: 'AI' },
    metadata: {
      source: 'chat',
      importance: 0.8,
      tags: ['AI', 'machine learning']
    }
  })
});
```

### 2. Store Semantic Memory
```javascript
const response = await fetch('http://localhost:3001/api/memory/semantic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    concept: 'Machine Learning',
    description: 'A subset of AI that focuses on algorithms that can learn from data',
    metadata: {
      category: 'AI',
      confidence: 0.9,
      source: 'wikipedia'
    }
  })
});
```

### 3. Chat with Memory Context
```javascript
const response = await fetch('http://localhost:3001/api/memory-chat/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    sessionId: 'session456',
    message: 'What did we discuss about AI?',
    includeMemories: true
  })
});
```

## Integration with LangChain/LangGraph

The memory system integrates with your existing LangChain and LangGraph classes through the `enhanceContextWithMemories` method:

```typescript
import { MemoryContextService } from '@clear-ai/shared';

// In your LangChain service
const enhanced = await memoryService.enhanceContextWithMemories(
  userId, 
  sessionId, 
  userQuery
);

// Use enhanced context in your LangChain prompts
const prompt = `Context: ${enhanced.enhancedContext}\n\nUser: ${userQuery}`;
```

## Memory Types

### Episodic Memory
- **Purpose**: Store conversation history and user interactions
- **Storage**: Neo4j graph database
- **Features**: Temporal relationships, user sessions, importance scoring
- **Use Cases**: Conversation context, user behavior tracking

### Semantic Memory
- **Purpose**: Store knowledge, concepts, and facts
- **Storage**: Pinecone vector database
- **Features**: Vector similarity search, concept relationships
- **Use Cases**: Knowledge retrieval, concept understanding

## Performance Considerations

- **Embedding Generation**: Uses local Ollama for fast, private embeddings
- **Vector Dimensions**: 768 dimensions (nomic-embed-text)
- **Similarity Threshold**: Configurable (default: 0.7)
- **Context Window**: Configurable (default: 50 memories)

## Troubleshooting

### Ollama Issues
- Ensure Ollama is running: `ollama serve`
- Check model is available: `ollama list`
- Pull the model: `ollama pull nomic-embed-text`

### Neo4j Issues
- Check connection: `cypher-shell -u neo4j -p password`
- Verify database is running on port 7687

### Pinecone Issues
- Verify API key and environment
- Check index exists and is ready
- Ensure correct dimensions (768)

## Development

### Adding New Memory Types
1. Extend the memory types in `packages/shared/src/types/memory.ts`
2. Implement storage service
3. Add API endpoints
4. Update documentation

### Custom Embedding Models
1. Modify `PineconeMemoryService.generateEmbedding()`
2. Update dimension configuration
3. Test with your model

## License

MIT License - see LICENSE file for details.
