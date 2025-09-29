# 🧠 Context Management - Implementation Guide

## 📋 Overview

The Context Management system is responsible for intelligently managing the context window, ensuring optimal token usage while maintaining conversation continuity and relevance. It acts as the "memory manager" of the agent, deciding what information to keep, compress, or discard.

## 🎯 Core Purpose

The Context Manager handles:
- Token budget management and optimization
- Context window compression and summarization
- Relevance-based filtering of memories
- Conversation continuity maintenance
- Smart context prioritization

## 🏗️ Architecture

### **Service Dependencies**
```typescript
export class ContextManager {
  private memoryService: MemoryService
  private langchainService: SimpleLangChainService
  private workingMemoryService: WorkingMemoryService
}
```

### **Core Interfaces**
```typescript
interface ManagedContext {
  activeContext: WorkingMemoryContext
  summary: string
  compressionRatio: number
  relevanceThreshold: number
  tokenUsage: number
  removedItems: string[]
  priorityItems: PriorityItem[]
}

interface CompressedContext {
  originalContext: MemoryContext
  compressedContext: MemoryContext
  summary: string
  compressionRatio: number
  relevanceScores: RelevanceScore[]
  removedMemories: Memory[]
  keptMemories: Memory[]
}

interface RelevanceScore {
  memoryId: string
  relevance: number
  category: string
  importance: number
  recency: number
  contextRelevance: number
}
```

## 🔧 Implementation Details

### **1. Core Methods**

#### **manageContext()**
```typescript
async manageContext(
  currentContext: WorkingMemoryContext,
  newMessage: string,
  maxTokens: number
): Promise<ManagedContext> {
  try {
    // 1. Calculate current token usage
    const currentTokens = await this.calculateTokenUsage(currentContext)
    
    // 2. If within limits, return current context
    if (currentTokens <= maxTokens) {
      return {
        activeContext: currentContext,
        summary: '',
        compressionRatio: 1.0,
        relevanceThreshold: 0.8,
        tokenUsage: currentTokens,
        removedItems: [],
        priorityItems: []
      }
    }
    
    // 3. Calculate relevance scores for all memories
    const relevanceScores = await this.calculateRelevanceScores(
      currentContext,
      newMessage
    )
    
    // 4. Compress context based on relevance
    const compressedContext = await this.compressContext(
      currentContext,
      relevanceScores,
      maxTokens
    )
    
    // 5. Generate summary of removed items
    const summary = await this.generateContextSummary(compressedContext)
    
    return {
      activeContext: compressedContext.activeContext,
      summary: summary,
      compressionRatio: compressedContext.compressionRatio,
      relevanceThreshold: 0.8,
      tokenUsage: compressedContext.tokenUsage,
      removedItems: compressedContext.removedMemories.map(m => m.content),
      priorityItems: compressedContext.priorityItems
    }
  } catch (error) {
    throw new Error(`Failed to manage context: ${error.message}`)
  }
}
```

#### **compressContext()**
```typescript
async compressContext(
  context: MemoryContext,
  relevanceScores: RelevanceScore[],
  maxTokens: number
): Promise<CompressedContext> {
  try {
    // 1. Sort memories by relevance score
    const sortedMemories = context.episodicMemories
      .map(memory => ({
        memory,
        relevance: relevanceScores.find(s => s.memoryId === memory.id)?.relevance || 0
      }))
      .sort((a, b) => b.relevance - a.relevance)
    
    // 2. Select memories to keep based on token budget
    const keptMemories: Memory[] = []
    const removedMemories: Memory[] = []
    let currentTokens = 0
    
    for (const { memory, relevance } of sortedMemories) {
      const memoryTokens = await this.calculateTokenUsage(memory.content)
      
      if (currentTokens + memoryTokens <= maxTokens && relevance > 0.5) {
        keptMemories.push(memory)
        currentTokens += memoryTokens
      } else {
        removedMemories.push(memory)
      }
    }
    
    // 3. Compress remaining memories if still over budget
    const compressedMemories = await this.compressMemories(keptMemories, maxTokens - currentTokens)
    
    // 4. Generate summary of removed content
    const summary = await this.generateRemovedContentSummary(removedMemories)
    
    return {
      originalContext: context,
      compressedContext: {
        ...context,
        episodicMemories: compressedMemories
      },
      summary,
      compressionRatio: keptMemories.length / context.episodicMemories.length,
      relevanceScores,
      removedMemories,
      keptMemories: compressedMemories
    }
  } catch (error) {
    throw new Error(`Failed to compress context: ${error.message}`)
  }
}
```

### **2. Relevance Calculation**

#### **calculateRelevanceScores()**
```typescript
private async calculateRelevanceScores(
  context: WorkingMemoryContext,
  newMessage: string
): Promise<RelevanceScore[]> {
  try {
    const scores: RelevanceScore[] = []
    
    // Get all memories from context
    const allMemories = [
      ...context.conversationHistory,
      ...context.activeGoals.map(g => ({ content: g.description, id: g.id }))
    ]
    
    for (const memory of allMemories) {
      // Calculate different relevance factors
      const semanticRelevance = await this.calculateSemanticRelevance(
        memory.content,
        newMessage
      )
      
      const recencyScore = this.calculateRecencyScore(memory.timestamp || new Date())
      
      const importanceScore = this.calculateImportanceScore(memory)
      
      const contextRelevance = this.calculateContextRelevance(
        memory,
        context.currentTopic
      )
      
      // Weighted combination of factors
      const overallRelevance = (
        semanticRelevance * 0.4 +
        recencyScore * 0.2 +
        importanceScore * 0.2 +
        contextRelevance * 0.2
      )
      
      scores.push({
        memoryId: memory.id,
        relevance: overallRelevance,
        category: memory.category || 'conversation',
        importance: importanceScore,
        recency: recencyScore,
        contextRelevance
      })
    }
    
    return scores
  } catch (error) {
    console.warn('Failed to calculate relevance scores:', error.message)
    return []
  }
}
```

#### **calculateSemanticRelevance()**
```typescript
private async calculateSemanticRelevance(
  memoryContent: string,
  newMessage: string
): Promise<number> {
  try {
    const prompt = `
    Calculate the semantic relevance between these two texts on a scale of 0-1:
    
    Memory: "${memoryContent}"
    New Message: "${newMessage}"
    
    Consider:
    - Topic similarity
    - Concept overlap
    - Contextual relationship
    - Information relevance
    
    Return only a number between 0 and 1.
    `
    
    const response = await this.langchainService.complete(prompt, {
      model: 'openai',
      temperature: 0.1,
      maxTokens: 10
    })
    
    const relevance = parseFloat(response.content.trim())
    return isNaN(relevance) ? 0 : Math.max(0, Math.min(1, relevance))
  } catch (error) {
    console.warn('Failed to calculate semantic relevance:', error.message)
    return 0.5
  }
}
```

### **3. Memory Compression**

#### **compressMemories()**
```typescript
private async compressMemories(
  memories: Memory[],
  availableTokens: number
): Promise<Memory[]> {
  try {
    if (memories.length === 0) return []
    
    // Group memories by category
    const groupedMemories = this.groupMemoriesByCategory(memories)
    
    const compressedMemories: Memory[] = []
    let remainingTokens = availableTokens
    
    // Process each category
    for (const [category, categoryMemories] of Object.entries(groupedMemories)) {
      if (remainingTokens <= 0) break
      
      // Compress category memories
      const compressedCategory = await this.compressCategoryMemories(
        categoryMemories,
        remainingTokens
      )
      
      compressedMemories.push(...compressedCategory.memories)
      remainingTokens -= compressedCategory.tokenUsage
    }
    
    return compressedMemories
  } catch (error) {
    console.warn('Failed to compress memories:', error.message)
    return memories.slice(0, 5) // Fallback to first 5 memories
  }
}
```

#### **compressCategoryMemories()**
```typescript
private async compressCategoryMemories(
  memories: Memory[],
  maxTokens: number
): Promise<{ memories: Memory[], tokenUsage: number }> {
  try {
    if (memories.length === 0) return { memories: [], tokenUsage: 0 }
    
    // If only one memory, compress it directly
    if (memories.length === 1) {
      const compressed = await this.compressSingleMemory(memories[0], maxTokens)
      return { memories: [compressed], tokenUsage: compressed.tokenUsage }
    }
    
    // For multiple memories, create a summary
    const summary = await this.createCategorySummary(memories)
    const summaryTokens = await this.calculateTokenUsage(summary)
    
    if (summaryTokens <= maxTokens) {
      return {
        memories: [{
          id: `summary-${Date.now()}`,
          content: summary,
          timestamp: new Date(),
          category: memories[0].category,
          tokenUsage: summaryTokens
        }],
        tokenUsage: summaryTokens
      }
    }
    
    // If summary is too long, select most important memories
    const sortedMemories = memories.sort((a, b) => 
      (b.importance || 0) - (a.importance || 0)
    )
    
    const selectedMemories: Memory[] = []
    let currentTokens = 0
    
    for (const memory of sortedMemories) {
      const memoryTokens = await this.calculateTokenUsage(memory.content)
      if (currentTokens + memoryTokens <= maxTokens) {
        selectedMemories.push(memory)
        currentTokens += memoryTokens
      } else {
        break
      }
    }
    
    return { memories: selectedMemories, tokenUsage: currentTokens }
  } catch (error) {
    console.warn('Failed to compress category memories:', error.message)
    return { memories: memories.slice(0, 1), tokenUsage: 0 }
  }
}
```

### **4. Token Management**

#### **calculateTokenUsage()**
```typescript
private async calculateTokenUsage(content: string): Promise<number> {
  try {
    // Use tiktoken for accurate token counting
    const encoding = await import('tiktoken')
    const tokenizer = encoding.get_encoding('cl100k_base')
    return tokenizer.encode(content).length
  } catch (error) {
    // Fallback to approximate calculation
    return Math.ceil(content.length / 4)
  }
}
```

#### **calculateRecencyScore()**
```typescript
private calculateRecencyScore(timestamp: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  // Exponential decay: more recent = higher score
  return Math.exp(-diffHours / 24) // 24-hour half-life
}
```

### **5. Context Summarization**

#### **generateContextSummary()**
```typescript
private async generateContextSummary(
  compressedContext: CompressedContext
): Promise<string> {
  try {
    if (compressedContext.removedMemories.length === 0) {
      return ''
    }
    
    const removedContent = compressedContext.removedMemories
      .map(m => m.content)
      .join('\n')
    
    const prompt = `
    Create a concise summary of this removed conversation content:
    
    ${removedContent}
    
    Focus on:
    - Key topics discussed
    - Important decisions made
    - Relevant context for future conversations
    
    Keep it under 100 words.
    `
    
    const response = await this.langchainService.complete(prompt, {
      model: 'openai',
      temperature: 0.3,
      maxTokens: 150
    })
    
    return response.content.trim()
  } catch (error) {
    console.warn('Failed to generate context summary:', error.message)
    return 'Previous conversation context removed due to token limits.'
  }
}
```

## 🔄 Integration Points

### **With Working Memory Service**
```typescript
// Context Manager uses Working Memory for context
const workingMemory = await this.workingMemoryService.getWorkingMemory(userId, sessionId)
const managedContext = await this.contextManager.manageContext(
  workingMemory,
  newMessage,
  maxTokens
)
```

### **With Reasoning Engine**
```typescript
// Context Manager provides compressed context for reasoning
const managedContext = await this.contextManager.manageContext(workingMemory, query, 8000)
const reasoning = await this.reasoningEngine.reason(
  query,
  managedContext.activeContext,
  availableTools
)
```

### **With Planning System**
```typescript
// Context Manager ensures optimal context for planning
const managedContext = await this.contextManager.manageContext(workingMemory, query, 8000)
const plan = await this.planningSystem.createExecutionPlan(
  query,
  intent,
  managedContext.activeContext,
  reasoning
)
```

## 🧪 Testing Strategy

### **Unit Tests**
```typescript
describe('ContextManager', () => {
  describe('manageContext', () => {
    it('should return context when within token limits', async () => {
      const context = createMockWorkingMemoryContext()
      const result = await contextManager.manageContext(context, 'test message', 8000)
      expect(result.compressionRatio).toBe(1.0)
      expect(result.removedItems).toEqual([])
    })
    
    it('should compress context when over token limits', async () => {
      const context = createLargeWorkingMemoryContext()
      const result = await contextManager.manageContext(context, 'test message', 1000)
      expect(result.compressionRatio).toBeLessThan(1.0)
      expect(result.removedItems.length).toBeGreaterThan(0)
    })
  })
  
  describe('calculateRelevanceScores', () => {
    it('should calculate relevance scores correctly', async () => {
      const context = createMockWorkingMemoryContext()
      const scores = await contextManager.calculateRelevanceScores(context, 'test message')
      expect(scores).toHaveLength(context.conversationHistory.length)
      expect(scores.every(s => s.relevance >= 0 && s.relevance <= 1)).toBe(true)
    })
  })
})
```

### **Integration Tests**
```typescript
describe('ContextManager Integration', () => {
  it('should work with Working Memory Service', async () => {
    const workingMemory = await workingMemoryService.getWorkingMemory('user-1', 'session-1')
    const managedContext = await contextManager.manageContext(workingMemory, 'test', 8000)
    expect(managedContext.activeContext).toBeDefined()
  })
})
```

## 📊 Performance Considerations

### **Optimization Strategies**
1. **Caching**: Cache relevance scores and compressed contexts
2. **Batch Processing**: Process multiple memories in parallel
3. **Smart Compression**: Use different compression strategies based on content type
4. **Token Estimation**: Use fast token estimation for initial filtering

### **Performance Metrics**
- **Compression Time**: < 500ms for large contexts
- **Token Accuracy**: > 95% accuracy in token counting
- **Relevance Accuracy**: > 80% accuracy in relevance scoring
- **Memory Usage**: < 50MB for context management

## 🚀 Deployment Considerations

### **Configuration**
```typescript
export const contextManagerConfig = {
  maxTokens: 8000,
  relevanceThreshold: 0.5,
  compressionEnabled: true,
  summaryEnabled: true,
  tokenCountingMethod: 'tiktoken',
  compressionStrategy: 'relevance_based'
}
```

### **Monitoring**
- Track compression ratios
- Monitor token usage accuracy
- Alert on context window overflows
- Track relevance scoring accuracy

## 🔧 Troubleshooting

### **Common Issues**
1. **Token Count Inaccuracy**: Use tiktoken instead of approximation
2. **Poor Compression**: Adjust relevance thresholds
3. **Context Loss**: Implement better summarization
4. **Performance Issues**: Add caching and parallel processing

### **Debug Tools**
```typescript
// Debug context management
const debugInfo = await contextManager.getDebugInfo(context, newMessage, maxTokens)
console.log('Context Debug:', debugInfo)
```

---

This implementation guide provides comprehensive details for building the Context Management system, which ensures optimal token usage while maintaining conversation quality and continuity.
