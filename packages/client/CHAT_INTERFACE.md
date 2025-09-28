# Clear AI Chat Interface

A ChatGPT-like interface built for the Clear AI system, featuring advanced agent integration with memory and reasoning capabilities.

## Features

### 🧠 Intelligent Chat Interface
- **Real-time messaging** with the advanced AI agent
- **Memory integration** - conversations persist across sessions
- **Reasoning transparency** - see how the AI thinks
- **Intent classification** - understand what the AI detected
- **Session management** - multiple conversation threads
- **Model selection** - choose from available AI models dynamically

### 🎨 Modern UI Components
- **Responsive design** that works on all screen sizes
- **Theme support** - matches the existing Clear AI theme system
- **Collapsible sidebar** for chat history
- **Loading states** and error handling
- **Message metadata** - expandable details for AI responses
- **JSON modal** - View complete API response data with copy functionality

### 🔧 Technical Features
- **TypeScript** - Full type safety
- **React hooks** - Modern React patterns
- **API integration** - Connected to `/api/agent/execute` endpoint
- **Session persistence** - Chat history management
- **Hardcoded user ID** - `clear-ai-user-001` for testing

## Components

### Core Chat Components
- `ChatMessage` - Individual message display with metadata
- `ChatInput` - Message input with auto-resize and shortcuts
- `ChatSidebar` - Session history and management
- `ChatLayout` - Main chat interface layout
- `Chat` - Main page component with API integration
- `ModelSelector` - Dynamic model selection dropdown
- `JsonModal` - Modal for viewing complete API response data

### Navigation
- Added "Chat" link to the main navigation
- Accessible at `/chat` route

## API Integration

### Agent Endpoint
```typescript
POST /api/agent/execute
{
  "query": "User message",
  "options": {
    "userId": "clear-ai-user-001",
    "sessionId": "session-timestamp",
    "includeMemoryContext": true,
    "includeReasoning": true,
    "model": "openai",
    "temperature": 0.7
  }
}
```

### Response Handling
- **Content** - Main AI response text
- **Intent** - Detected intent type and confidence
- **Reasoning** - AI's thought process
- **Memory Context** - Retrieved relevant memories

## Usage

1. **Start the server** - Make sure the Clear AI server is running on port 3001
2. **Navigate to Chat** - Go to `/chat` in the client
3. **Select model** - Choose from available AI models in the status bar
4. **Start chatting** - Type messages and see AI responses with full metadata
5. **Manage sessions** - Create new chats, switch between conversations
6. **View details** - Click "Show Details" on AI responses to see reasoning and memory
7. **View full data** - Click "📄 JSON" button to see complete API response in a modal

## Session Management

- **Automatic session creation** - New sessions start automatically
- **Session titles** - Auto-generated from first message
- **Session persistence** - Chat history maintained during session
- **Session switching** - Easy navigation between conversations
- **Session deletion** - Remove unwanted conversations

## Styling

- **Theme integration** - Uses existing Clear AI theme system
- **Responsive design** - Works on desktop and mobile
- **Accessibility** - Keyboard navigation and screen reader support
- **Dark/light themes** - Supports all Clear AI themes

## Development

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

## Future Enhancements

- [ ] **Real-time streaming** - Stream AI responses as they generate
- [ ] **File uploads** - Support for image and document analysis
- [ ] **Voice input** - Speech-to-text integration
- [ ] **Export conversations** - Save chat history
- [ ] **Advanced memory** - Visual memory management interface
- [ ] **Custom prompts** - User-defined system prompts
- [ ] **Multi-modal** - Support for images and other media types

## Dependencies

- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.0
- TypeScript 5.3.0
- Vite 5.0.8
- Tailwind CSS 3.3.6

## Integration Notes

The chat interface is fully integrated with the existing Clear AI system:
- Uses the same theme system and styling
- Integrates with the existing API service
- Follows the same component patterns
- Maintains consistency with the overall UI/UX
