# 🧠 Working Memory Service - Implementation Guide

## 📋 Overview

The Working Memory Service is the foundation of AgentService v2.0's intelligent conversation management. It maintains the current state of conversations, tracks active goals, and provides context for all other services.

## 🎯 Core Purpose

The Working Memory Service acts as the "short-term memory" of the agent, maintaining:
- Current conversation topic and state
- Active goals and their progress
- User profile and preferences
- Session metadata and context window
- Recent interaction history

## 🏗️ Architecture

### **Service Dependencies**
```typescript
export class WorkingMemoryService {
  private memoryService: MemoryService
  private contextManager: ContextManager
  private langchainService: SimpleLangChainService
}
```

### **Core Interfaces**
```typescript
interface WorkingMemoryContext {
  conversationId: string
  currentTopic: string
  conversationState: ConversationState
  activeGoals: Goal[]
  contextWindow: ContextWindow
  userProfile: UserProfile
  sessionMetadata: SessionMetadata
  lastInteraction: Interaction
  conversationHistory: ConversationTurn[]
}

interface ConversationState {
  state: 'greeting' | 'active' | 'planning' | 'waiting' | 'error_recovery'
  topic: string
  activeGoals: Goal[]
  lastInteraction: Date
  contextRelevance: number
}

interface Goal {
  id: string
  description: string
  priority: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  subgoals: string[]
  successCriteria: string[]
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Implementation Details

### **1. Core Methods**

#### **getWorkingMemory()**
```typescript
async getWorkingMemory(
  userId: string,
  sessionId: string
): Promise<WorkingMemoryContext> {
  try {
    // 1. Get existing memory context
    const memoryContext = await this.memoryService.getMemoryContext(userId, sessionId)
    
    // 2. Build working memory components
    const currentTopic = await this.extractCurrentTopic(memoryContext)
    const conversationState = await this.determineConversationState(memoryContext)
    const activeGoals = await this.extractActiveGoals(memoryContext)
    const contextWindow = await this.buildContextWindow(memoryContext)
    const userProfile = await this.buildUserProfile(userId, memoryContext)
    const sessionMetadata = await this.buildSessionMetadata(sessionId)
    const lastInteraction = await this.getLastInteraction(memoryContext)
    const conversationHistory = await this.getConversationHistory(memoryContext)
    
    return {
      conversationId: sessionId,
      currentTopic,
      conversationState,
      activeGoals,
      contextWindow,
      userProfile,
      sessionMetadata,
      lastInteraction,
      conversationHistory
    }
  } catch (error) {
    throw new Error(`Failed to get working memory: ${error.message}`)
  }
}
```

#### **updateWorkingMemory()**
```typescript
async updateWorkingMemory(
  context: WorkingMemoryContext
): Promise<void> {
  try {
    // 1. Update conversation state
    await this.updateConversationState(context)
    
    // 2. Update active goals
    await this.updateActiveGoals(context.activeGoals)
    
    // 3. Update user profile
    await this.updateUserProfile(context.userProfile)
    
    // 4. Store session metadata
    await this.storeSessionMetadata(context.sessionMetadata)
    
    // 5. Update context window
    await this.updateContextWindow(context.contextWindow)
  } catch (error) {
    throw new Error(`Failed to update working memory: ${error.message}`)
  }
}
```

### **2. Topic Extraction**

#### **extractCurrentTopic()**
```typescript
private async extractCurrentTopic(memoryContext: MemoryContext): Promise<string> {
  try {
    // Get recent conversation memories
    const recentMemories = memoryContext.episodicMemories
      .slice(-5)
      .map(m => m.content)
      .join(' ')
    
    if (!recentMemories.trim()) {
      return 'general conversation'
    }
    
    // Use LLM to extract topic
    const topicPrompt = `
    Analyze this conversation and extract the main topic in 2-3 words:
    
    Conversation: "${recentMemories}"
    
    Return only the topic, no explanation.
    `
    
    const response = await this.langchainService.complete(topicPrompt, {
      model: 'openai',
      temperature: 0.3,
      maxTokens: 50
    })
    
    return response.content.trim() || 'general conversation'
  } catch (error) {
    console.warn('Failed to extract topic:', error.message)
    return 'general conversation'
  }
}
```

### **3. Conversation State Determination**

#### **determineConversationState()**
```typescript
private async determineConversationState(
  memoryContext: MemoryContext
): Promise<ConversationState> {
  try {
    // Analyze conversation patterns
    const patterns = await this.analyzeConversationPatterns(memoryContext)
    
    // Determine state based on patterns
    let state: ConversationState['state'] = 'active'
    
    if (patterns.hasActiveGoal) {
      state = 'planning'
    } else if (patterns.awaitingResponse) {
      state = 'waiting'
    } else if (patterns.hasError) {
      state = 'error_recovery'
    } else if (patterns.isGreeting) {
      state = 'greeting'
    }
    
    return {
      state,
      topic: await this.extractCurrentTopic(memoryContext),
      activeGoals: await this.extractActiveGoals(memoryContext),
      lastInteraction: new Date(),
      contextRelevance: patterns.relevanceScore
    }
  } catch (error) {
    console.warn('Failed to determine conversation state:', error.message)
    return {
      state: 'active',
      topic: 'general conversation',
      activeGoals: [],
      lastInteraction: new Date(),
      contextRelevance: 0.5
    }
  }
}
```

### **4. Goal Management**

#### **extractActiveGoals()**
```typescript
private async extractActiveGoals(memoryContext: MemoryContext): Promise<Goal[]> {
  try {
    // Search for goal-related memories
    const goalMemories = await this.memoryService.searchMemories({
      query: 'goal objective task plan',
      userId: memoryContext.userId,
      type: 'semantic',
      limit: 10
    })
    
    const goals: Goal[] = []
    
    for (const memory of goalMemories.semantic.memories) {
      if (memory.metadata.category === 'Goal' && memory.metadata.status !== 'completed') {
        goals.push({
          id: memory.metadata.goalId || `goal-${Date.now()}`,
          description: memory.description,
          priority: memory.metadata.priority || 1,
          status: memory.metadata.status || 'pending',
          subgoals: memory.metadata.subgoals || [],
          successCriteria: memory.metadata.successCriteria || [],
          createdAt: new Date(memory.metadata.createdAt || Date.now()),
          updatedAt: new Date(memory.metadata.updatedAt || Date.now())
        })
      }
    }
    
    return goals.sort((a, b) => b.priority - a.priority)
  } catch (error) {
    console.warn('Failed to extract active goals:', error.message)
    return []
  }
}
```

### **5. User Profile Building**

#### **buildUserProfile()**
```typescript
private async buildUserProfile(
  userId: string,
  memoryContext: MemoryContext
): Promise<UserProfile> {
  try {
    // Search for user preference memories
    const preferenceMemories = await this.memoryService.searchMemories({
      query: 'preference like dislike style personality',
      userId,
      type: 'semantic',
      limit: 20
    })
    
    const profile: UserProfile = {
      preferences: [],
      communicationStyle: 'conversational',
      formality: 'medium',
      responseLength: 'detailed',
      interests: [],
      expertise: [],
      personality: 'helpful'
    }
    
    // Extract preferences from memories
    for (const memory of preferenceMemories.semantic.memories) {
      if (memory.metadata.category === 'Preference') {
        profile.preferences.push(memory.description)
      } else if (memory.metadata.category === 'Interest') {
        profile.interests.push(memory.description)
      } else if (memory.metadata.category === 'Expertise') {
        profile.expertise.push(memory.description)
      }
    }
    
    // Extract communication style
    const styleMemories = await this.memoryService.searchMemories({
      query: 'communication style formality',
      userId,
      type: 'semantic',
      limit: 5
    })
    
    for (const memory of styleMemories.semantic.memories) {
      if (memory.metadata.communicationStyle) {
        profile.communicationStyle = memory.metadata.communicationStyle
      }
      if (memory.metadata.formality) {
        profile.formality = memory.metadata.formality
      }
    }
    
    return profile
  } catch (error) {
    console.warn('Failed to build user profile:', error.message)
    return {
      preferences: [],
      communicationStyle: 'conversational',
      formality: 'medium',
      responseLength: 'detailed',
      interests: [],
      expertise: [],
      personality: 'helpful'
    }
  }
}
```

## 🔄 Integration Points

### **With Context Manager**
```typescript
// Working Memory provides context for Context Manager
const workingMemory = await this.workingMemoryService.getWorkingMemory(userId, sessionId)
const managedContext = await this.contextManager.manageContext(
  workingMemory,
  newMessage,
  maxTokens
)
```

### **With Reasoning Engine**
```typescript
// Working Memory provides context for reasoning
const workingMemory = await this.workingMemoryService.getWorkingMemory(userId, sessionId)
const reasoning = await this.reasoningEngine.reason(
  query,
  workingMemory,
  availableTools
)
```

### **With Planning System**
```typescript
// Working Memory provides goals and context for planning
const workingMemory = await this.workingMemoryService.getWorkingMemory(userId, sessionId)
const plan = await this.planningSystem.createExecutionPlan(
  query,
  intent,
  workingMemory,
  reasoning
)
```

## 🧪 Testing Strategy

### **Unit Tests**
```typescript
describe('WorkingMemoryService', () => {
  describe('getWorkingMemory', () => {
    it('should return working memory context', async () => {
      const context = await workingMemoryService.getWorkingMemory('user-1', 'session-1')
      expect(context).toHaveProperty('conversationId')
      expect(context).toHaveProperty('currentTopic')
      expect(context).toHaveProperty('conversationState')
    })
    
    it('should handle empty memory context', async () => {
      // Mock empty memory context
      const context = await workingMemoryService.getWorkingMemory('user-1', 'session-1')
      expect(context.currentTopic).toBe('general conversation')
      expect(context.activeGoals).toEqual([])
    })
  })
  
  describe('updateWorkingMemory', () => {
    it('should update working memory context', async () => {
      const context = createMockWorkingMemoryContext()
      await workingMemoryService.updateWorkingMemory(context)
      // Verify updates were applied
    })
  })
})
```

### **Integration Tests**
```typescript
describe('WorkingMemoryService Integration', () => {
  it('should work with Context Manager', async () => {
    const workingMemory = await workingMemoryService.getWorkingMemory('user-1', 'session-1')
    const managedContext = await contextManager.manageContext(workingMemory, 'test message', 8000)
    expect(managedContext).toHaveProperty('activeContext')
  })
})
```

## 📊 Performance Considerations

### **Optimization Strategies**
1. **Caching**: Cache working memory context for active sessions
2. **Lazy Loading**: Load components only when needed
3. **Batch Operations**: Update multiple components in single operation
4. **Memory Compression**: Compress old conversation history

### **Performance Metrics**
- **Response Time**: < 200ms for working memory retrieval
- **Memory Usage**: < 10MB per active session
- **Cache Hit Rate**: > 80% for active sessions
- **Update Latency**: < 100ms for working memory updates

## 🚀 Deployment Considerations

### **Configuration**
```typescript
export const workingMemoryConfig = {
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  maxContextHistory: 50,
  maxActiveGoals: 10,
  topicExtractionModel: 'openai',
  topicExtractionTemperature: 0.3
}
```

### **Monitoring**
- Track working memory retrieval times
- Monitor cache hit rates
- Alert on memory usage spikes
- Track goal completion rates

## 🔧 Troubleshooting

### **Common Issues**
1. **Slow Topic Extraction**: Reduce temperature or use faster model
2. **Memory Leaks**: Implement proper cleanup and monitoring
3. **Goal Tracking Issues**: Verify goal metadata structure
4. **Context Window Overflow**: Implement proper compression

### **Debug Tools**
```typescript
// Debug working memory state
const debugInfo = await workingMemoryService.getDebugInfo(userId, sessionId)
console.log('Working Memory Debug:', debugInfo)
```

---

This implementation guide provides comprehensive details for building the Working Memory Service, which serves as the foundation for all other AgentService v2.0 features.
