# clear-ai

Clear AI - A modern TypeScript framework for building AI-powered applications with tool execution and workflow orchestration. Perfect for CLI tools, APIs, and server applications.

[![npm version](https://badge.fury.io/js/clear-ai.svg)](https://badge.fury.io/js/clear-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/Documentation-Clear%20AI-blue)](https://wsyeabsera.github.io/clear-ai/docs/intro)

## 📚 Documentation

**📖 [Full Documentation](https://wsyeabsera.github.io/clear-ai/docs/intro)** - Complete guides, API reference, and examples

- [Getting Started](https://wsyeabsera.github.io/clear-ai/docs/intro)
- [Architecture Overview](https://wsyeabsera.github.io/clear-ai/docs/architecture/overview)
- [API Reference](https://wsyeabsera.github.io/clear-ai/docs/api/overview)
- [Package Guides](https://wsyeabsera.github.io/clear-ai/docs/packages/client)

## 🚀 Quick Start

```bash
npm install clear-ai
```

```typescript
import { ClearAI } from "clear-ai";

// Initialize the framework for CLI usage
const ai = new ClearAI({
  llm: {
    openaiApiKey: "your-key",
    ollamaBaseUrl: "http://localhost:11434",
  },
  server: {
    port: 3001,
  },
});

// Start everything
await ai.init();

// Access services
const mcpServer = ai.getMCP();
const llmService = ai.getLLM();
const toolService = ai.getTools();
```

## 📦 What's Included

### MCP (Model Context Protocol) - `clear-ai-mcp-basic`

- **MCPServer** - Full MCP protocol implementation
- **ToolRegistry** - Dynamic tool registration and management
- **Built-in Tools** - API calls, JSON processing, file operations

### Shared Services - `clear-ai-shared`

- **SimpleLangChainService** - Multi-provider LLM integration
- **ToolExecutionService** - Tool registration and execution
- **SimpleWorkflowService** - Workflow orchestration
- **Logger** - Structured logging utilities

### Server - `clear-ai-server`

- **Express API** - RESTful endpoints for tool execution
- **Workflow Execution** - LangGraph workflow orchestration
- **Health Monitoring** - System health and status endpoints

### Client - `@clear-ai/client` (Private - Local Development Only)

- **React Components** - Pre-built UI components with Storybook
- **Theme System** - Multiple visual themes
- **Web Interface** - Browser-based tool execution interface

## 🎯 Usage Examples

### Basic Tool Execution

```typescript
import { MCPServer, ToolRegistry } from "clear-ai-mcp-basic";

const server = new MCPServer();
const tools = server.getToolRegistry();

// Execute an API call
const result = await tools.executeTool("api_call", {
  url: "https://api.example.com/users/1",
  method: "GET",
});
```

### LLM Integration

```typescript
import { SimpleLangChainService } from "clear-ai-shared";

const llm = new SimpleLangChainService({
  openaiApiKey: "your-key",
  ollamaBaseUrl: "http://localhost:11434",
});

const response = await llm.complete("Hello, world!", {
  model: "ollama",
  temperature: 0.7,
});
```

### Workflow Execution

```typescript
import { SimpleWorkflowService, ToolExecutionService } from "clear-ai-shared";

const toolService = new ToolExecutionService(llmConfig);
const workflow = new SimpleWorkflowService(llmConfig, toolService);

const result = await workflow.executeWorkflow(
  "Get weather data and format it nicely"
);
```

### Server API

```typescript
import { createServer } from "clear-ai-server";

const server = createServer({
  port: 3001,
  mcpConfig: { tools: ["api_call", "json_reader"] },
  llmConfig: { openaiApiKey: "your-key" },
});

await server.start();
```

### CLI Application

```typescript
import { ClearAI, MCPServer } from "clear-ai-core";

async function main() {
  const ai = new ClearAI({
    llm: { openaiApiKey: process.env.OPENAI_API_KEY },
    server: { port: 3001 },
  });

  await ai.init();

  // Use the MCP server for tool execution
  const mcpServer = ai.getMCP();
  const result = await mcpServer.getToolRegistry().executeTool("api_call", {
    url: "https://api.example.com/data",
    method: "GET",
  });

  console.log("Result:", result);
}

main().catch(console.error);
```

## 🏗️ Architecture

```
clear-ai-core
├── clear-ai-mcp-basic # Model Context Protocol
├── clear-ai-shared    # Shared services & utilities
├── clear-ai-server    # Express API server
└── @clear-ai/client   # React web interface (private)
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
    tools: ["api_call", "json_reader", "file_reader"],
  },
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY,
  },
  server: {
    port: 3001,
    cors: { origin: ["http://localhost:3000"] },
  },
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

## 📖 Documentation Access

### From NPM
When you install the package, you can access documentation via:
```bash
npm docs clear-ai-core
# or
npm home clear-ai-core
```

### Direct Links
- **Main Documentation**: https://wsyeabsera.github.io/Clear-AI/
- **Getting Started**: https://wsyeabsera.github.io/Clear-AI/docs/intro
- **API Reference**: https://wsyeabsera.github.io/Clear-AI/docs/api/overview

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