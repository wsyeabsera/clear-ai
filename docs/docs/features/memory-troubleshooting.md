# Memory System Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Clear-AI Memory System. Each section includes symptoms, causes, and step-by-step solutions.

## 🚨 Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

- [ ] **Neo4j is running** and accessible
- [ ] **Ollama is running** with the correct model
- [ ] **Pinecone is configured** (if using semantic memory)
- [ ] **Environment variables** are set correctly
- [ ] **Dependencies are installed** and up to date
- [ ] **Network connectivity** is working
- [ ] **Logs are being generated** and accessible

## 🔧 Neo4j Issues

### Issue 1: Connection Refused

#### Symptoms
```bash
Error: connect ECONNREFUSED 127.0.0.1:7687
Neo4jError: The client is unauthorized due to authentication failure
```

#### Causes
- Neo4j service is not running
- Wrong connection details
- Authentication credentials are incorrect
- Firewall blocking the connection

#### Solutions

**Step 1: Check if Neo4j is running**
```bash
# Check if Neo4j process is running
ps aux | grep neo4j

# Check if port 7687 is listening
netstat -an | grep 7687
# or
lsof -i :7687
```

**Step 2: Start Neo4j**
```bash
# Using Docker
docker start neo4j

# Using Neo4j Desktop
# Open Neo4j Desktop and start your database

# Using system service
sudo systemctl start neo4j
```

**Step 3: Verify connection**
```bash
# Test connection with cypher-shell
cypher-shell -u neo4j -p your_password

# Test from your application
node test-neo4j-connection.js
```

**Step 4: Check environment variables**
```env
# packages/server/.env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_actual_password
NEO4J_DATABASE=neo4j
```

### Issue 2: Authentication Failure

#### Symptoms
```bash
Neo4jError: The client is unauthorized due to authentication failure
```

#### Solutions

**Step 1: Reset password**
```bash
# Connect to Neo4j
cypher-shell -u neo4j -p neo4j

# Change password
ALTER USER neo4j SET PASSWORD 'new_password';
```

**Step 2: Check credentials**
```typescript
// Test with correct credentials
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'your_password')
);

const session = driver.session();
const result = await session.run('RETURN 1 as test');
console.log('Connection successful:', result.records[0].get('test'));
await session.close();
```

### Issue 3: Query Performance Issues

#### Symptoms
- Slow query execution
- Timeout errors
- High memory usage

#### Solutions

**Step 1: Check query performance**
```cypher
// Use EXPLAIN to see query plan
EXPLAIN MATCH (u:User {id: "user-123"})-[:OWNS]->(s:Session)-[:CONTAINS]->(m:EpisodicMemory)
RETURN m

// Use PROFILE to see actual execution
PROFILE MATCH (u:User {id: "user-123"})-[:OWNS]->(s:Session)-[:CONTAINS]->(m:EpisodicMemory)
RETURN m
```

**Step 2: Create indexes**
```cypher
// Create indexes for frequently queried properties
CREATE INDEX user_id_index FOR (u:User) ON (u.id);
CREATE INDEX session_id_index FOR (s:Session) ON (s.id);
CREATE INDEX memory_timestamp_index FOR (m:EpisodicMemory) ON (m.timestamp);
CREATE INDEX memory_importance_index FOR (m:EpisodicMemory) ON (m.importance);
```

**Step 3: Optimize queries**
```cypher
// Good: Use specific labels and limit early
MATCH (u:User {id: "user-123"})-[:OWNS]->(s:Session)-[:CONTAINS]->(m:EpisodicMemory)
WHERE m.timestamp > datetime() - duration('P7D')
RETURN m
ORDER BY m.timestamp DESC
LIMIT 10

// Bad: Generic labels and late limiting
MATCH (n {id: "user-123"})-[:OWNS]->(s)-[:CONTAINS]->(m)
RETURN m
ORDER BY m.timestamp DESC
LIMIT 10
```

## 🔧 Ollama Issues

### Issue 1: Ollama Not Running

#### Symptoms
```bash
Error: connect ECONNREFUSED 127.0.0.1:11434
Error: fetch failed
```

#### Solutions

**Step 1: Check if Ollama is running**
```bash
# Check if Ollama process is running
ps aux | grep ollama

# Check if port 11434 is listening
netstat -an | grep 11434
```

**Step 2: Start Ollama**
```bash
# Start Ollama server
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

**Step 3: Check logs**
```bash
# Check Ollama logs
ollama logs

# Check system logs
journalctl -u ollama
```

### Issue 2: Model Not Found

#### Symptoms
```bash
Error: model "nomic-embed-text" not found
Error: 404 Not Found
```

#### Solutions

**Step 1: List available models**
```bash
ollama list
```

**Step 2: Install the model**
```bash
# Install the embedding model
ollama pull nomic-embed-text

# Verify installation
ollama list | grep nomic-embed-text
```

**Step 3: Test the model**
```bash
# Test the model
ollama run nomic-embed-text "Hello, world!"
```

### Issue 3: Slow Embedding Generation

#### Symptoms
- Embedding generation takes too long
- Timeout errors
- High CPU usage

#### Solutions

**Step 1: Check system resources**
```bash
# Check CPU usage
top -p $(pgrep ollama)

# Check memory usage
free -h

# Check disk space
df -h
```

**Step 2: Use a smaller model**
```typescript
// Use a smaller, faster model
const embeddingService = new OllamaEmbeddingService(
  'http://localhost:11434',
  'all-minilm' // Smaller, faster model
);
```

**Step 3: Implement caching**
```typescript
// Cache frequently used embeddings
class CachedEmbeddingService extends OllamaEmbeddingService {
  private cache = new Map<string, number[]>();
  
  async generateEmbedding(text: string): Promise<number[]> {
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }
    
    const embedding = await super.generateEmbedding(text);
    this.cache.set(text, embedding);
    return embedding;
  }
}
```

## 🔧 Pinecone Issues

### Issue 1: Index Not Found

#### Symptoms
```bash
Error: Index "clear-ai-memories" not found
Error: 404 Not Found
```

#### Solutions

**Step 1: Check available indexes**
```typescript
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!
});

const indexes = await pinecone.listIndexes();
console.log('Available indexes:', indexes);
```

**Step 2: Create the index**
```typescript
await pinecone.createIndex({
  name: 'clear-ai-memories',
  dimension: 768,
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
});
```

**Step 3: Wait for index to be ready**
```typescript
// Wait for index to be ready
let indexReady = false;
while (!indexReady) {
  const stats = await pinecone.describeIndexStats('clear-ai-memories');
  indexReady = stats.status?.ready;
  if (!indexReady) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
```

### Issue 2: Dimension Mismatch

#### Symptoms
```bash
Error: Vector dimension mismatch
Error: Expected 768 dimensions, got 384
```

#### Solutions

**Step 1: Check embedding dimensions**
```typescript
const embedding = await generateEmbedding("test text");
console.log('Embedding dimensions:', embedding.length);
```

**Step 2: Verify model configuration**
```typescript
// Check if using correct model
const model = process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text';
console.log('Using model:', model);

// nomic-embed-text should produce 768 dimensions
// all-minilm produces 384 dimensions
```

**Step 3: Recreate index with correct dimensions**
```typescript
// Delete old index
await pinecone.deleteIndex('clear-ai-memories');

// Create new index with correct dimensions
await pinecone.createIndex({
  name: 'clear-ai-memories',
  dimension: 768, // Match your embedding model
  metric: 'cosine'
});
```

### Issue 3: Query Timeout

#### Symptoms
```bash
Error: Query timeout
Error: Request timeout
```

#### Solutions

**Step 1: Add timeout handling**
```typescript
const searchResponse = await index.query({
  vector: queryEmbedding,
  topK: 10,
  includeMetadata: true,
  filter: { userId: { $eq: userId } }
}).timeout(30000); // 30 second timeout
```

**Step 2: Optimize query parameters**
```typescript
// Reduce topK if not needed
const searchResponse = await index.query({
  vector: queryEmbedding,
  topK: 5, // Reduce from 10 to 5
  includeMetadata: true,
  filter: { userId: { $eq: userId } }
});
```

**Step 3: Implement retry logic**
```typescript
async function queryWithRetry(params: any, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await index.query(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 🔧 General Memory System Issues

### Issue 1: Memory Not Storing

#### Symptoms
- Memories are not being saved
- No errors but no data in database
- API returns success but data is missing

#### Solutions

**Step 1: Check service initialization**
```typescript
// Ensure services are properly initialized
const memoryService = new MemoryContextService();
await memoryService.initialize();

// Check if services are ready
console.log('Neo4j ready:', memoryService.neo4jService?.isReady);
console.log('Pinecone ready:', memoryService.pineconeService?.isReady);
console.log('Ollama ready:', memoryService.embeddingService?.isReady);
```

**Step 2: Check error handling**
```typescript
try {
  const result = await storeEpisodicMemory(memoryData);
  console.log('Memory stored:', result);
} catch (error) {
  console.error('Error storing memory:', error);
  // Check specific error details
  if (error.message.includes('Neo4j')) {
    console.error('Neo4j error:', error);
  } else if (error.message.includes('Pinecone')) {
    console.error('Pinecone error:', error);
  }
}
```

**Step 3: Verify data format**
```typescript
// Ensure data is in correct format
const memoryData = {
  id: 'memory-123',
  userId: 'user-123',
  sessionId: 'session-123',
  content: 'Test memory content',
  context: { test: true },
  metadata: {
    source: 'test',
    importance: 0.8,
    tags: ['test']
  }
};

// Validate required fields
const requiredFields = ['id', 'userId', 'content'];
for (const field of requiredFields) {
  if (!memoryData[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}
```

### Issue 2: Search Not Working

#### Symptoms
- Search returns no results
- Search returns wrong results
- Search is very slow

#### Solutions

**Step 1: Check search parameters**
```typescript
// Verify search parameters
const searchParams = {
  userId: 'user-123',
  query: 'test query',
  limit: 10,
  threshold: 0.7
};

console.log('Search parameters:', searchParams);
```

**Step 2: Test with simple queries**
```typescript
// Test with very simple query
const results = await searchMemories({
  userId: 'user-123',
  query: 'test',
  limit: 5,
  threshold: 0.1 // Lower threshold
});

console.log('Search results:', results);
```

**Step 3: Check data exists**
```typescript
// Verify data exists in database
const allMemories = await getAllMemories('user-123');
console.log('Total memories:', allMemories.length);

// Check if memories have embeddings
const memoriesWithEmbeddings = allMemories.filter(m => m.embedding);
console.log('Memories with embeddings:', memoriesWithEmbeddings.length);
```

### Issue 3: Performance Issues

#### Symptoms
- Slow response times
- High memory usage
- Timeout errors

#### Solutions

**Step 1: Monitor performance**
```typescript
// Add performance monitoring
class PerformanceMonitoredService {
  private metrics = {
    totalRequests: 0,
    totalTime: 0,
    errors: 0
  };

  async storeMemory(data: any) {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      const result = await this.actualStoreMemory(data);
      const duration = Date.now() - startTime;
      this.metrics.totalTime += duration;
      
      console.log(`Memory stored in ${duration}ms`);
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageTime: this.metrics.totalTime / this.metrics.totalRequests,
      errorRate: this.metrics.errors / this.metrics.totalRequests
    };
  }
}
```

**Step 2: Implement caching**
```typescript
// Cache frequently accessed data
class CachedMemoryService {
  private cache = new Map<string, any>();
  private maxCacheSize = 1000;

  async getMemory(id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const memory = await this.actualGetMemory(id);
    this.cache.set(id, memory);
    
    // Limit cache size
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    return memory;
  }
}
```

**Step 3: Optimize queries**
```typescript
// Use appropriate limits and filters
const optimizedSearch = await searchMemories({
  userId: 'user-123',
  query: 'test',
  limit: 10, // Don't fetch more than needed
  threshold: 0.7, // Use appropriate threshold
  filters: {
    category: 'important', // Filter to reduce search space
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  }
});
```

## 🔧 Environment and Configuration Issues

### Issue 1: Environment Variables Not Loaded

#### Symptoms
```bash
Error: NEO4J_URI is not defined
Error: process.env.PINECONE_API_KEY is undefined
```

#### Solutions

**Step 1: Check .env file location**
```bash
# Ensure .env file is in the correct location
ls -la packages/server/.env

# Check file contents
cat packages/server/.env
```

**Step 2: Load environment variables**
```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './packages/server/.env' });

// Verify variables are loaded
console.log('NEO4J_URI:', process.env.NEO4J_URI);
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? 'Set' : 'Not set');
```

**Step 3: Check variable names**
```env
# Ensure variable names match exactly
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=clear-ai-memories
```

### Issue 2: Port Conflicts

#### Symptoms
```bash
Error: Port 3001 is already in use
Error: Port 7687 is already in use
```

#### Solutions

**Step 1: Check what's using the port**
```bash
# Check what's using port 3001
lsof -i :3001

# Check what's using port 7687
lsof -i :7687
```

**Step 2: Kill conflicting processes**
```bash
# Kill process using port 3001
kill -9 $(lsof -t -i:3001)

# Kill process using port 7687
kill -9 $(lsof -t -i:7687)
```

**Step 3: Use different ports**
```env
# Use different ports
SERVER_PORT=3002
NEO4J_URI=bolt://localhost:7688
```

## 🔧 Debugging Tools

### 1. Enable Debug Logging
```typescript
// Enable debug logging
process.env.DEBUG = 'memory:*';

// Or enable specific debug categories
process.env.DEBUG = 'memory:neo4j,memory:pinecone,memory:ollama';
```

### 2. Health Check Endpoint
```typescript
// Add health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    neo4j: await checkNeo4jHealth(),
    pinecone: await checkPineconeHealth(),
    ollama: await checkOllamaHealth(),
    timestamp: new Date().toISOString()
  };
  
  res.json(health);
});

async function checkNeo4jHealth() {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    return { status: 'healthy', message: 'Connected' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}
```

### 3. Memory System Status
```typescript
// Get memory system status
async function getMemorySystemStatus() {
  return {
    neo4j: {
      connected: await testNeo4jConnection(),
      nodeCount: await getNeo4jNodeCount(),
      lastQuery: await getLastNeo4jQuery()
    },
    pinecone: {
      connected: await testPineconeConnection(),
      vectorCount: await getPineconeVectorCount(),
      lastQuery: await getLastPineconeQuery()
    },
    ollama: {
      connected: await testOllamaConnection(),
      model: process.env.MEMORY_EMBEDDING_MODEL,
      lastEmbedding: await getLastEmbeddingTime()
    }
  };
}
```

## 🎯 Prevention Tips

### 1. Regular Monitoring
- Set up health checks
- Monitor performance metrics
- Track error rates
- Monitor resource usage

### 2. Proper Error Handling
- Always wrap operations in try-catch
- Log errors with context
- Implement retry logic
- Provide meaningful error messages

### 3. Testing
- Write unit tests for memory operations
- Test with different data sizes
- Test error conditions
- Test performance under load

### 4. Documentation
- Document configuration requirements
- Keep troubleshooting guides updated
- Document known issues and workarounds
- Maintain change logs

## 🚀 Getting Help

If you're still experiencing issues:

1. **Check the logs** for specific error messages
2. **Run the health check** to identify which component is failing
3. **Test each component** individually (Neo4j, Pinecone, Ollama)
4. **Check the examples** for working code patterns
5. **Review the configuration** against the setup guides

## 🎯 Next Steps

Now that you can troubleshoot issues, explore:

1. **[Memory Examples](./memory-examples.md)** - Practical usage scenarios
2. **[Memory System Overview](./memory-system-overview.md)** - Complete system understanding
3. **[Neo4j Integration](./neo4j-integration.md)** - Deep dive into episodic memory
4. **[Pinecone Vectors](./pinecone-vectors.md)** - Understanding semantic memory

---

*Ready to build amazing memory-powered applications? Check out the [Memory Examples](./memory-examples.md) for inspiration!*
