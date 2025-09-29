# 📚 AgentService v2.0 - API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Enhanced AgentService API](#enhanced-agentservice-api)
3. [New Services API](#new-services-api)
4. [Memory Services API](#memory-services-api)
5. [Conversation Flow API](#conversation-flow-api)
6. [Reasoning Engine API](#reasoning-engine-api)
7. [Planning System API](#planning-system-api)
8. [Learning System API](#learning-system-api)
9. [Personality System API](#personality-system-api)
10. [Context Management API](#context-management-api)
11. [Error Handling](#error-handling)
12. [Performance Metrics](#performance-metrics)

## 🎯 Overview

AgentService v2.0 introduces enhanced APIs that build upon the existing v1.0 functionality while adding advanced agentic capabilities. All v1.0 APIs remain fully functional with backward compatibility.

### **API Versioning**
- **v1.0**: Existing APIs (fully supported)
- **v2.0**: Enhanced APIs with new features
- **Backward Compatibility**: 100% maintained

## 🚀 Enhanced AgentService API

### **Core Execute Query (Enhanced)**

```typescript
// Enhanced executeQuery with v2.0 features
POST /api/agent/execute
Content-Type: application/json

{
  "query": "Help me plan a vacation to Japan",
  "options": {
    "userId": "user-123",
    "sessionId": "session-456",
    "includeMemoryContext": true,
    "maxMemoryResults": 10,
    "model": "openai",
    "temperature": 0.7,
    "includeReasoning": true,
    "responseDetailLevel": "full",
    "excludeVectors": false,
    
    // 🆕 v2.0 options
    "enableAdvancedReasoning": true,
    "enablePlanning": true,
    "enableLearning": true,
    "enablePersonality": true,
    "enableContextManagement": true,
    "maxTokens": 8000,
    "conversationContext": {
      "currentTopic": "travel planning",
      "activeGoals": ["plan_japan_vacation"],
      "conversationState": "planning"
    },
    "personalityProfile": {
      "traits": ["helpful", "detailed", "enthusiastic"],
      "style": "conversational",
      "formality": "medium"
    }
  }
}
```

### **Response Format (Enhanced)**

```typescript
interface EnhancedAgentExecutionResult {
  // ✅ Existing fields
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
  
  // 🆕 v2.0 fields
  workingMemory?: WorkingMemoryContext
  reasoning?: ReasoningResult
  plan?: ExecutionPlan
  personality?: PersonalityResponse
  learning?: LearningResult
  conversationState?: ConversationState
  goalProgress?: GoalProgress[]
  contextManagement?: ContextManagementResult
}
```

### **Example Response**

```json
{
  "success": true,
  "response": "I'd be happy to help you plan your vacation to Japan! Based on our previous conversations about your travel preferences, I can see you enjoy cultural experiences and good food. Let me create a comprehensive plan for you.",
  "intent": {
    "type": "hybrid",
    "confidence": 0.95,
    "reasoning": "User is asking for help with vacation planning, which requires both memory context and tool execution"
  },
  "workingMemory": {
    "conversationId": "session-456",
    "currentTopic": "travel planning",
    "conversationState": "planning",
    "activeGoals": [
      {
        "id": "goal-1",
        "description": "Plan Japan vacation",
        "priority": 1,
        "status": "in_progress",
        "subgoals": [
          "Research destinations",
          "Find flights",
          "Book accommodations",
          "Plan itinerary"
        ]
      }
    ],
    "contextWindow": {
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "relevanceScore": 0.9
    },
    "userProfile": {
      "preferences": ["cultural_sites", "food_tourism", "photography"],
      "budget": "medium",
      "travelStyle": "independent"
    }
  },
  "reasoning": {
    "thoughtProcess": {
      "steps": [
        "User wants to plan a vacation to Japan",
        "Need to consider their travel preferences and budget",
        "Should research destinations, flights, and accommodations",
        "Create a detailed itinerary with cultural sites and food recommendations"
      ]
    },
    "logicalConclusions": [
      "Japan offers excellent cultural and food tourism opportunities",
      "User's independent travel style suggests they prefer self-planned itineraries",
      "Budget considerations should include flights, accommodations, and activities"
    ],
    "causalAnalysis": {
      "factors": [
        "Travel preferences → Destination selection",
        "Budget → Accommodation and activity choices",
        "Time of year → Weather and seasonal activities"
      ]
    },
    "confidence": 0.92
  },
  "plan": {
    "goals": [
      {
        "id": "goal-1",
        "description": "Plan comprehensive Japan vacation",
        "priority": 1,
        "successCriteria": ["Complete itinerary", "Booked flights", "Reserved accommodations"]
      }
    ],
    "actions": [
      {
        "id": "action-1",
        "description": "Research Japan destinations",
        "tool": "web_search",
        "parameters": {
          "query": "best places to visit in Japan for cultural tourism",
          "maxResults": 10
        },
        "estimatedDuration": 30000
      },
      {
        "id": "action-2",
        "description": "Find flight options",
        "tool": "flight_search",
        "parameters": {
          "origin": "user_location",
          "destination": "Tokyo",
          "departureDate": "flexible",
          "returnDate": "flexible"
        },
        "estimatedDuration": 45000
      }
    ],
    "estimatedDuration": 180000,
    "successProbability": 0.85
  },
  "personality": {
    "response": "I'd be happy to help you plan your vacation to Japan! Based on our previous conversations about your travel preferences, I can see you enjoy cultural experiences and good food. Let me create a comprehensive plan for you.",
    "personalityTraits": ["helpful", "detailed", "enthusiastic"],
    "consistencyScore": 0.94,
    "styleConfidence": 0.91,
    "emotionalTone": "excited"
  },
  "learning": {
    "patterns": [
      {
        "type": "success_pattern",
        "description": "User responds well to detailed travel planning",
        "confidence": 0.88
      }
    ],
    "insights": [
      "User prefers comprehensive planning over quick suggestions",
      "Cultural and food tourism are high priorities"
    ],
    "behaviorUpdates": [
      {
        "type": "reinforce",
        "behavior": "detailed_planning",
        "action": "increase_usage"
      }
    ]
  },
  "metadata": {
    "executionTime": 2500,
    "memoryRetrieved": 8,
    "toolsExecuted": 2,
    "confidence": 0.92,
    "reasoningTime": 800,
    "planningTime": 600,
    "personalityTime": 300,
    "learningTime": 200
  }
}
```

## 🧠 New Services API

### **Working Memory Service**

```typescript
// Get working memory context
GET /api/agent/working-memory/{userId}/{sessionId}

Response:
{
  "success": true,
  "data": {
    "conversationId": "session-456",
    "currentTopic": "travel planning",
    "conversationState": "planning",
    "activeGoals": [...],
    "contextWindow": {...},
    "userProfile": {...},
    "sessionMetadata": {...}
  }
}

// Update working memory
PUT /api/agent/working-memory/{userId}/{sessionId}
Content-Type: application/json

{
  "currentTopic": "updated topic",
  "conversationState": "active",
  "activeGoals": [...]
}

// Clear working memory
DELETE /api/agent/working-memory/{userId}/{sessionId}
```

### **Context Manager**

```typescript
// Manage context window
POST /api/agent/context/manage
Content-Type: application/json

{
  "userId": "user-123",
  "sessionId": "session-456",
  "newMessage": "Tell me more about Tokyo",
  "maxTokens": 8000
}

Response:
{
  "success": true,
  "data": {
    "activeContext": {...},
    "summary": "Previous conversation about Japan travel planning...",
    "compressionRatio": 0.75,
    "relevanceThreshold": 0.8,
    "tokenUsage": 6500
  }
}
```

## 💬 Conversation Flow API

### **Conversation Flow Controller**

```typescript
// Process message with conversation flow
POST /api/agent/conversation/process
Content-Type: application/json

{
  "userId": "user-123",
  "sessionId": "session-456",
  "message": "What about Kyoto?",
  "options": {
    "enableAdvancedReasoning": true,
    "enablePlanning": true,
    "enablePersonality": true
  }
}

Response:
{
  "success": true,
  "data": {
    "response": "Kyoto is an excellent choice for your Japan trip! It's known for its traditional temples, beautiful gardens, and rich cultural heritage...",
    "conversationState": {
      "state": "planning",
      "topic": "Japan travel planning",
      "activeGoals": [...],
      "lastInteraction": "2024-01-15T10:30:00Z"
    },
    "goalChanges": [
      {
        "type": "updated",
        "goalId": "goal-1",
        "description": "Plan Japan vacation including Kyoto",
        "priority": 1
      }
    ],
    "strategy": "goal_oriented",
    "metadata": {...}
  }
}
```

### **Goal Tracking**

```typescript
// Get active goals
GET /api/agent/goals/{userId}/{sessionId}

// Create new goal
POST /api/agent/goals
Content-Type: application/json

{
  "userId": "user-123",
  "sessionId": "session-456",
  "goal": {
    "description": "Plan Japan vacation",
    "priority": 1,
    "successCriteria": ["Complete itinerary", "Book flights", "Reserve hotels"]
  }
}

// Update goal status
PUT /api/agent/goals/{goalId}
Content-Type: application/json

{
  "status": "completed",
  "progress": 100,
  "notes": "Successfully planned and booked Japan vacation"
}
```

## 🧠 Reasoning Engine API

### **Advanced Reasoning**

```typescript
// Get reasoning for query
POST /api/agent/reasoning/analyze
Content-Type: application/json

{
  "query": "Why should I visit Kyoto instead of Osaka?",
  "context": {...},
  "options": {
    "enableChainOfThought": true,
    "enableLogicalInference": true,
    "enableCausalAnalysis": true,
    "enableAnalogicalReasoning": true
  }
}

Response:
{
  "success": true,
  "data": {
    "thoughtProcess": {
      "steps": [
        "User is comparing Kyoto and Osaka for their Japan trip",
        "Need to consider their travel preferences and interests",
        "Kyoto offers more cultural and historical attractions",
        "Osaka is better for food and nightlife",
        "Based on their profile, Kyoto seems more suitable"
      ]
    },
    "logicalConclusions": [
      "Kyoto has more UNESCO World Heritage sites",
      "User's cultural interests align with Kyoto's offerings",
      "Kyoto provides better photography opportunities"
    ],
    "causalAnalysis": {
      "factors": [
        "Cultural interests → Kyoto preference",
        "Photography hobby → Kyoto's scenic beauty",
        "Food preferences → Both cities offer excellent options"
      ]
    },
    "analogies": [
      {
        "description": "Kyoto is like Rome - rich in history and culture",
        "relevance": 0.85
      }
    ],
    "confidence": 0.89
  }
}
```

## 📋 Planning System API

### **Execution Planning**

```typescript
// Create execution plan
POST /api/agent/planning/create
Content-Type: application/json

{
  "query": "Plan a 7-day Japan itinerary",
  "intent": {...},
  "context": {...},
  "reasoning": {...}
}

Response:
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "goal-1",
        "description": "Create 7-day Japan itinerary",
        "priority": 1,
        "successCriteria": ["Complete day-by-day plan", "Include transportation", "Book accommodations"]
      }
    ],
    "subgoals": [
      {
        "id": "subgoal-1",
        "description": "Research Tokyo attractions",
        "parentGoal": "goal-1",
        "priority": 1
      },
      {
        "id": "subgoal-2",
        "description": "Research Kyoto attractions",
        "parentGoal": "goal-1",
        "priority": 1
      }
    ],
    "actions": [
      {
        "id": "action-1",
        "description": "Research Tokyo attractions",
        "tool": "web_search",
        "parameters": {
          "query": "top attractions in Tokyo for first-time visitors",
          "maxResults": 15
        },
        "estimatedDuration": 30000,
        "dependencies": [],
        "successCriteria": "List of 10+ attractions with details"
      },
      {
        "id": "action-2",
        "description": "Create day-by-day itinerary",
        "tool": "itinerary_creator",
        "parameters": {
          "destinations": ["Tokyo", "Kyoto"],
          "duration": 7,
          "interests": ["culture", "food", "photography"]
        },
        "estimatedDuration": 60000,
        "dependencies": ["action-1"],
        "successCriteria": "Complete 7-day itinerary with daily plans"
      }
    ],
    "resourceAllocation": {
      "estimatedCost": 0,
      "requiredTools": ["web_search", "itinerary_creator"],
      "timeAllocation": {
        "research": 30000,
        "planning": 60000,
        "booking": 45000
      }
    },
    "timeline": {
      "totalDuration": 135000,
      "phases": [
        {
          "name": "Research",
          "duration": 30000,
          "actions": ["action-1"]
        },
        {
          "name": "Planning",
          "duration": 60000,
          "actions": ["action-2"]
        }
      ]
    },
    "fallbackStrategies": [
      {
        "condition": "web_search fails",
        "action": "use_cached_data",
        "description": "Use previously cached attraction data"
      }
    ],
    "estimatedDuration": 135000,
    "successProbability": 0.87,
    "riskAssessment": {
      "high": ["Tool failures"],
      "medium": ["Data quality issues"],
      "low": ["User preference changes"]
    }
  }
}
```

## 🎓 Learning System API

### **Learning Management**

```typescript
// Learn from interaction
POST /api/agent/learning/learn
Content-Type: application/json

{
  "interaction": {
    "query": "Plan a Japan vacation",
    "userId": "user-123",
    "sessionId": "session-456",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "outcome": {
    "success": true,
    "confidence": 0.92,
    "userSatisfaction": 4.5,
    "completionTime": 2500
  }
}

Response:
{
  "success": true,
  "data": {
    "patterns": [
      {
        "type": "success_pattern",
        "description": "User responds well to detailed travel planning",
        "confidence": 0.88,
        "frequency": 3
      }
    ],
    "insights": [
      "User prefers comprehensive planning over quick suggestions",
      "Cultural and food tourism are high priorities",
      "User values detailed explanations and reasoning"
    ],
    "behaviorUpdates": [
      {
        "type": "reinforce",
        "behavior": "detailed_planning",
        "action": "increase_usage",
        "confidence": 0.85
      }
    ],
    "knowledge": [
      {
        "concept": "travel_planning_preference",
        "description": "User prefers detailed, comprehensive travel planning",
        "confidence": 0.88,
        "source": "interaction_analysis"
      }
    ],
    "learningConfidence": 0.87
  }
}

// Get learning insights
GET /api/agent/learning/insights/{userId}?timeWindow=7d

// Get behavior updates
GET /api/agent/learning/behaviors/{userId}?timeWindow=30d
```

## 🎭 Personality System API

### **Personality Management**

```typescript
// Generate personality response
POST /api/agent/personality/generate
Content-Type: application/json

{
  "query": "Tell me about Tokyo",
  "context": {...},
  "reasoning": {...},
  "baseResponse": "Tokyo is the capital of Japan...",
  "personalityProfile": {
    "traits": ["helpful", "detailed", "enthusiastic"],
    "style": "conversational",
    "formality": "medium"
  }
}

Response:
{
  "success": true,
  "data": {
    "response": "Tokyo is absolutely fascinating! As Japan's bustling capital, it's a perfect blend of traditional culture and cutting-edge modernity. Let me share some of the most exciting aspects that make Tokyo such an incredible destination...",
    "personalityTraits": ["helpful", "detailed", "enthusiastic"],
    "consistencyScore": 0.94,
    "styleConfidence": 0.91,
    "emotionalTone": "excited",
    "appliedStyles": [
      "enthusiastic_language",
      "detailed_explanations",
      "helpful_suggestions"
    ]
  }
}

// Get personality profile
GET /api/agent/personality/profile/{userId}

// Update personality profile
PUT /api/agent/personality/profile/{userId}
Content-Type: application/json

{
  "traits": ["helpful", "detailed", "enthusiastic", "patient"],
  "style": "conversational",
  "formality": "medium",
  "preferences": {
    "responseLength": "detailed",
    "explanationDepth": "comprehensive",
    "tone": "enthusiastic"
  }
}
```

## 🧠 Context Management API

### **Context Operations**

```typescript
// Compress context
POST /api/agent/context/compress
Content-Type: application/json

{
  "context": {...},
  "maxTokens": 8000,
  "relevanceThreshold": 0.8
}

Response:
{
  "success": true,
  "data": {
    "compressedContext": {...},
    "summary": "Previous conversation about Japan travel planning...",
    "compressionRatio": 0.75,
    "relevanceThreshold": 0.8,
    "tokenUsage": 6500,
    "removedItems": [
      "Low relevance memories",
      "Old conversation turns"
    ]
  }
}

// Get context summary
GET /api/agent/context/summary/{userId}/{sessionId}

// Update context window
PUT /api/agent/context/window/{userId}/{sessionId}
Content-Type: application/json

{
  "maxTokens": 8000,
  "relevanceThreshold": 0.8,
  "compressionEnabled": true
}
```

## ⚠️ Error Handling

### **Error Response Format**

```typescript
interface ErrorResponse {
  success: false
  error: string
  message: string
  code: string
  details?: {
    service?: string
    method?: string
    parameters?: any
    stackTrace?: string
  }
  suggestions?: string[]
  tools: string[]
}
```

### **Common Error Codes**

```typescript
// Service errors
AGENT_SERVICE_NOT_INITIALIZED = "AGENT_SERVICE_NOT_INITIALIZED"
WORKING_MEMORY_UNAVAILABLE = "WORKING_MEMORY_UNAVAILABLE"
CONTEXT_MANAGEMENT_FAILED = "CONTEXT_MANAGEMENT_FAILED"
REASONING_ENGINE_ERROR = "REASONING_ENGINE_ERROR"
PLANNING_SYSTEM_ERROR = "PLANNING_SYSTEM_ERROR"
LEARNING_SYSTEM_ERROR = "LEARNING_SYSTEM_ERROR"
PERSONALITY_SYSTEM_ERROR = "PERSONALITY_SYSTEM_ERROR"

// Validation errors
INVALID_QUERY = "INVALID_QUERY"
INVALID_OPTIONS = "INVALID_OPTIONS"
INVALID_CONTEXT = "INVALID_CONTEXT"
INVALID_GOAL = "INVALID_GOAL"

// Performance errors
CONTEXT_WINDOW_EXCEEDED = "CONTEXT_WINDOW_EXCEEDED"
REASONING_TIMEOUT = "REASONING_TIMEOUT"
PLANNING_TIMEOUT = "PLANNING_TIMEOUT"
LEARNING_TIMEOUT = "LEARNING_TIMEOUT"
```

### **Error Examples**

```json
{
  "success": false,
  "error": "Context window exceeded",
  "message": "The context window has exceeded the maximum token limit of 8000 tokens",
  "code": "CONTEXT_WINDOW_EXCEEDED",
  "details": {
    "service": "ContextManager",
    "method": "manageContext",
    "parameters": {
      "maxTokens": 8000,
      "currentTokens": 8500
    }
  },
  "suggestions": [
    "Try compressing the context",
    "Reduce the maxMemoryResults parameter",
    "Use a more specific query"
  ],
  "tools": ["ContextManager.compressContext"]
}
```

## 📊 Performance Metrics

### **Response Time Metrics**

```typescript
interface PerformanceMetrics {
  totalExecutionTime: number
  reasoningTime: number
  planningTime: number
  learningTime: number
  personalityTime: number
  contextManagementTime: number
  toolExecutionTime: number
  memoryRetrievalTime: number
}
```

### **Quality Metrics**

```typescript
interface QualityMetrics {
  reasoningConfidence: number
  planningConfidence: number
  learningConfidence: number
  personalityConsistency: number
  contextRelevance: number
  overallConfidence: number
}
```

### **Usage Metrics**

```typescript
interface UsageMetrics {
  totalQueries: number
  successfulQueries: number
  failedQueries: number
  averageResponseTime: number
  memoryUsage: number
  contextCompressionRatio: number
  learningPatternsGenerated: number
  personalityTraitsApplied: number
}
```

---

This API documentation provides comprehensive coverage of all AgentService v2.0 features while maintaining full backward compatibility with v1.0.
