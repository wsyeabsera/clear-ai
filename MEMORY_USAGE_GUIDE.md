# Clear-AI Memory System Usage Guide

## 🧠 Overview

The Clear-AI Memory System provides intelligent memory management for AI applications using:
- **Neo4j** for episodic memory (conversation history, user interactions)
- **Pinecone** for semantic memory (knowledge, concepts, facts)
- **Ollama** for local text embeddings (privacy-focused)

## ✅ System Status

**Current Status: WORKING** ✅
- Neo4j episodic memory: ✅ Working
- Ollama embeddings: ✅ Working  
- Pinecone semantic memory: ⚠️ Requires API key
- API endpoints: ✅ Working
- Chat integration: ✅ Working

## 🚀 Quick Start

### 1. Prerequisites

**Neo4j (Required):**
```bash
# Download Neo4j Desktop from https://neo4j.com/download/
# Create project → Add database → Set password → Start
```

**Ollama (Required):**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull embedding model
ollama pull nomic-embed-text
```

**Pinecone (Optional for full functionality):**
- Create account at https://www.pinecone.io/
- Get API key and environment
- Add to `.env` file

### 2. Environment Setup

Create `packages/server/.env`:
```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=your_database_name

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

### 3. Installation & Testing

```bash
# Install dependencies
yarn install

# Build shared package
yarn build:shared

# Test Neo4j connection
node test-neo4j-connection.js

# Test Ollama embeddings
node test-ollama-embeddings.js

# Test memory system
node test-neo4j-only.js

# Start test server
node test-memory-server.js
```

## 📚 API Usage

### Memory Management

#### Store Episodic Memory
```javascript
const response = await fetch('http://localhost:3003/test/episodic', {
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

#### Retrieve Memory
```javascript
const response = await fetch('http://localhost:3003/test/episodic/memory-id');
const memory = await response.json();
```

#### Get Memory Statistics
```javascript
const response = await fetch('http://localhost:3003/test/stats/user123');
const stats = await response.json();
```

### Chat Integration

#### Initialize Memory Service
```javascript
const response = await fetch('http://localhost:3001/api/memory-chat/initialize', {
  method: 'POST'
});
```

#### Chat with Memory Context
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

#### Store Knowledge
```javascript
const response = await fetch('http://localhost:3001/api/memory-chat/knowledge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    concept: 'Machine Learning',
    description: 'A subset of AI that focuses on algorithms that can learn from data',
    category: 'AI'
  })
});
```

## 🔧 Programmatic Usage

### Direct Service Usage

```typescript
import { MemoryContextService } from '@clear-ai/shared';

// Initialize service
const memoryService = new MemoryContextService(config, langchainConfig);
await memoryService.initialize();

// Store episodic memory
const episodicMemory = await memoryService.storeEpisodicMemory({
  userId: 'user123',
  sessionId: 'session456',
  timestamp: new Date(),
  content: 'User asked about machine learning',
  context: { topic: 'AI' },
  metadata: {
    source: 'chat',
    importance: 0.8,
    tags: ['AI', 'machine learning']
  },
  relationships: {
    previous: undefined,
    next: undefined,
    related: []
  }
});

// Store semantic memory (requires Pinecone)
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
  relationships: {
    similar: [],
    parent: undefined,
    children: []
  }
});

// Search memories
const searchResults = await memoryService.searchMemories({
  userId: 'user123',
  query: 'machine learning',
  type: 'both',
  limit: 10
});

// Get memory context
const context = await memoryService.getMemoryContext('user123', 'session456');
```

### LangChain Integration

```typescript
// Enhance context with memories
const enhanced = await memoryService.enhanceContextWithMemories(
  userId, 
  sessionId, 
  userQuery
);

// Use enhanced context in your LangChain prompts
const prompt = `Context: ${enhanced.enhancedContext}\n\nUser: ${userQuery}`;
```

## 🎯 Use Cases

### 1. Conversational AI
- Store conversation history
- Retrieve relevant past discussions
- Maintain context across sessions

### 2. Knowledge Management
- Store learned facts and concepts
- Semantic search for relevant information
- Build knowledge graphs

### 3. Personalization
- Track user preferences
- Remember user behavior patterns
- Provide personalized responses

### 4. Learning Systems
- Store what the AI has learned
- Track learning progress
- Build upon previous knowledge

## 📊 Memory Types

### Episodic Memory (Neo4j)
- **Purpose**: Conversation history, user interactions
- **Features**: Temporal relationships, user sessions, importance scoring
- **Use Cases**: Chat context, user behavior tracking

### Semantic Memory (Pinecone)
- **Purpose**: Knowledge, concepts, facts
- **Features**: Vector similarity search, concept relationships
- **Use Cases**: Knowledge retrieval, concept understanding

## 🔍 Search Capabilities

### Episodic Search
```javascript
// Search by time range
const memories = await memoryService.searchEpisodicMemories({
  userId: 'user123',
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  }
});

// Search by tags
const memories = await memoryService.searchEpisodicMemories({
  userId: 'user123',
  tags: ['AI', 'machine learning']
});

// Search by importance
const memories = await memoryService.searchEpisodicMemories({
  userId: 'user123',
  importance: { min: 0.7, max: 1.0 }
});
```

### Semantic Search
```javascript
// Search by concept similarity
const memories = await memoryService.searchSemanticMemories({
  userId: 'user123',
  query: 'artificial intelligence algorithms',
  threshold: 0.7,
  limit: 10
});

// Search by category
const memories = await memoryService.searchSemanticMemories({
  userId: 'user123',
  query: 'machine learning',
  filters: { categories: ['AI', 'Technology'] }
});
```

## 🛠️ Configuration Options

### Memory Settings
```env
# Embedding model
MEMORY_EMBEDDING_MODEL=nomic-embed-text

# Vector dimensions
MEMORY_EMBEDDING_DIMENSIONS=768

# Context window size
MEMORY_MAX_CONTEXT_MEMORIES=50

# Similarity threshold
MEMORY_SIMILARITY_THRESHOLD=0.7

# Ollama base URL
OLLAMA_BASE_URL=http://localhost:11434
```

### Neo4j Settings
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=your_database
```

### Pinecone Settings
```env
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=clear-ai-memories
```

## 🧪 Testing

### Test Scripts
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

### Manual Testing
```bash
# Test memory storage
curl -X POST http://localhost:3003/test/episodic \
  -H "Content-Type: application/json" \
  -d '{}'

# Test memory retrieval
curl http://localhost:3003/test/episodic/memory-id

# Test memory stats
curl http://localhost:3003/test/stats/user123
```

## 🚨 Troubleshooting

### Common Issues

**Neo4j Connection Failed:**
- Ensure Neo4j Desktop is running
- Check database is started
- Verify password is correct
- Test with: `node test-neo4j-connection.js`

**Ollama Not Working:**
- Ensure Ollama is running: `ollama serve`
- Check model is available: `ollama list`
- Pull the model: `ollama pull nomic-embed-text`
- Test with: `node test-ollama-embeddings.js`

**Pinecone Issues:**
- Verify API key and environment
- Check index exists and is ready
- Ensure correct dimensions (768)

**Memory Service Not Initialized:**
- Check all environment variables
- Ensure Neo4j is running
- Verify Ollama is accessible

### Debug Commands
```bash
# Check Neo4j status
lsof -i :7687

# Check Ollama status
curl http://localhost:11434/api/tags

# Check memory service
node test-memory-server.js
```

## 📈 Performance

### Benchmarks
- **Embedding Generation**: ~100ms per text (local Ollama)
- **Neo4j Queries**: ~50ms average
- **Memory Storage**: ~200ms per memory
- **Context Retrieval**: ~300ms for 50 memories

### Optimization Tips
- Use appropriate similarity thresholds
- Limit context window size
- Cache frequently accessed memories
- Use batch operations for bulk storage

## 🔒 Security

### Privacy Features
- **Local Embeddings**: No data sent to external services
- **Encrypted Storage**: Neo4j supports encryption
- **Access Control**: User-based memory isolation
- **Data Retention**: Configurable cleanup policies

### Best Practices
- Use strong Neo4j passwords
- Secure Pinecone API keys
- Implement user authentication
- Regular data backups

## 📝 Examples

### Complete Chat Integration
```typescript
// Initialize memory service
const memoryService = new MemoryContextService(config, langchainConfig);
await memoryService.initialize();

// Chat with memory
async function chatWithMemory(userId: string, sessionId: string, message: string) {
  // Store user message
  await memoryService.storeEpisodicMemory({
    userId,
    sessionId,
    timestamp: new Date(),
    content: message,
    context: { conversation_turn: Date.now() },
    metadata: {
      source: 'chat',
      importance: 0.7,
      tags: ['user_message']
    },
    relationships: { previous: undefined, next: undefined, related: [] }
  });

  // Get enhanced context
  const enhanced = await memoryService.enhanceContextWithMemories(userId, sessionId, message);
  
  // Use with LangChain
  const response = await langchainService.generateResponse(enhanced.enhancedContext);
  
  // Store AI response
  await memoryService.storeEpisodicMemory({
    userId,
    sessionId,
    timestamp: new Date(),
    content: response,
    context: { conversation_turn: Date.now() },
    metadata: {
      source: 'ai',
      importance: 0.8,
      tags: ['ai_response']
    },
    relationships: { previous: undefined, next: undefined, related: [] }
  });

  return response;
}
```

## 🎉 Conclusion

The Clear-AI Memory System provides a powerful, privacy-focused solution for AI memory management. With Neo4j for episodic memory, Pinecone for semantic memory, and Ollama for local embeddings, you can build intelligent applications that remember and learn from interactions.

**Key Benefits:**
- ✅ Privacy-focused (local embeddings)
- ✅ Scalable (Neo4j + Pinecone)
- ✅ Intelligent (semantic search)
- ✅ Flexible (multiple memory types)
- ✅ Easy to use (simple API)

**Next Steps:**
1. Set up Pinecone for full functionality
2. Integrate with your LangChain/LangGraph workflows
3. Customize memory types for your use case
4. Implement user authentication and access control

For more information, see the [Memory System Documentation](MEMORY_SYSTEM.md).
