# Ollama Embeddings Guide

Ollama provides local, privacy-focused text embeddings for our memory system. This guide explains how embeddings work, why we chose Ollama, and how to set up and use local embeddings effectively.

## 🎯 What are Text Embeddings?

### The Magic of Converting Text to Numbers
Text embeddings are numerical representations of text that capture semantic meaning. Think of them as a way to convert human language into a format that computers can understand and compare.

```typescript
// Human-readable text
const text = "I love machine learning";

// Computer-readable vector (simplified - actual vectors have 768 dimensions)
const embedding = [0.1, 0.3, 0.7, 0.2, 0.9, 0.4, 0.6, 0.8, ...];
```

### Why Embeddings Matter
- **Semantic Understanding**: "car" and "automobile" have similar embeddings
- **Language Agnostic**: "hello" and "hola" have similar vectors
- **Context Awareness**: "bank" (financial) and "bank" (river) have different embeddings
- **Similarity Search**: Find related content even with different wording

## 🏠 Why Local Embeddings with Ollama?

### The Problem with External APIs
Traditional embedding services have drawbacks:
- **Privacy Concerns**: Your data goes to external servers
- **Cost**: Pay per API call, can get expensive
- **Latency**: Network requests add delay
- **Dependency**: Relies on external service availability
- **Data Control**: No control over how your data is processed

### Ollama's Advantages
- **Privacy First**: Everything runs on your machine
- **Cost Effective**: One-time setup, no per-request fees
- **Fast**: No network latency
- **Reliable**: No external dependencies
- **Customizable**: Use different models as needed

## 🚀 Setting Up Ollama

### 1. Installation
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Verify installation
ollama --version
```

### 2. Start Ollama Service
```bash
# Start Ollama server
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

### 3. Install Embedding Model
```bash
# Install nomic-embed-text (recommended for our system)
ollama pull nomic-embed-text

# Verify model is available
ollama list
```

### 4. Test the Model
```bash
# Test embedding generation
ollama run nomic-embed-text "Hello, world!"
```

## 🔧 Implementation

### Basic Embedding Service
```typescript
class OllamaEmbeddingService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'nomic-embed-text') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
}
```

### Batch Embedding Generation
```typescript
class BatchEmbeddingService extends OllamaEmbeddingService {
  private batchSize: number;
  private delay: number;

  constructor(batchSize: number = 5, delay: number = 100) {
    super();
    this.batchSize = batchSize;
    this.delay = delay;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(text => this.generateEmbedding(text));
      const batchEmbeddings = await Promise.all(batchPromises);
      
      embeddings.push(...batchEmbeddings);
      
      // Add delay between batches to avoid overwhelming Ollama
      if (i + this.batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    return embeddings;
  }
}
```

### Caching for Performance
```typescript
class CachedEmbeddingService extends OllamaEmbeddingService {
  private cache: Map<string, number[]>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 1000) {
    super();
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // Generate new embedding
    const embedding = await super.generateEmbedding(text);
    
    // Cache the result
    this.cacheEmbedding(text, embedding);
    
    return embedding;
  }

  private cacheEmbedding(text: string, embedding: number[]): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(text, embedding);
  }

  // Preload common embeddings
  async preloadEmbeddings(texts: string[]): Promise<void> {
    const uncachedTexts = texts.filter(text => !this.cache.has(text));
    
    if (uncachedTexts.length > 0) {
      const embeddings = await this.generateBatchEmbeddings(uncachedTexts);
      
      uncachedTexts.forEach((text, index) => {
        this.cache.set(text, embeddings[index]);
      });
    }
  }
}
```

## 📊 Embedding Quality and Performance

### Model Comparison
```typescript
// Different models for different use cases
const EMBEDDING_MODELS = {
  // Best for general text (768 dimensions)
  'nomic-embed-text': {
    dimensions: 768,
    useCase: 'General text embedding',
    performance: 'High',
    size: '274MB'
  },
  
  // Smaller, faster model (384 dimensions)
  'all-minilm': {
    dimensions: 384,
    useCase: 'Fast embedding for simple text',
    performance: 'Very High',
    size: '80MB'
  },
  
  // Multilingual support
  'multilingual-e5-large': {
    dimensions: 1024,
    useCase: 'Multilingual text',
    performance: 'High',
    size: '1.1GB'
  }
};
```

### Quality Testing
```typescript
async function testEmbeddingQuality() {
  const embeddingService = new OllamaEmbeddingService();
  
  // Test similar concepts
  const similarTexts = [
    "I love programming",
    "I enjoy coding",
    "Programming is fun"
  ];
  
  const embeddings = await embeddingService.generateBatchEmbeddings(similarTexts);
  
  // Calculate similarities
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      console.log(`Similarity between "${similarTexts[i]}" and "${similarTexts[j]}": ${similarity}`);
    }
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### Performance Monitoring
```typescript
class MonitoredEmbeddingService extends OllamaEmbeddingService {
  private metrics = {
    totalRequests: 0,
    totalTime: 0,
    averageTime: 0,
    errors: 0
  };

  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      const embedding = await super.generateEmbedding(text);
      
      const duration = Date.now() - startTime;
      this.metrics.totalTime += duration;
      this.metrics.averageTime = this.metrics.totalTime / this.metrics.totalRequests;
      
      return embedding;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.errors / this.metrics.totalRequests,
      requestsPerSecond: this.metrics.totalRequests / (this.metrics.totalTime / 1000)
    };
  }
}
```

## 🔧 Configuration and Optimization

### Environment Configuration
```env
# packages/server/.env
OLLAMA_BASE_URL=http://localhost:11434
MEMORY_EMBEDDING_MODEL=nomic-embed-text
MEMORY_EMBEDDING_DIMENSIONS=768
MEMORY_EMBEDDING_BATCH_SIZE=5
MEMORY_EMBEDDING_DELAY_MS=100
MEMORY_EMBEDDING_CACHE_SIZE=1000
```

### Service Configuration
```typescript
interface EmbeddingConfig {
  baseUrl: string;
  model: string;
  dimensions: number;
  batchSize: number;
  delay: number;
  cacheSize: number;
  timeout: number;
}

const defaultConfig: EmbeddingConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
  dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768'),
  batchSize: parseInt(process.env.MEMORY_EMBEDDING_BATCH_SIZE || '5'),
  delay: parseInt(process.env.MEMORY_EMBEDDING_DELAY_MS || '100'),
  cacheSize: parseInt(process.env.MEMORY_EMBEDDING_CACHE_SIZE || '1000'),
  timeout: 30000
};
```

### Memory System Integration
```typescript
class MemoryEmbeddingService {
  private embeddingService: OllamaEmbeddingService;
  private config: EmbeddingConfig;

  constructor(config: EmbeddingConfig = defaultConfig) {
    this.config = config;
    this.embeddingService = new CachedEmbeddingService(config.cacheSize);
  }

  async generateMemoryEmbedding(memory: {
    content: string;
    concept?: string;
    category?: string;
    tags?: string[];
  }): Promise<number[]> {
    // Combine different parts of memory for better embedding
    const combinedText = [
      memory.content,
      memory.concept,
      memory.category,
      ...(memory.tags || [])
    ].filter(Boolean).join(' ');

    return this.embeddingService.generateEmbedding(combinedText);
  }

  async generateQueryEmbedding(query: string): Promise<number[]> {
    return this.embeddingService.generateEmbedding(query);
  }

  async generateBatchMemoryEmbeddings(memories: any[]): Promise<number[][]> {
    const texts = memories.map(memory => 
      [memory.content, memory.concept, memory.category, ...(memory.tags || [])]
        .filter(Boolean)
        .join(' ')
    );

    return this.embeddingService.generateBatchEmbeddings(texts);
  }
}
```

## 🎯 Real-World Examples

### Example 1: Knowledge Base Embeddings
```typescript
// Store knowledge with embeddings
const knowledgeItems = [
  {
    content: "React hooks allow you to use state and lifecycle features in functional components",
    concept: "React Hooks",
    category: "frontend",
    tags: ["React", "hooks", "functional-components"]
  },
  {
    content: "useState is a React hook that lets you add state to functional components",
    concept: "useState Hook",
    category: "frontend",
    tags: ["React", "useState", "state-management"]
  }
];

const embeddingService = new MemoryEmbeddingService();

// Generate embeddings for all knowledge items
const embeddings = await embeddingService.generateBatchMemoryEmbeddings(knowledgeItems);

// Store in Pinecone with embeddings
for (let i = 0; i < knowledgeItems.length; i++) {
  await storeSemanticMemory({
    id: `knowledge-${i}`,
    ...knowledgeItems[i],
    embedding: embeddings[i]
  });
}
```

### Example 2: User Query Processing
```typescript
// Process user query
const userQuery = "How do I manage state in React components?";

// Generate query embedding
const queryEmbedding = await embeddingService.generateQueryEmbedding(userQuery);

// Search for similar knowledge
const similarKnowledge = await searchSemanticMemory(queryEmbedding, {
  userId: 'user-123',
  threshold: 0.7,
  limit: 5
});

// Results will include both React hooks knowledge items
// even though the query uses different wording
```

### Example 3: Learning Progress Tracking
```typescript
// Track what user has learned
const learningProgress = [
  {
    content: "User successfully implemented useState hook in their React component",
    concept: "useState Implementation",
    category: "learning-progress",
    tags: ["React", "useState", "learning", "progress"]
  },
  {
    content: "User asked about useEffect hook and implemented it correctly",
    concept: "useEffect Learning",
    category: "learning-progress",
    tags: ["React", "useEffect", "learning", "progress"]
  }
];

// Generate embeddings for learning progress
const progressEmbeddings = await embeddingService.generateBatchMemoryEmbeddings(learningProgress);

// Store learning progress
for (let i = 0; i < learningProgress.length; i++) {
  await storeSemanticMemory({
    id: `progress-${Date.now()}-${i}`,
    ...learningProgress[i],
    embedding: progressEmbeddings[i]
  });
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Ollama Not Running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

#### 2. Model Not Found
```bash
# Check available models
ollama list

# Install missing model
ollama pull nomic-embed-text
```

#### 3. Connection Timeout
```typescript
// Add timeout to requests
const response = await fetch(`${this.baseUrl}/api/embeddings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: this.model, prompt: text }),
  signal: AbortSignal.timeout(30000) // 30 second timeout
});
```

#### 4. Memory Issues
```typescript
// Monitor memory usage
class MemoryAwareEmbeddingService extends OllamaEmbeddingService {
  private maxMemoryUsage = 1000; // Max number of cached embeddings

  private cleanupCache(): void {
    if (this.cache.size > this.maxMemoryUsage) {
      // Remove oldest 20% of cache
      const toRemove = Math.floor(this.cache.size * 0.2);
      const keys = Array.from(this.cache.keys()).slice(0, toRemove);
      keys.forEach(key => this.cache.delete(key));
    }
  }
}
```

### Performance Issues

#### 1. Slow Embedding Generation
```typescript
// Use smaller model for faster generation
const fastEmbeddingService = new OllamaEmbeddingService(
  'http://localhost:11434',
  'all-minilm' // Smaller, faster model
);
```

#### 2. High Memory Usage
```typescript
// Implement cache limits
class LimitedCacheEmbeddingService extends OllamaEmbeddingService {
  private maxCacheSize = 500;
  
  private enforceCacheLimit(): void {
    if (this.cache.size > this.maxCacheSize) {
      const keys = Array.from(this.cache.keys());
      const toRemove = keys.slice(0, this.cache.size - this.maxCacheSize);
      toRemove.forEach(key => this.cache.delete(key));
    }
  }
}
```

## 🎯 Best Practices

### 1. Model Selection
- **nomic-embed-text**: Best for general use (768 dimensions)
- **all-minilm**: Fastest for simple text (384 dimensions)
- **multilingual-e5-large**: Best for multilingual content (1024 dimensions)

### 2. Performance Optimization
- **Use caching**: Avoid regenerating same embeddings
- **Batch processing**: Group multiple requests together
- **Appropriate delays**: Don't overwhelm Ollama with requests
- **Monitor resources**: Keep track of memory and CPU usage

### 3. Quality Assurance
- **Test embeddings**: Verify similarity scores make sense
- **Monitor performance**: Track generation times and error rates
- **Regular updates**: Keep Ollama and models updated
- **Backup strategy**: Have fallback models available

### 4. Security
- **Local only**: Never expose Ollama to external networks
- **Input validation**: Sanitize all text inputs
- **Resource limits**: Prevent excessive resource usage
- **Access control**: Secure the Ollama service

## 🚀 Next Steps

Now that you understand Ollama embeddings, explore:

1. **[Memory Examples](./memory-examples.md)** - Practical usage scenarios
2. **[Troubleshooting Guide](./memory-troubleshooting.md)** - Common issues and solutions
3. **[Memory System Overview](./memory-system-overview.md)** - Complete system understanding
4. **[Neo4j Integration](./neo4j-integration.md)** - Episodic memory with graphs

---

*Ready to see it all in action? Check out the [Memory Examples](./memory-examples.md) for practical scenarios!*
