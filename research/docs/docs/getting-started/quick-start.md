# Quick Start Guide

Welcome to Clear AI! This quick start guide will get you up and running in just a few minutes. We'll walk through the essential steps to get your development environment ready and run your first AI-powered tool execution.

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

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/clear-ai/clear-ai.git
cd clear-ai

# Install all dependencies
npm install
```

This will install dependencies for all packages in the monorepo. It might take a few minutes the first time.

## Step 2: Environment Setup

### Server Environment

```bash
# Copy the example environment file
cp packages/server/env.example packages/server/.env
```

The server will work with default settings, but you can customize it by editing `packages/server/.env`:

```env
# Basic configuration (these work out of the box)
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Optional: Add your API keys for enhanced functionality
# OPENAI_API_KEY=your_key_here
# MISTRAL_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
```

### Client Environment

```bash
# Create client environment file
echo "VITE_API_URL=http://localhost:3001" > packages/client/.env
```

## Step 3: Build Shared Package

The shared package needs to be built first since other packages depend on it:

```bash
# Build the shared package
npm run build --workspace=@clear-ai/shared
```

## Step 4: Start the Development Servers

Now let's start all the services:

```bash
# Start all packages in development mode
npm run dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

You should see output like this:

```
✓ Client running on http://localhost:3000
✓ Server running on http://localhost:3001
✓ API docs available at http://localhost:3001/api-docs
```

## Step 5: Verify Everything Works

### Check the Client

Open http://localhost:3000 in your browser. You should see:
- Clear AI welcome page
- Navigation menu with different pages
- Theme switcher in the top right
- Component showcase

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

## Step 6: Run Your First Tool

Let's execute a simple tool to make sure everything is working:

### Using the API

```bash
# Execute a calculator tool
curl -X POST http://localhost:3001/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "calculator",
    "args": {
      "operation": "add",
      "a": 5,
      "b": 3
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "result": 8,
    "executionTime": 45,
    "toolName": "calculator"
  },
  "message": "Tool executed successfully"
}
```

### Using the Client

1. Go to http://localhost:3000
2. Navigate to "Tool Execute" in the menu
3. Select a tool from the dropdown
4. Fill in the parameters
5. Click "Execute Tool"

## Step 7: Explore the Features

### Available Tools

Check what tools are available:

```bash
# List all available tools
curl http://localhost:3001/api/tools
```

### Theme System

Try different themes in the client:
1. Click the theme switcher in the top right
2. Try "NeoWave", "Techno", "OldSchool", or "Alien"
3. Notice how the entire UI changes

### Component Library

1. Go to "Components" in the navigation
2. Explore the different UI components
3. Try the interactive examples
4. Switch themes to see how components adapt

## Step 8: Test Workflow Execution

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
