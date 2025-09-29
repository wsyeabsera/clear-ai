# 🔄 AgentService v2.0 - Migration Guide

## 📋 Table of Contents
1. [Migration Overview](#migration-overview)
2. [Backward Compatibility](#backward-compatibility)
3. [Gradual Migration Strategy](#gradual-migration-strategy)
4. [Code Migration Examples](#code-migration-examples)
5. [Configuration Updates](#configuration-updates)
6. [API Migration](#api-migration)
7. [Testing Migration](#testing-migration)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Plan](#rollback-plan)

## 🎯 Migration Overview

AgentService v2.0 is designed to be a **non-breaking upgrade** that enhances existing functionality while adding new intelligent capabilities. This migration guide ensures a smooth transition from v1.0 to v2.0.

### **Migration Principles**
- **Zero Downtime**: Migration can be done without service interruption
- **Backward Compatibility**: All v1.0 APIs continue to work
- **Gradual Adoption**: New features can be enabled incrementally
- **Performance Maintained**: No performance degradation during migration
- **Easy Rollback**: Can revert to v1.0 if needed

## ✅ Backward Compatibility

### **100% API Compatibility**
All existing v1.0 APIs remain fully functional:

```typescript
// ✅ v1.0 API - Still works exactly the same
const result = await agentService.executeQuery("Hello", {
  userId: "user-123",
  sessionId: "session-456",
  includeMemoryContext: true,
  maxMemoryResults: 10
})

// ✅ v1.0 Response format - Still supported
interface AgentExecutionResult {
  success: boolean
  response: string
  intent: QueryIntent
  memoryContext?: MemoryContext
  toolResults?: ToolExecutionResult[]
  reasoning?: string
  metadata?: {
    executionTime: number
    memoryRetrieved: number
    toolsExecuted: number
    confidence: number
  }
}
```

### **Existing Services Unchanged**
- ✅ `MemoryService` - Enhanced, not replaced
- ✅ `IntentClassifierService` - Enhanced, not replaced
- ✅ `SimpleLangChainService` - Enhanced, not replaced
- ✅ `ToolExecutionService` - Enhanced, not replaced
- ✅ `RelationshipAnalysisService` - Enhanced, not replaced
- ✅ `EnhancedSemanticService` - Enhanced, not replaced

## 🚀 Gradual Migration Strategy

### **Phase 1: Foundation (Week 1-2)**
Enable basic v2.0 features without breaking existing functionality.

#### **Step 1: Update Dependencies**
```bash
# Update package.json
npm install @clear-ai/shared@^2.0.0
npm install @clear-ai/server@^2.0.0
```

#### **Step 2: Enable Basic Features**
```typescript
// packages/server/src/config/agent.ts
export const agentConfig = {
  // ✅ Existing config (unchanged)
  memoryService: memoryService,
  intentClassifier: intentClassifier,
  langchainService: langchainService,
  toolRegistry: toolRegistry,
  
  // 🆕 v2.0 features (optional)
  enableWorkingMemory: true,        // Enable working memory
  enableContextManagement: true,    // Enable context management
  enableConversationFlow: false,    // Disable for now
  enableAdvancedReasoning: false,   // Disable for now
  enablePlanning: false,           // Disable for now
  enableLearning: false,           // Disable for now
  enablePersonality: false         // Disable for now
}
```

#### **Step 3: Test Existing Functionality**
```typescript
// Test that all existing APIs still work
describe('Backward Compatibility', () => {
  it('should execute query with v1.0 API', async () => {
    const result = await agentService.executeQuery("Hello", {
      userId: "user-123",
      sessionId: "session-456"
    })
    
    expect(result.success).toBe(true)
    expect(result.response).toBeDefined()
    expect(result.intent).toBeDefined()
  })
})
```

### **Phase 2: Intelligence (Week 3-4)**
Enable reasoning and planning capabilities.

#### **Step 1: Enable Reasoning**
```typescript
// packages/server/src/config/agent.ts
export const agentConfig = {
  // ... existing config
  
  // 🆕 Enable reasoning
  enableAdvancedReasoning: true,
  enablePlanning: true,
  
  // Configuration for new features
  reasoningConfig: {
    enableChainOfThought: true,
    enableLogicalInference: true,
    enableCausalAnalysis: true,
    maxReasoningTime: 5000
  },
  
  planningConfig: {
    enableGoalDecomposition: true,
    enableActionPlanning: true,
    maxPlanningTime: 10000
  }
}
```

#### **Step 2: Update API Calls (Optional)**
```typescript
// Option 1: Use enhanced API with new features
const result = await agentService.executeQuery("Plan a vacation", {
  userId: "user-123",
  sessionId: "session-456",
  enableAdvancedReasoning: true,  // 🆕 New option
  enablePlanning: true,           // 🆕 New option
  includeReasoning: true,         // 🆕 New option
  responseDetailLevel: "full"     // 🆕 New option
})

// Option 2: Continue using v1.0 API (still works)
const result = await agentService.executeQuery("Plan a vacation", {
  userId: "user-123",
  sessionId: "session-456"
})
```

### **Phase 3: Learning & Personality (Week 5-6)**
Enable learning and personality features.

#### **Step 1: Enable Learning**
```typescript
// packages/server/src/config/agent.ts
export const agentConfig = {
  // ... existing config
  
  // 🆕 Enable learning
  enableLearning: true,
  enablePersonality: true,
  
  learningConfig: {
    enablePatternLearning: true,
    enableBehaviorUpdates: true,
    learningThreshold: 0.7
  },
  
  personalityConfig: {
    enablePersonalityTraits: true,
    enableConsistencyChecking: true,
    defaultPersonality: "helpful"
  }
}
```

#### **Step 2: Update Response Handling**
```typescript
// Handle enhanced response format
const result = await agentService.executeQuery("Hello", {
  userId: "user-123",
  sessionId: "session-456",
  enableAdvancedReasoning: true,
  enablePlanning: true,
  enableLearning: true,
  enablePersonality: true
})

// Access new response fields
if (result.reasoning) {
  console.log("Reasoning:", result.reasoning.thoughtProcess)
}

if (result.plan) {
  console.log("Plan:", result.plan.actions)
}

if (result.personality) {
  console.log("Personality:", result.personality.personalityTraits)
}

if (result.learning) {
  console.log("Learning:", result.learning.patterns)
}
```

## 🔧 Code Migration Examples

### **1. Basic Query Execution**

#### **v1.0 Code (Still Works)**
```typescript
// This continues to work exactly the same
const result = await agentService.executeQuery("Hello", {
  userId: "user-123",
  sessionId: "session-456",
  includeMemoryContext: true
})
```

#### **v2.0 Enhanced Code**
```typescript
// Enhanced with new features
const result = await agentService.executeQuery("Hello", {
  userId: "user-123",
  sessionId: "session-456",
  includeMemoryContext: true,
  
  // 🆕 New options
  enableAdvancedReasoning: true,
  enablePlanning: true,
  enableLearning: true,
  enablePersonality: true,
  maxTokens: 8000
})

// Access enhanced response
console.log("Response:", result.response)
console.log("Reasoning:", result.reasoning?.thoughtProcess)
console.log("Plan:", result.plan?.actions)
console.log("Personality:", result.personality?.personalityTraits)
```

### **2. Memory Management**

#### **v1.0 Code (Still Works)**
```typescript
// Existing memory operations continue to work
const memoryContext = await memoryService.getMemoryContext(userId, sessionId)
const searchResults = await memoryService.searchMemories({
  query: "travel",
  userId,
  type: "both",
  limit: 10
})
```

#### **v2.0 Enhanced Code**
```typescript
// Enhanced memory with working memory
const workingMemory = await workingMemoryService.getWorkingMemory(userId, sessionId)
const managedContext = await contextManager.manageContext(
  workingMemory,
  "new message",
  8000
)

// Access enhanced memory
console.log("Current Topic:", workingMemory.currentTopic)
console.log("Active Goals:", workingMemory.activeGoals)
console.log("User Profile:", workingMemory.userProfile)
```

### **3. Tool Execution**

#### **v1.0 Code (Still Works)**
```typescript
// Existing tool execution continues to work
const toolResult = await toolExecutionService.executeTool("calculator", {
  operation: "add",
  a: 5,
  b: 3
})
```

#### **v2.0 Enhanced Code**
```typescript
// Enhanced tool execution with planning
const plan = await planningSystem.createExecutionPlan(
  "Calculate compound interest",
  intent,
  context,
  reasoning
)

// Execute with plan
const result = await agentService.executeQuery("Calculate compound interest", {
  userId: "user-123",
  sessionId: "session-456",
  enablePlanning: true
})

// Access plan information
console.log("Execution Plan:", result.plan?.actions)
console.log("Estimated Duration:", result.plan?.estimatedDuration)
console.log("Success Probability:", result.plan?.successProbability)
```

### **4. Error Handling**

#### **v1.0 Code (Still Works)**
```typescript
// Existing error handling continues to work
try {
  const result = await agentService.executeQuery("Hello", options)
  if (!result.success) {
    console.error("Query failed:", result.response)
  }
} catch (error) {
  console.error("Error:", error.message)
}
```

#### **v2.0 Enhanced Code**
```typescript
// Enhanced error handling with more details
try {
  const result = await agentService.executeQuery("Hello", options)
  if (!result.success) {
    console.error("Query failed:", result.response)
    
    // Access enhanced error information
    if (result.reasoning?.confidence < 0.5) {
      console.error("Low confidence reasoning:", result.reasoning)
    }
    
    if (result.plan?.successProbability < 0.5) {
      console.error("Low success probability:", result.plan)
    }
  }
} catch (error) {
  console.error("Error:", error.message)
  
  // Enhanced error details
  if (error.details) {
    console.error("Service:", error.details.service)
    console.error("Method:", error.details.method)
    console.error("Suggestions:", error.suggestions)
  }
}
```

## ⚙️ Configuration Updates

### **1. Agent Service Configuration**

#### **v1.0 Configuration (Still Works)**
```typescript
// packages/server/src/config/agent.ts
export const agentConfig: AgentServiceConfig = {
  memoryService: memoryService,
  intentClassifier: intentClassifier,
  langchainService: langchainService,
  toolRegistry: toolRegistry,
  defaultOptions: {
    includeMemoryContext: true,
    maxMemoryResults: 10,
    model: 'openai',
    temperature: 0.7
  }
}
```

#### **v2.0 Enhanced Configuration**
```typescript
// packages/server/src/config/agent.ts
export const agentConfig: EnhancedAgentServiceConfig = {
  // ✅ Existing config (unchanged)
  memoryService: memoryService,
  intentClassifier: intentClassifier,
  langchainService: langchainService,
  toolRegistry: toolRegistry,
  defaultOptions: {
    includeMemoryContext: true,
    maxMemoryResults: 10,
    model: 'openai',
    temperature: 0.7
  },
  
  // 🆕 v2.0 enhancements
  enableWorkingMemory: true,
  enableContextManagement: true,
  enableConversationFlow: true,
  enableAdvancedReasoning: true,
  enablePlanning: true,
  enableLearning: true,
  enablePersonality: true,
  
  // New service configurations
  workingMemoryConfig: {
    maxContextWindow: 50,
    topicExtractionEnabled: true,
    goalTrackingEnabled: true
  },
  
  contextManagementConfig: {
    maxTokens: 8000,
    compressionEnabled: true,
    relevanceThreshold: 0.8
  },
  
  reasoningConfig: {
    enableChainOfThought: true,
    enableLogicalInference: true,
    enableCausalAnalysis: true,
    maxReasoningTime: 5000
  },
  
  planningConfig: {
    enableGoalDecomposition: true,
    enableActionPlanning: true,
    maxPlanningTime: 10000
  },
  
  learningConfig: {
    enablePatternLearning: true,
    enableBehaviorUpdates: true,
    learningThreshold: 0.7
  },
  
  personalityConfig: {
    enablePersonalityTraits: true,
    enableConsistencyChecking: true,
    defaultPersonality: "helpful"
  }
}
```

### **2. Environment Variables**

#### **v1.0 Environment (Still Works)**
```bash
# Existing environment variables continue to work
OPENAI_API_KEY=your_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
PINECONE_API_KEY=your_key
PINECONE_ENVIRONMENT=your_env
```

#### **v2.0 Enhanced Environment**
```bash
# ✅ Existing environment variables (unchanged)
OPENAI_API_KEY=your_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
PINECONE_API_KEY=your_key
PINECONE_ENVIRONMENT=your_env

# 🆕 New environment variables (optional)
AGENT_V2_FEATURES_ENABLED=true
AGENT_MAX_TOKENS=8000
AGENT_REASONING_TIMEOUT=5000
AGENT_PLANNING_TIMEOUT=10000
AGENT_LEARNING_ENABLED=true
AGENT_PERSONALITY_ENABLED=true
```

## 🔌 API Migration

### **1. REST API Endpoints**

#### **v1.0 Endpoints (Still Work)**
```typescript
// Existing endpoints continue to work
POST /api/agent/execute
GET /api/agent/status
POST /api/agent/initialize
```

#### **v2.0 Enhanced Endpoints**
```typescript
// ✅ Existing endpoints (unchanged)
POST /api/agent/execute
GET /api/agent/status
POST /api/agent/initialize

// 🆕 New endpoints
GET /api/agent/working-memory/{userId}/{sessionId}
PUT /api/agent/working-memory/{userId}/{sessionId}
DELETE /api/agent/working-memory/{userId}/{sessionId}

POST /api/agent/context/manage
GET /api/agent/context/summary/{userId}/{sessionId}
PUT /api/agent/context/window/{userId}/{sessionId}

POST /api/agent/conversation/process
GET /api/agent/goals/{userId}/{sessionId}
POST /api/agent/goals
PUT /api/agent/goals/{goalId}

POST /api/agent/reasoning/analyze
POST /api/agent/planning/create
POST /api/agent/learning/learn
GET /api/agent/learning/insights/{userId}

POST /api/agent/personality/generate
GET /api/agent/personality/profile/{userId}
PUT /api/agent/personality/profile/{userId}
```

### **2. Request/Response Format**

#### **v1.0 Format (Still Supported)**
```json
{
  "query": "Hello",
  "options": {
    "userId": "user-123",
    "sessionId": "session-456",
    "includeMemoryContext": true
  }
}
```

#### **v2.0 Enhanced Format**
```json
{
  "query": "Hello",
  "options": {
    "userId": "user-123",
    "sessionId": "session-456",
    "includeMemoryContext": true,
    "enableAdvancedReasoning": true,
    "enablePlanning": true,
    "enableLearning": true,
    "enablePersonality": true,
    "maxTokens": 8000,
    "conversationContext": {
      "currentTopic": "greeting",
      "conversationState": "active"
    }
  }
}
```

## 🧪 Testing Migration

### **1. Unit Tests**

#### **v1.0 Tests (Still Work)**
```typescript
// Existing tests continue to work
describe('AgentService v1.0', () => {
  it('should execute query', async () => {
    const result = await agentService.executeQuery("Hello", {
      userId: "user-123",
      sessionId: "session-456"
    })
    
    expect(result.success).toBe(true)
    expect(result.response).toBeDefined()
  })
})
```

#### **v2.0 Enhanced Tests**
```typescript
// Enhanced tests with new features
describe('AgentService v2.0', () => {
  it('should execute query with reasoning', async () => {
    const result = await agentService.executeQuery("Hello", {
      userId: "user-123",
      sessionId: "session-456",
      enableAdvancedReasoning: true
    })
    
    expect(result.success).toBe(true)
    expect(result.response).toBeDefined()
    expect(result.reasoning).toBeDefined()
    expect(result.reasoning.thoughtProcess).toBeDefined()
  })
  
  it('should execute query with planning', async () => {
    const result = await agentService.executeQuery("Plan a vacation", {
      userId: "user-123",
      sessionId: "session-456",
      enablePlanning: true
    })
    
    expect(result.success).toBe(true)
    expect(result.plan).toBeDefined()
    expect(result.plan.actions).toBeDefined()
  })
})
```

### **2. Integration Tests**

```typescript
describe('AgentService v2.0 Integration', () => {
  it('should maintain backward compatibility', async () => {
    // Test that v1.0 API still works
    const v1Result = await agentService.executeQuery("Hello", {
      userId: "user-123",
      sessionId: "session-456"
    })
    
    expect(v1Result.success).toBe(true)
    expect(v1Result.response).toBeDefined()
  })
  
  it('should provide enhanced features', async () => {
    // Test that v2.0 features work
    const v2Result = await agentService.executeQuery("Hello", {
      userId: "user-123",
      sessionId: "session-456",
      enableAdvancedReasoning: true,
      enablePlanning: true,
      enableLearning: true,
      enablePersonality: true
    })
    
    expect(v2Result.success).toBe(true)
    expect(v2Result.reasoning).toBeDefined()
    expect(v2Result.plan).toBeDefined()
    expect(v2Result.personality).toBeDefined()
  })
})
```

## ⚡ Performance Considerations

### **1. Memory Usage**

#### **v1.0 Memory Usage**
- Base memory: ~50MB per session
- Context window: ~2K tokens
- Memory retrieval: ~100ms

#### **v2.0 Memory Usage**
- Base memory: ~75MB per session (+50%)
- Context window: ~8K tokens (+300%)
- Memory retrieval: ~150ms (+50%)
- Working memory: ~25MB per session

### **2. Response Time**

#### **v1.0 Response Time**
- Simple queries: ~1-2 seconds
- Complex queries: ~3-5 seconds
- Tool execution: ~2-4 seconds

#### **v2.0 Response Time**
- Simple queries: ~1.5-2.5 seconds (+25%)
- Complex queries: ~4-6 seconds (+20%)
- Tool execution: ~2.5-5 seconds (+25%)
- Reasoning: +500ms
- Planning: +1000ms
- Learning: +200ms

### **3. Optimization Strategies**

```typescript
// Optimize for performance
const agentConfig = {
  // ... existing config
  
  // Performance optimizations
  contextManagementConfig: {
    maxTokens: 6000,  // Reduce from 8000
    compressionEnabled: true,
    relevanceThreshold: 0.9  // Increase from 0.8
  },
  
  reasoningConfig: {
    enableChainOfThought: true,
    enableLogicalInference: false,  // Disable for performance
    enableCausalAnalysis: false,    // Disable for performance
    maxReasoningTime: 3000  // Reduce from 5000
  },
  
  planningConfig: {
    enableGoalDecomposition: true,
    enableActionPlanning: false,  // Disable for performance
    maxPlanningTime: 5000  // Reduce from 10000
  }
}
```

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Feature Not Available**
```typescript
// Error: Feature not enabled
{
  "success": false,
  "error": "Feature not enabled",
  "message": "Advanced reasoning is not enabled",
  "code": "FEATURE_NOT_ENABLED"
}

// Solution: Enable feature in config
const agentConfig = {
  enableAdvancedReasoning: true
}
```

#### **2. Performance Issues**
```typescript
// Error: Response timeout
{
  "success": false,
  "error": "Response timeout",
  "message": "Query execution exceeded timeout",
  "code": "RESPONSE_TIMEOUT"
}

// Solution: Increase timeout or optimize config
const agentConfig = {
  reasoningConfig: {
    maxReasoningTime: 10000  // Increase timeout
  }
}
```

#### **3. Memory Issues**
```typescript
// Error: Context window exceeded
{
  "success": false,
  "error": "Context window exceeded",
  "message": "Context window exceeded maximum tokens",
  "code": "CONTEXT_WINDOW_EXCEEDED"
}

// Solution: Reduce context or enable compression
const agentConfig = {
  contextManagementConfig: {
    maxTokens: 6000,  // Reduce max tokens
    compressionEnabled: true
  }
}
```

### **Debug Mode**

```typescript
// Enable debug mode for troubleshooting
const agentConfig = {
  debugMode: true,
  logLevel: 'debug',
  performanceMonitoring: true
}

// Check performance metrics
const result = await agentService.executeQuery("Hello", options)
console.log("Performance:", result.metadata)
```

## 🔄 Rollback Plan

### **1. Quick Rollback (5 minutes)**

```bash
# Revert to v1.0 configuration
export AGENT_V2_FEATURES_ENABLED=false

# Restart service
npm run restart
```

### **2. Full Rollback (15 minutes)**

```bash
# Revert to v1.0 package version
npm install @clear-ai/shared@^1.0.0
npm install @clear-ai/server@^1.0.0

# Restart service
npm run restart
```

### **3. Database Rollback**

```typescript
// Clear v2.0 specific data if needed
await memoryService.clearWorkingMemory(userId, sessionId)
await memoryService.clearProceduralMemory(userId)
await memoryService.clearEmotionalMemory(userId)
```

### **4. Rollback Verification**

```typescript
// Verify rollback success
const result = await agentService.executeQuery("Hello", {
  userId: "user-123",
  sessionId: "session-456"
})

// Should work exactly like v1.0
expect(result.success).toBe(true)
expect(result.reasoning).toBeUndefined()  // v2.0 features should be gone
expect(result.plan).toBeUndefined()
expect(result.personality).toBeUndefined()
```

---

This migration guide ensures a smooth transition from AgentService v1.0 to v2.0 while maintaining full backward compatibility and providing a clear path for adopting new features.
