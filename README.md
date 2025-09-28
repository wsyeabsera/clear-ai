# Clear-AI: Unified Memory + Tool Execution + Chat Interface

A comprehensive AI framework that combines memory management, tool execution, and conversational interfaces into a single, intelligent system.

## 🚀 Project Overview

Clear-AI is designed to provide a ChatGPT-like experience with advanced memory capabilities and seamless tool execution. The system intelligently classifies user queries and routes them through the appropriate execution path, whether that's pure conversation, tool execution, or a hybrid approach.

## 🏗️ Architecture

### Current System Components

- **Memory System**: Episodic (Neo4j) + Semantic (Pinecone) memory with Ollama embeddings
- **Tool Execution**: LangChain-based tool execution with MCP support
- **Client Interface**: React-based UI with theme system
- **Shared Package**: Common types, services, and utilities

### Proposed Unified Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Interface                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Chat Window   │  │  Memory Panel   │  │ Tool Status  │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Unified Chat Endpoint                       │
│              `/api/chat/execute`                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Intent Classifier│  │ Memory Context  │  │Tool Executor │ │
│  │                 │  │   Retrieval     │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Memory Service  │  │ Tool Execution  │  │ LLM Service  │ │
│  │ (Neo4j/Pinecone)│  │ (LangChain/MCP) │  │(OpenAI/Ollama)│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Implementation Plan

### Phase 1: Intent Classification System

**Location**: `packages/shared/src/services/IntentClassifierService.ts`

Create an intelligent classifier that determines execution type based on user queries:

```typescript
export interface QueryIntent {
  type: 'memory_chat' | 'tool_execution' | 'hybrid' | 'knowledge_search' | 'conversation'
  confidence: number
  requiredTools?: string[]
  memoryContext?: boolean
  parameters?: Record<string, any>
}
```

**Intent Types**:
- **`memory_chat`**: Pure conversation with memory context
- **`tool_execution`**: Direct tool usage (e.g., "Calculate 5 + 3")
- **`hybrid`**: Tool execution with memory context
- **`knowledge_search`**: Search existing memories/knowledge
- **`conversation`**: General chat without specific intent

### Phase 2: Unified Chat Endpoint

**Location**: `packages/server/src/routes/chatRoutes.ts`

Create a single intelligent endpoint that handles all types of queries:

```typescript
// POST /api/chat/execute
{
  userId: string
  sessionId: string
  message: string
  options?: {
    includeMemory?: boolean
    autoExecuteTools?: boolean
    model?: string
    temperature?: number
  }
}
```

**Response Structure**:
```typescript
{
  success: boolean
  data: {
    response: string
    intent: QueryIntent
    executedTools?: ToolExecutionResult[]
    memoryContext?: MemoryContext
    conversationHistory?: ChatMessage[]
    storedMemory?: EpisodicMemory
  }
}
```

### Phase 3: ChatGPT-like Client Interface

**Location**: `packages/client/src/pages/ChatInterface.tsx`

Build a comprehensive chat interface with:

- **Message History**: Scrollable chat interface with message types
- **Memory Indicators**: Visual cues showing memory usage
- **Tool Execution Status**: Real-time feedback on tool execution
- **Context Panel**: Sidebar with relevant memories and tool results
- **Typing Indicators**: Show AI processing status
- **Streaming Responses**: Real-time response streaming

### Phase 4: Enhanced Memory Integration

**Features**:
- Automatic memory storage for every interaction
- Intelligent context retrieval for each query
- Memory summarization for long conversations
- Cross-session memory persistence
- Memory search and filtering

### Phase 5: Advanced Tool Execution

**Features**:
- Natural language parameter extraction
- Multi-tool workflow execution
- Error handling and retry logic
- Tool result integration into responses
- Tool execution history storage

## 🔧 Technical Implementation

### 1. Intent Classification Service

```typescript
// packages/shared/src/services/IntentClassifierService.ts
export class IntentClassifierService {
  async classifyQuery(query: string, context?: any): Promise<QueryIntent> {
    // Use LLM to analyze query intent
    // Return structured intent classification
  }
}
```

### 2. Unified Chat Controller

```typescript
// packages/server/src/controllers/chatController.ts
export class ChatController {
  async executeQuery(req: Request, res: Response) {
    // 1. Classify intent
    // 2. Retrieve memory context
    // 3. Execute tools if needed
    // 4. Generate response
    // 5. Store conversation
    // 6. Return enriched response
  }
}
```

### 3. Chat Interface Component

```typescript
// packages/client/src/pages/ChatInterface.tsx
export const ChatInterface = () => {
  // State management for messages, memory, tools
  // WebSocket connection for real-time updates
  // UI components for different message types
}
```

## 📋 Development Steps

### Step 1: Create Intent Classifier
- [ ] Define intent types and interfaces
- [ ] Implement LLM-based classification
- [ ] Add confidence scoring
- [ ] Create unit tests

### Step 2: Build Unified Endpoint
- [ ] Create chat routes and controller
- [ ] Integrate intent classification
- [ ] Add memory context retrieval
- [ ] Implement tool execution flow
- [ ] Add response generation

### Step 3: Create Chat Interface
- [ ] Design chat UI components
- [ ] Implement message history
- [ ] Add memory context panel
- [ ] Create tool execution indicators
- [ ] Add streaming response support

### Step 4: Integrate Memory System
- [ ] Connect episodic memory storage
- [ ] Implement semantic memory retrieval
- [ ] Add memory summarization
- [ ] Create memory search functionality

### Step 5: Add Tool Execution
- [ ] Integrate existing tool execution service
- [ ] Add natural language parameter extraction
- [ ] Implement multi-tool workflows
- [ ] Add tool result visualization

### Step 6: Advanced Features
- [ ] Add file upload support
- [ ] Implement image analysis
- [ ] Create conversation export
- [ ] Add memory management UI

## 🎨 User Experience Features

### ChatGPT-like Interface
- **Natural Conversation**: Seamless back-and-forth dialogue
- **Memory Awareness**: "Based on our previous discussion..."
- **Tool Integration**: "I'll calculate that for you using the calculator tool"
- **Context Preservation**: Maintains conversation context across sessions

### Visual Feedback
- **Memory Indicators**: Show when memory is being retrieved/stored
- **Tool Execution Status**: Real-time feedback on tool operations
- **Processing Indicators**: Typing animations and status messages
- **Context Panel**: Sidebar showing relevant memories and tool results

### Advanced Capabilities
- **Multi-Tool Workflows**: "First get the weather, then suggest activities"
- **Memory Search**: "What did we discuss about Python last week?"
- **Knowledge Storage**: Automatically store important information
- **Conversation History**: Full conversation history with search

## 🔌 API Endpoints

### Primary Endpoint
```
POST /api/chat/execute
```

### Supporting Endpoints
```
GET  /api/chat/history/:userId/:sessionId
POST /api/chat/search
GET  /api/chat/memory/:userId
DELETE /api/chat/memory/:userId
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Neo4j Database
- Ollama (for local embeddings)
- OpenAI API Key (optional)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd Clear-AI

# Install dependencies
yarn install

# Setup environment
cp packages/server/env.example packages/server/.env
# Edit .env with your credentials

# Build shared package
yarn build:shared

# Start development servers
yarn dev:server
yarn dev:client
```

### Quick Start
1. Navigate to `http://localhost:5173/chat`
2. Start chatting with the AI
3. Try commands like:
   - "Calculate 5 + 3"
   - "Remember that I like Python programming"
   - "What did we discuss about machine learning?"

## 📚 Documentation

- [Memory System Quick Reference](MEMORY_QUICK_REFERENCE.md)
- [Tool Execution API](packages/server/TOOL_EXECUTION_API.md)
- [Client Components](packages/client/README.md)
- [Shared Services](packages/shared/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the examples in the `examples/` directory

---

**Status**: 🚧 In Development

This README outlines the implementation plan for the unified memory + tool execution + chat interface. The system is designed to provide a ChatGPT-like experience with advanced memory capabilities and seamless tool execution.