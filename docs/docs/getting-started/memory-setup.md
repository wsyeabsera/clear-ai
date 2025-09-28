# Memory System Setup Guide

This guide will help you set up the Clear-AI Memory System with Neo4j, Pinecone, and Ollama for intelligent memory management.

## Prerequisites

Before setting up the memory system, you'll need:

- **Node.js** (v18 or higher)
- **Neo4j** (Desktop or Server)
- **Ollama** (for local embeddings)
- **Pinecone** (optional, for semantic memory)

## Quick Start

### 1. Install Dependencies

```bash
# Install Clear-AI packages
yarn install

# Build shared package
yarn build:shared
```

### 2. Set up Neo4j

#### Option A: Neo4j Desktop (Recommended)

1. **Download Neo4j Desktop**
   - Go to [https://neo4j.com/download/](https://neo4j.com/download/)
   - Download and install Neo4j Desktop

2. **Create a Project**
   - Open Neo4j Desktop
   - Click "New Project"
   - Name it "Clear-AI Memory"

3. **Add a Database**
   - Click "Add Database" → "Local DBMS"
   - Set password (remember this!)
   - Click "Create"

4. **Start the Database**
   - Click the "Start" button on your database
   - Wait for it to show "Active"

#### Option B: Neo4j Server

```bash
# Using Docker
docker run \
  --name neo4j-memory \
  -p 7474:7474 -p 7687:7687 \
  -d \
  -v $HOME/neo4j/data:/data \
  -v $HOME/neo4j/logs:/logs \
  -v $HOME/neo4j/import:/var/lib/neo4j/import \
  -v $HOME/neo4j/plugins:/plugins \
  --env NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### 3. Set up Ollama

1. **Install Ollama**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama**
   ```bash
   ollama serve
   ```

3. **Pull the Embedding Model**
   ```bash
   ollama pull nomic-embed-text
   ```

### 4. Set up Pinecone (Optional)

1. **Create Pinecone Account**
   - Go to [https://www.pinecone.io/](https://www.pinecone.io/)
   - Sign up for a free account

2. **Create a Project**
   - Create a new project
   - Note your API key and environment

3. **Create an Index**
   - Create an index named `clear-ai-memories`
   - Set dimensions to `768` (for nomic-embed-text)
   - Use `cosine` similarity metric

### 5. Configure Environment

Create a `.env` file in `packages/server/`:

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password_here
NEO4J_DATABASE=neo4j

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

# LangChain Configuration (optional)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

### 6. Test the Setup

```bash
# Test Ollama embeddings
node test-ollama-embeddings.js

# Test Neo4j connection
node test-neo4j-connection.js

# Test memory system
node test-neo4j-only.js

# Test full system (if Pinecone is configured)
node test-memory-system.js
```

### 7. Start the Test Server

```bash
# Start memory test server
node test-memory-server.js
```

The server will start on port 3006 and provide test endpoints.

## Detailed Setup

### Neo4j Configuration

#### Database Setup

1. **Access Neo4j Browser**
   - Open [http://localhost:7474](http://localhost:7474)
   - Login with username `neo4j` and your password

2. **Create Initial Schema** (Optional)
   ```cypher
   // Create indexes for better performance
   CREATE INDEX user_id_index IF NOT EXISTS FOR (u:User) ON (u.id);
   CREATE INDEX memory_timestamp_index IF NOT EXISTS FOR (m:EpisodicMemory) ON (m.timestamp);
   CREATE INDEX memory_user_index IF NOT EXISTS FOR (m:EpisodicMemory) ON (m.userId);
   ```

3. **Verify Connection**
   ```cypher
   // Test query
   RETURN "Neo4j is working!" as message;
   ```

#### Performance Tuning

```cypher
// Set memory limits
CALL dbms.listConfig() YIELD name, value
WHERE name CONTAINS 'memory'
RETURN name, value;

// Adjust heap size if needed
// Add to neo4j.conf:
// dbms.memory.heap.initial_size=512m
// dbms.memory.heap.max_size=2G
```

### Ollama Configuration

#### Model Management

```bash
# List available models
ollama list

# Pull additional models
ollama pull llama2
ollama pull codellama

# Remove unused models
ollama rm model-name
```

#### Performance Optimization

```bash
# Set GPU acceleration (if available)
export OLLAMA_GPU=1

# Set memory limits
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_MAX_QUEUE=512
```

### Pinecone Configuration

#### Index Settings

```python
# Python example for index creation
import pinecone

pinecone.init(api_key="your-api-key", environment="your-environment")

# Create index
pinecone.create_index(
    name="clear-ai-memories",
    dimension=768,
    metric="cosine",
    spec={
        "serverless": {
            "cloud": "aws",
            "region": "us-east-1"
        }
    }
)
```

#### Monitoring

```python
# Check index status
index = pinecone.Index("clear-ai-memories")
print(index.describe_index_stats())
```

## Testing and Validation

### Test Scripts

The following test scripts are available:

#### 1. Ollama Embeddings Test
```bash
node test-ollama-embeddings.js
```
**Expected Output:**
```
🧪 Testing Ollama embeddings...
✅ Ollama embeddings working!
📊 Embedding dimension: 768
🔢 First 5 values: [0.2762, 1.6010, -3.6177, -1.7872, 0.7215...]
🔗 Similarity between texts: 0.4876
✅ Good! Different texts have low similarity
```

#### 2. Neo4j Connection Test
```bash
node test-neo4j-connection.js
```
**Expected Output:**
```
🔍 Testing Neo4j connection...
Trying bolt://localhost:7687...
✅ Connected to Neo4j at bolt://localhost:7687
✅ Query test successful: 1

🎉 Neo4j is working! Use these settings in your .env file:
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

#### 3. Memory System Test
```bash
node test-neo4j-only.js
```
**Expected Output:**
```
🧪 Testing Neo4j memory system...
Neo4j memory service initialized successfully
✅ Neo4j memory service initialized
✅ Stored memory: 57aa123b-6194-4745-8fe6-1ab111a8d2a1
✅ Retrieved memory: User asked about machine learning algorithms
✅ Found 1 memories
✅ Memory stats: 1 memories
✅ Cleaned up test memories
✅ Neo4j connection closed

🎉 Neo4j memory system is working perfectly!
📋 Next step: Set up Pinecone for semantic memory
```

#### 4. Full System Test
```bash
node test-memory-system.js
```
**Expected Output:**
```
🧪 Testing complete memory system...
✅ Neo4j memory service initialized
✅ Pinecone memory service initialized
✅ Memory context service initialized
✅ Stored episodic memory: memory-123
✅ Stored semantic memory: concept-456
✅ Found 1 episodic memories
✅ Found 1 semantic memories
✅ Enhanced context with memories
✅ Memory stats: 1 episodic, 1 semantic
✅ Cleaned up test data
✅ All services closed

🎉 Complete memory system is working perfectly!
```

### API Testing

#### Test Memory Storage
```bash
curl -X POST http://localhost:3006/test/episodic \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Test Memory Retrieval
```bash
curl http://localhost:3006/test/stats/test-user
```

#### Test Chat Integration
```bash
curl -X POST http://localhost:3001/api/memory-chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "message": "Hello, what can you remember about me?",
    "includeMemories": true
  }'
```

## Troubleshooting

### Common Issues

#### Neo4j Connection Failed

**Error:**
```
Failed to connect to server. Please ensure that your database is listening on the correct host and port and that you have compatible encryption settings both on Neo4j server and driver.
```

**Solutions:**
1. Ensure Neo4j is running
2. Check the port (default: 7687)
3. Verify password is correct
4. Check firewall settings
5. Try different connection URI formats:
   - `bolt://localhost:7687`
   - `neo4j://localhost:7687`
   - `bolt://127.0.0.1:7687`

#### Ollama Not Working

**Error:**
```
Failed to generate embedding with Ollama: fetch failed
```

**Solutions:**
1. Ensure Ollama is running: `ollama serve`
2. Check if model is available: `ollama list`
3. Pull the model: `ollama pull nomic-embed-text`
4. Check Ollama logs: `ollama logs`
5. Verify port 11434 is accessible

#### Pinecone Connection Error

**Error:**
```
PineconeConnectionError: Request failed to reach Pinecone
```

**Solutions:**
1. Verify API key is correct
2. Check environment name
3. Ensure index exists
4. Check network connectivity
5. Verify index dimensions (768)

#### Memory Service Not Initialized

**Error:**
```
Memory service not initialized
```

**Solutions:**
1. Check all environment variables
2. Ensure Neo4j is running
3. Verify Ollama is accessible
4. Check Pinecone credentials (if using)
5. Review service logs

### Debug Commands

```bash
# Check Neo4j status
lsof -i :7687

# Check Ollama status
curl http://localhost:11434/api/tags

# Check Pinecone status
curl -H "Api-Key: your-api-key" \
  "https://controller.your-environment.pinecone.io/actions/whoami"

# Check memory service
node test-memory-server.js
```

### Log Analysis

#### Neo4j Logs
```bash
# Check Neo4j logs
tail -f $HOME/neo4j/logs/neo4j.log
```

#### Ollama Logs
```bash
# Check Ollama logs
ollama logs
```

#### Application Logs
```bash
# Check application logs
tail -f logs/memory-service.log
```

## Performance Optimization

### Neo4j Optimization

1. **Memory Settings**
   ```bash
   # Add to neo4j.conf
   dbms.memory.heap.initial_size=1G
   dbms.memory.heap.max_size=4G
   dbms.memory.pagecache.size=2G
   ```

2. **Index Optimization**
   ```cypher
   // Create indexes for frequently queried fields
   CREATE INDEX user_id_index FOR (u:User) ON (u.id);
   CREATE INDEX memory_timestamp_index FOR (m:EpisodicMemory) ON (m.timestamp);
   CREATE INDEX memory_user_index FOR (m:EpisodicMemory) ON (m.userId);
   ```

3. **Query Optimization**
   ```cypher
   // Use EXPLAIN to analyze query performance
   EXPLAIN MATCH (m:EpisodicMemory {userId: "user123"}) RETURN m;
   ```

### Ollama Optimization

1. **GPU Acceleration**
   ```bash
   # Enable GPU if available
   export OLLAMA_GPU=1
   ```

2. **Memory Management**
   ```bash
   # Limit loaded models
   export OLLAMA_MAX_LOADED_MODELS=2
   ```

3. **Model Optimization**
   ```bash
   # Use quantized models for better performance
   ollama pull nomic-embed-text:latest
   ```

### Pinecone Optimization

1. **Index Configuration**
   - Use appropriate similarity metric (cosine)
   - Set correct dimensions (768)
   - Choose appropriate pod type

2. **Query Optimization**
   - Use appropriate topK values
   - Implement query caching
   - Batch operations when possible

## Security Considerations

### Neo4j Security

1. **Authentication**
   ```bash
   # Enable authentication
   dbms.security.auth_enabled=true
   ```

2. **Encryption**
   ```bash
   # Enable encryption
   dbms.connector.bolt.tls_level=REQUIRED
   ```

3. **Access Control**
   ```cypher
   // Create users with specific roles
   CREATE USER memory_user SET PASSWORD 'secure_password';
   GRANT ROLE reader TO memory_user;
   ```

### API Security

1. **Rate Limiting**
   ```typescript
   // Implement rate limiting
   const rateLimit = require('express-rate-limit');
   
   const memoryLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/memory', memoryLimiter);
   ```

2. **Input Validation**
   ```typescript
   // Validate input data
   const validateMemoryData = (data) => {
     if (!data.userId || !data.content) {
       throw new Error('Invalid memory data');
     }
   };
   ```

3. **Authentication Middleware**
   ```typescript
   // Add authentication
   const authenticateUser = (req, res, next) => {
     const token = req.headers.authorization;
     if (!token) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     // Verify token
     next();
   };
   ```

## Monitoring and Maintenance

### Health Checks

```typescript
// Health check endpoint
app.get('/api/memory/health', async (req, res) => {
  try {
    const neo4jHealth = await checkNeo4jConnection();
    const ollamaHealth = await checkOllamaConnection();
    const pineconeHealth = await checkPineconeConnection();
    
    res.json({
      status: 'healthy',
      services: {
        neo4j: neo4jHealth,
        ollama: ollamaHealth,
        pinecone: pineconeHealth
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Monitoring Metrics

1. **Memory Usage**
   - Track episodic memory count
   - Monitor semantic memory usage
   - Set up alerts for limits

2. **Performance Metrics**
   - Query response times
   - Embedding generation time
   - API response times

3. **Error Tracking**
   - Log all errors
   - Set up error alerts
   - Monitor service availability

### Maintenance Tasks

1. **Regular Cleanup**
   ```typescript
   // Clean up old memories
   const cleanupOldMemories = async () => {
     const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
     await memoryService.cleanupOldMemories(cutoffDate);
   };
   ```

2. **Index Maintenance**
   ```cypher
   // Rebuild indexes periodically
   DROP INDEX user_id_index;
   CREATE INDEX user_id_index FOR (u:User) ON (u.id);
   ```

3. **Backup Strategy**
   ```bash
   # Backup Neo4j database
   neo4j-admin dump --database=neo4j --to=/backup/neo4j-backup.dump
   
   # Backup Pinecone index (export data)
   # Use Pinecone API to export vectors
   ```

## Next Steps

1. **Explore the APIs**: Check out [Memory System APIs](/docs/api/server/memory)
2. **Learn Integration**: See [Memory Integration Examples](/docs/features/memory-system)
3. **Build Applications**: Use the [Client SDK](/docs/api/client/services)
4. **Customize Configuration**: Adapt settings for your use case
5. **Monitor Performance**: Set up monitoring and alerts

## Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Run the test scripts** to identify problems
3. **Review the troubleshooting section** above
4. **Check the documentation** for configuration details
5. **Open an issue** on GitHub if problems persist

## Related Documentation

- [Memory System Features](/docs/features/memory-system)
- [Memory System APIs](/docs/api/server/memory)
- [Memory Chat APIs](/docs/api/server/memory-chat)
- [Memory Integration Examples](/docs/examples/memory-integration)
- [Memory Quick Reference](/docs/reference/memory-quick-reference)
