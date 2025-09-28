# Installation

This guide will walk you through setting up Clear AI on your local development machine. We'll cover everything from prerequisites to running your first development server.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

### Required Software

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- **Git** (for cloning the repository)

### Optional but Recommended

- **VS Code** with TypeScript and React extensions
- **Docker** (for containerized deployment)
- **Postman** or **Insomnia** (for API testing)

### System Requirements

- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/clear-ai/clear-ai.git
cd clear-ai
```

### 2. Install Dependencies

Clear AI uses npm workspaces to manage dependencies across packages. Install all dependencies with a single command:

```bash
# Install all dependencies for all packages
npm install
```

This will:
- Install dependencies for the root project
- Install dependencies for all packages (`client`, `server`, `mcp-basic`, `shared`)
- Link packages together using npm workspaces

### 3. Environment Setup

#### Server Environment

Create environment files for the server:

```bash
# Copy the example environment file
cp packages/server/env.example packages/server/.env
```

Edit `packages/server/.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# LLM Provider API Keys (optional)
OPENAI_API_KEY=your_openai_key_here
MISTRAL_API_KEY=your_mistral_key_here
GROQ_API_KEY=your_groq_key_here

# Langfuse Configuration (optional)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

#### Client Environment

Create environment file for the client:

```bash
# Create client environment file
echo "VITE_API_URL=http://localhost:3001" > packages/client/.env
```

### 4. Build Shared Package

The shared package needs to be built before other packages can use it:

```bash
# Build the shared package
npm run build --workspace=@clear-ai/shared
```

### 5. Verify Installation

Check that everything is installed correctly:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify workspace setup
npm run type-check
```

## Development Setup

### 1. Start Development Servers

You can start all services at once:

```bash
# Start all packages in development mode
npm run dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

### 2. Individual Package Development

You can also start packages individually:

```bash
# Start only the client
cd packages/client
npm run dev

# Start only the server
cd packages/server
npm run dev

# Start only MCP basic
cd packages/mcp-basic
npm run dev
```

### 3. Build for Production

To build all packages for production:

```bash
# Build all packages
npm run build
```

Built files will be in:
- `packages/client/dist/` - Client build
- `packages/server/dist/` - Server build
- `packages/mcp-basic/dist/` - MCP build
- `packages/shared/dist/` - Shared build

## Verification

### 1. Check Client

Open http://localhost:3000 in your browser. You should see:
- Clear AI welcome page
- Navigation menu
- Theme switcher
- Component showcase

### 2. Check Server

Open http://localhost:3001/api-docs in your browser. You should see:
- Swagger API documentation
- Available endpoints
- Interactive API testing

### 3. Test API Health

```bash
# Test server health
curl http://localhost:3001/api/health

# Expected response
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

## Troubleshooting

### Common Issues

#### Port Already in Use

If you get "port already in use" errors:

```bash
# Kill processes on ports 3000 and 3001
npm run kill-ports

# Or manually kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### TypeScript Errors

If you see TypeScript errors:

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Dependency Issues

If you have dependency conflicts:

```bash
# Clean everything and reinstall
rm -rf node_modules packages/*/node_modules
rm package-lock.json packages/*/package-lock.json
npm install
```

#### MCP Server Issues

If MCP tools aren't working:

```bash
# Check MCP server status
cd packages/mcp-basic
npm run build
npm start
```

### Getting Help

If you're still having issues:

1. **Check the logs**: Look at console output for error messages
2. **Verify versions**: Ensure Node.js and npm versions are correct
3. **Clean install**: Try a complete clean and reinstall
4. **Check issues**: Look at GitHub issues for similar problems
5. **Ask for help**: Create a new issue with your error details

## Next Steps

Now that you have Clear AI installed:

1. **Explore the UI**: Check out the different pages and themes
2. **Test the APIs**: Try the interactive API documentation
3. **Read the docs**: Learn about the [architecture](/docs/architecture/overview)
4. **Build something**: Follow the [tutorials](/docs/tutorials/building-your-first-tool)

## Development Tips

### VS Code Setup

For the best development experience, install these VS Code extensions:

- **TypeScript Importer**: Auto-import TypeScript modules
- **ES7+ React/Redux/React-Native snippets**: React code snippets
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **Thunder Client**: API testing
- **GitLens**: Git integration

### Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Clean build artifacts
npm run clean

# Run tests
npm test

# Build specific package
npm run build --workspace=@clear-ai/client
```

### Hot Reload

Both client and server support hot reload:
- **Client**: Changes to React components update instantly
- **Server**: Changes to TypeScript files restart the server automatically

You're all set! Happy coding! 🚀
