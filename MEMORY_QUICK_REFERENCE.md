# Memory System Quick Reference

## 🚀 Quick Setup

```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
ollama pull nomic-embed-text

# 2. Install Neo4j Desktop
# Download from https://neo4j.com/download/
# Create project → Add database → Start

# 3. Setup environment
cp packages/server/env.memory.example packages/server/.env
# Edit .env with your credentials

# 4. Test system
yarn build:shared
node test-ollama-embeddings.js
node test-neo4j-connection.js
node test-neo4j-only.js
```

## 📡 API Endpoints

### Memory Management
```bash
# Episodic Memory
POST   /api/memory/episodic              # Store memory
GET    /api/memory/episodic/:id          # Get memory
POST   /api/memory/episodic/search       # Search memories
PUT    /api/memory/episodic/:id          # Update memory
DELETE /api/memory/episodic/:id          # Delete memory

# Semantic Memory
POST   /api/memory/semantic              # Store knowledge
GET    /api/memory/semantic/:id          # Get knowledge
POST   /api/memory/semantic/search       # Search knowledge
PUT    /api/memory/semantic/:id          # Update knowledge
DELETE /api/memory/semantic/:id          # Delete knowledge

# Context & Search
GET    /api/memory/context/:userId/:sessionId  # Get context
POST   /api/memory/search                       # Search all
GET    /api/memory/stats/:userId               # Get statistics
DELETE /api/memory/clear/:userId               # Clear memories
```

### Chat Integration
```bash
POST   /api/memory-chat/initialize       # Initialize service
POST   /api/memory-chat/chat             # Chat with memory
GET    /api/memory-chat/history/:userId/:sessionId  # Get history
POST   /api/memory-chat/search           # Search during chat
POST   /api/memory-chat/knowledge        # Store knowledge
```

## 💻 Code Examples

### Store Episodic Memory
```javascript
const memory = await memoryService.storeEpisodicMemory({
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
```

### Store Semantic Memory
```javascript
const knowledge = await memoryService.storeSemanticMemory({
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
```javascript
// Search episodic memories
const episodic = await memoryService.searchEpisodicMemories({
  userId: 'user123',
  tags: ['AI'],
  limit: 10
});

// Search semantic memories
const semantic = await memoryService.searchSemanticMemories({
  userId: 'user123',
  query: 'machine learning',
  threshold: 0.7
});

// Search both
const results = await memoryService.searchMemories({
  userId: 'user123',
  query: 'AI algorithms',
  type: 'both',
  limit: 20
});
```

### Chat with Memory
```javascript
const response = await fetch('/api/memory-chat/chat', {
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

## 🔧 Configuration

### Environment Variables
```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=your_database

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

## 🧪 Testing

### Test Commands
```bash
# Test Ollama
node test-ollama-embeddings.js

# Test Neo4j
node test-neo4j-connection.js

# Test Memory System
node test-neo4j-only.js

# Test Full System
node test-memory-system.js

# Start Test Server
node test-memory-server.js
```

### Manual API Testing
```bash
# Test memory storage
curl -X POST http://localhost:3003/test/episodic \
  -H "Content-Type: application/json" \
  -d '{}'

# Test memory stats
curl http://localhost:3003/test/stats/user123

# Test chat
curl -X POST http://localhost:3001/api/memory-chat/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","sessionId":"session456","message":"Hello"}'
```

## 🚨 Troubleshooting

### Common Issues
- **Neo4j not running**: Start database in Neo4j Desktop
- **Ollama not working**: Run `ollama serve` and `ollama pull nomic-embed-text`
- **Memory service not initialized**: Check environment variables
- **Pinecone errors**: Verify API key and environment

### Debug Steps
1. Check Neo4j: `lsof -i :7687`
2. Check Ollama: `curl http://localhost:11434/api/tags`
3. Test connections: `node test-neo4j-connection.js`
4. Check logs: Look for error messages in console

## 📊 Memory Types

| Type | Storage | Purpose | Features |
|------|---------|---------|----------|
| Episodic | Neo4j | Conversations, interactions | Temporal, relationships, importance |
| Semantic | Pinecone | Knowledge, concepts | Vector search, similarity, categories |

## 🎯 Use Cases

- **Chatbots**: Remember conversation history
- **Knowledge Bases**: Store and retrieve facts
- **Personalization**: Track user preferences
- **Learning Systems**: Build upon previous knowledge
- **Context Awareness**: Provide relevant information

## 📈 Performance Tips

- Use appropriate similarity thresholds (0.7-0.8)
- Limit context window size (50 memories)
- Cache frequently accessed memories
- Use batch operations for bulk storage
- Monitor memory usage and cleanup regularly

## 🔒 Security Notes

- Neo4j passwords should be strong
- Pinecone API keys should be secured
- Implement user authentication
- Regular data backups recommended
- Local embeddings keep data private
