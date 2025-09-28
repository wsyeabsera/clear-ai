# Welcome to Clear AI

Welcome to the Clear AI documentation! This comprehensive guide will help you understand, build, and extend our modern TypeScript framework for AI-powered CLI tools, APIs, and server applications.

## What is Clear AI?

Clear AI is a powerful TypeScript framework that combines multiple cutting-edge technologies to create a unified platform for building AI applications with tool execution and workflow orchestration capabilities. Perfect for CLI tools, APIs, and server applications - think of it as your Swiss Army knife for AI development.

## Key Features

### 🚀 **Modern Architecture**
- **Monorepo Structure**: Organized packages with shared code and consistent tooling
- **TypeScript Everywhere**: End-to-end type safety across all packages
- **Hot Reload**: Lightning-fast development with instant feedback

### 🤖 **AI & LLM Integration**
- **Unified Agent System**: **NEW!** Single interface combining memory, tools, and conversation
- **Smart Intent Classification**: **NEW!** Automatic routing between conversation, tools, and memory
- **Multiple LLM Providers**: Support for OpenAI, Ollama, Mistral, and Groq
- **Tool Execution**: Dynamic tool registration and execution with parameter validation
- **Workflow Orchestration**: LangGraph-powered workflows for complex AI tasks
- **Natural Language Processing**: Convert natural language queries into tool executions
- **Comprehensive Testing**: **NEW!** Automated test suite for validation and performance

### 🛠️ **Developer Experience**
- **CLI-First Design**: Built for command-line tools and server applications
- **TypeScript Everywhere**: End-to-end type safety across all packages
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Testing**: Built-in testing infrastructure with Vitest

### 📦 **Package Ecosystem**
- **Core Framework**: Unified package with all functionality
- **Server**: Express.js API with comprehensive middleware and routing
- **MCP Basic**: Model Context Protocol server with essential tools
- **Shared**: Common types, utilities, and services across all packages
- **Client**: Optional React web interface for development and testing

## Quick Start

If you're eager to get started, here's the fastest way to run Clear AI:

```bash
# Install the package
npm install @clear-ai/core

# Use in your CLI application
```

```typescript
import { ClearAI } from '@clear-ai/core';

const ai = new ClearAI({
  llm: { openaiApiKey: 'your-key' },
  server: { port: 3001 }
});

await ai.init();
```

This will start:
- **Server**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## Who is this for?

This documentation is designed for:

- **Junior Developers**: Step-by-step guides with explanations of concepts
- **Senior Developers**: Comprehensive API references and architecture details
- **DevOps Engineers**: Deployment and infrastructure guidance
- **Product Managers**: Understanding capabilities and use cases

## What You'll Learn

By the end of this documentation, you'll understand:

1. **Architecture**: How all the pieces fit together
2. **Development**: How to build and extend the system
3. **APIs**: How to use and integrate with all services
4. **Deployment**: How to deploy to production
5. **Best Practices**: How to maintain and scale the system

## Prerequisites

Before diving in, make sure you have:

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- Basic knowledge of **TypeScript** and **React**
- Familiarity with **REST APIs**

## Getting Help

- 📖 **Documentation**: This comprehensive guide
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📧 **Contact**: Reach out to the maintainers

## What's Next?

Ready to dive in? Here are some suggested paths:

- **New to Clear AI?** → Start with [Getting Started](/docs/getting-started/installation)
- **Want to understand the architecture?** → Check out [Architecture Overview](/docs/architecture/overview)
- **Ready to build?** → Jump to [Development Guide](/docs/getting-started/development)
- **Need API details?** → Browse the [API Reference](/docs/api/overview)

Let's build something amazing together! 🚀