# @clear-ai/core

Clear AI - A modern TypeScript framework for building AI-powered applications with tool execution and workflow orchestration.

[![npm version](https://badge.fury.io/js/%40clear-ai%2Fcore.svg)](https://badge.fury.io/js/%40clear-ai%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
npm install @clear-ai/core
```

```typescript
import { ClearAI } from '@clear-ai/core';

// Initialize the framework
const ai = new ClearAI({
  llm: {
    openaiApiKey: 'your-key',
    ollamaBaseUrl: 'http://localhost:11434'
  },
  server: {
    port: 3001
  }
});

// Start everything
await ai.init();
```

## 📦 What's Included

### MCP (Model Context Protocol) - `@clear-ai/mcp`
- **MCPServer** - Full MCP protocol implementation
- **ToolRegistry** - Dynamic tool registration and management
- **Built-in Tools** - API calls, JSON processing, file operations

### Shared Services - `@clear-ai/shared`
- **SimpleLangChainService** - Multi-provider LLM integration
- **ToolExecutionService** - Tool registration and execution
- **SimpleWorkflowService** - Workflow orchestration
- **Logger** - Structured logging utilities

### Server - `@clear-ai/server`
- **Express API** - RESTful endpoints for tool execution
- **Workflow Execution** - LangGraph workflow orchestration
- **Health Monitoring** - System health and status endpoints

### Client - `@clear-ai/client`
- **React Components** - Pre-built UI components
- **Hooks** - Custom React hooks for AI functionality
- **Services** - Frontend service layer

## 🎯 Usage Examples

### Basic Tool Execution

```typescript
import { MCPServer, ToolRegistry } from '@clear-ai/mcp';

const server = new MCPServer();
const tools = server.getToolRegistry();

// Execute an API call
const result = await tools.executeTool('api_call', {
  url: 'https://api.example.com/users/1',
  method: 'GET'
});
```

### LLM Integration

```typescript
import { SimpleLangChainService } from '@clear-ai/shared';

const llm = new SimpleLangChainService({
  openaiApiKey: 'your-key',
  ollamaBaseUrl: 'http://localhost:11434'
});

const response = await llm.complete('Hello, world!', {
  model: 'ollama',
  temperature: 0.7
});
```

### Workflow Execution

```typescript
import { SimpleWorkflowService, ToolExecutionService } from '@clear-ai/shared';

const toolService = new ToolExecutionService(llmConfig);
const workflow = new SimpleWorkflowService(llmConfig, toolService);

const result = await workflow.executeWorkflow(
  'Get weather data and format it nicely'
);
```

### Server API

```typescript
import { createServer } from '@clear-ai/server';

const server = createServer({
  port: 3001,
  mcpConfig: { tools: ['api_call', 'json_reader'] },
  llmConfig: { openaiApiKey: 'your-key' }
});

await server.start();
```

### React Components

```typescript
import { Button, Card, ToolExecutionForm } from '@clear-ai/client';

function MyApp() {
  return (
    <Card>
      <ToolExecutionForm
        onExecute={(tool, args) => {
          // Handle tool execution
        }}
      />
    </Card>
  );
}
```

## 🏗️ Architecture

```
@clear-ai/core
├── @clear-ai/mcp      # Model Context Protocol
├── @clear-ai/shared   # Shared services & utilities
├── @clear-ai/server   # Express API server
└── @clear-ai/client   # React components
```

## 🔧 Configuration

### Environment Variables

```bash
# LLM Configuration
OPENAI_API_KEY=your-key
OLLAMA_BASE_URL=http://localhost:11434
MISTRAL_API_KEY=your-key
GROQ_API_KEY=your-key

# Langfuse (Observability)
LANGFUSE_SECRET_KEY=your-key
LANGFUSE_PUBLIC_KEY=your-key
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Framework Configuration

```typescript
const config: ClearAIConfig = {
  mcp: {
    tools: ['api_call', 'json_reader', 'file_reader']
  },
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY
  },
  server: {
    port: 3001,
    cors: { origin: ['http://localhost:3000'] }
  }
};
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/wsyeabsera/clear-ai.git
cd clear-ai

# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers
npm run dev
```

### Available Scripts

- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages
- `npm run lint` - Run ESLint on all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean all build artifacts

## 📚 Documentation

- **[Getting Started](https://github.com/wsyeabsera/clear-ai/blob/main/research/docs/docs/getting-started/quick-start.md)** - Quick start guide
- **[API Reference](https://github.com/wsyeabsera/clear-ai/blob/main/research/docs/docs/api/overview.md)** - Complete API documentation
- **[Tutorials](https://github.com/wsyeabsera/clear-ai/blob/main/research/docs/docs/tutorials/building-your-first-tool.md)** - Step-by-step tutorials
- **[Architecture](https://github.com/wsyeabsera/clear-ai/blob/main/research/docs/docs/architecture/overview.md)** - System architecture overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) - LLM framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - Tool protocol
- [Express.js](https://expressjs.com/) - Web framework
- [React](https://reactjs.org/) - UI library

## 📞 Support

- 📖 **Documentation**: [GitHub Docs](https://github.com/wsyeabsera/clear-ai/tree/main/research/docs)
- 🐛 **Issues**: [GitHub Issues](https://github.com/wsyeabsera/clear-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/wsyeabsera/clear-ai/discussions)

---

Made with ❤️ by the Clear AI Team