# Quick Start Guide

Welcome to Clear AI! This quick start guide will get you up and running in just a few minutes. We'll walk through the essential steps to install the package and run your first AI-powered CLI tool.

## Prerequisites Check

Before we begin, let's make sure you have everything you need:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 10+)
npm --version

# Check if you have Git
git --version
```

If any of these commands fail or show versions that are too old, please install the latest versions first.

## Step 1: Install the Package

```bash
# Install Clear AI
npm install @clear-ai/core

# Or with yarn
yarn add @clear-ai/core
```

This will install the unified Clear AI package with all functionality included.

## Step 2: Create Your CLI Application

Create a new file for your CLI application:

```bash
# Create your CLI script
touch my-ai-cli.js
```

## Step 3: Write Your First CLI Tool

```javascript
// my-ai-cli.js
const { ClearAI } = require("@clear-ai/core");

async function main() {
  // Initialize Clear AI
  const ai = new ClearAI({
    llm: {
      openaiApiKey: process.env.OPENAI_API_KEY || "your-key-here",
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    },
    server: {
      port: parseInt(process.env.PORT) || 3001,
    },
  });

  try {
    // Initialize all services
    await ai.init();

    console.log("✅ Clear AI initialized successfully!");

    // Access the MCP server for tool execution
    const mcpServer = ai.getMCP();
    const toolRegistry = mcpServer.getToolRegistry();

    // Execute a simple API call tool
    const result = await toolRegistry.executeTool("api_call", {
      url: "https://jsonplaceholder.typicode.com/posts/1",
      method: "GET",
    });

    console.log("📊 API Call Result:", result);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
```

## Step 4: Set Environment Variables (Optional)

```bash
# Set your API keys (optional - defaults work for basic functionality)
export OPENAI_API_KEY="your-openai-key"
export OLLAMA_BASE_URL="http://localhost:11434"
export PORT=3001
```

## Step 5: Run Your CLI Tool

```bash
# Make it executable and run
node my-ai-cli.js
```

This will:

- Initialize Clear AI with all services
- Start the server on port 3001
- Execute an API call tool
- Display the results

You should see output like this:

```
✅ Clear AI initialized successfully!
🚀 Server running on port 3001
📊 API Call Result: { success: true, data: { ... } }
```

## Step 6: Verify Everything Works

### Check the Server

Open http://localhost:3001/api-docs in your browser. You should see:

- Swagger API documentation
- Available endpoints
- Interactive API testing interface

### Test the Health Endpoint

```bash
# Test server health
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "uptime": 123.45
  },
  "message": "Server is running"
}
```

## Step 7: Run Your First Tool

Let's execute a simple tool to make sure everything is working:

### Using the API

```bash
# Execute an API call tool
curl -X POST http://localhost:3001/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "api_call",
    "args": {
      "url": "https://jsonplaceholder.typicode.com/users/1",
      "method": "GET"
    }
  }'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": 200,
    "data": {
      "id": 1,
      "name": "Leanne Graham",
      "email": "Sincere@april.biz"
    }
  },
  "message": "Tool executed successfully"
}
```

### Using the CLI

Your CLI application already executed a tool! You can extend it to handle user input:

```javascript
// Enhanced CLI with user input
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askUser() {
  return new Promise((resolve) => {
    rl.question("Enter a URL to fetch: ", resolve);
  });
}

// In your main function, replace the hardcoded URL:
const userUrl = await askUser();
const result = await toolRegistry.executeTool("api_call", {
  url: userUrl,
  method: "GET",
});
```

## Step 8: Explore the Features

### Available Tools

Check what tools are available:

```bash
# List all available tools
curl http://localhost:3001/api/tools
```

### Built-in Tools

Clear AI comes with several built-in tools:

- **api_call**: Make HTTP requests to any API
- **json_reader**: Parse and process JSON data
- **file_reader**: Read files from the filesystem
- **execute_parallel**: Execute multiple tools in parallel

### LLM Integration

Use the LLM service for natural language processing:

```javascript
// Get the LLM service
const llmService = ai.getLLM();

// Use it for text completion
const response = await llmService.complete("Explain what Clear AI is");
console.log("LLM Response:", response.content);
```

### Optional: Web Interface

If you want a web-based interface for development and testing, you can also run the client:

```bash
# Install the client package (optional)
npm install @clear-ai/client

# Start the web interface
cd node_modules/@clear-ai/client
npm run dev
```

This will start the React web interface at http://localhost:3000, providing:
- Visual tool execution interface
- Interactive API testing
- Theme switching capabilities
- Component showcase

## Step 9: Test Workflow Execution

Let's try a more advanced feature - workflow execution:

```bash
# Execute a workflow using natural language
curl -X POST http://localhost:3001/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Make an API call to https://jsonplaceholder.typicode.com/users/1"
  }'
```

This will:

1. Analyze your natural language query
2. Determine which tools are needed
3. Execute the tools in the correct order
4. Return the results

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**TypeScript Errors**

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Client Not Loading**

- Check that the server is running on port 3001
- Verify the client environment variable is set correctly
- Check browser console for errors

**API Calls Failing**

- Verify the server is running
- Check server logs for error messages
- Ensure the shared package is built

### Getting Help

If you're stuck:

1. **Check the logs**: Look at the terminal output for error messages
2. **Verify versions**: Make sure Node.js and npm versions are correct
3. **Clean install**: Try `npm run clean && npm install`
4. **Check issues**: Look at GitHub issues for similar problems
5. **Ask for help**: Create a new issue with your error details

## What's Next?

Congratulations! You now have Clear AI running locally. Here's what you can do next:

### For Developers

1. **Explore the Code**: Check out the different packages and their structure
2. **Read the Docs**: Dive into the [architecture documentation](/docs/architecture/overview)
3. **Build Something**: Follow the [tutorials](/docs/tutorials/building-your-first-tool)
4. **Customize**: Learn about [themes](/docs/features/theme-system) and [components](/docs/features/component-library)

### For Users

1. **Try the Tools**: Explore the different tools available
2. **Create Workflows**: Use natural language to create complex workflows
3. **Customize Themes**: Find a theme that suits your style
4. **Learn the APIs**: Check out the [API reference](/docs/api/overview)

### For Contributors

1. **Fork the Repository**: Create your own fork
2. **Make Changes**: Implement new features or fix bugs
3. **Test Thoroughly**: Make sure your changes work correctly
4. **Submit PRs**: Contribute back to the project

## Quick Reference

### Essential Commands

```bash
# Start development
npm run dev

# Build all packages
npm run build

# Run tests
npm test

# Clean everything
npm run clean

# Type checking
npm run type-check

# Linting
npm run lint
```

### Important URLs

- **Client**: http://localhost:3000
- **Server**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/health

### Key Files

- **Client Config**: `packages/client/vite.config.ts`
- **Server Config**: `packages/server/src/index.ts`
- **Shared Types**: `packages/shared/src/types.ts`
- **MCP Tools**: `packages/mcp-basic/src/tools/`

## Need More Help?

- 📖 **Documentation**: Browse the full documentation
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📧 **Contact**: Reach out to the maintainers

Happy coding! 🚀
