# @clear-ai/server

Clear AI Server Application with Express API and tool execution.

## Installation

```bash
npm install @clear-ai/server
```

## Quick Start

```typescript
import { createServer } from '@clear-ai/server';

// Create and start server
const server = createServer({
  port: 3001,
  mcpConfig: {
    // MCP configuration
  },
  llmConfig: {
    // LLM configuration
  }
});

await server.start();
```

## Features

- **Express API Server** - RESTful endpoints for tool execution
- **MCP Integration** - Model Context Protocol support
- **Workflow Execution** - LangGraph workflow orchestration
- **Tool Management** - Dynamic tool registration and execution
- **Health Monitoring** - System health and status endpoints

## API Endpoints

### Tool Execution

```bash
# Execute a tool
POST /api/tools/execute
{
  "toolName": "api_call",
  "args": {
    "url": "https://api.example.com/users/1",
    "method": "GET"
  }
}
```

### Workflow Execution

```bash
# Execute a workflow
POST /api/langgraph/execute
{
  "query": "Get user data and process it",
  "options": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.1
  }
}
```

### Health Check

```bash
# Check server health
GET /api/health
```

## Configuration

### Environment Variables

```bash
# Server configuration
PORT=3001
NODE_ENV=production

# LLM configuration
OPENAI_API_KEY=your-key
OLLAMA_BASE_URL=http://localhost:11434

# Langfuse configuration
LANGFUSE_SECRET_KEY=your-key
LANGFUSE_PUBLIC_KEY=your-key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### Server Options

```typescript
interface ServerOptions {
  port?: number;
  mcpConfig?: MCPConfig;
  llmConfig?: LLMConfig;
  cors?: CorsOptions;
  logging?: boolean;
}
```

## Usage Examples

### Basic Server

```typescript
import { createServer } from '@clear-ai/server';

const server = createServer({
  port: 3001
});

await server.start();
console.log('Server running on port 3001');
```

### With Custom Configuration

```typescript
import { createServer } from '@clear-ai/server';

const server = createServer({
  port: 3001,
  mcpConfig: {
    tools: ['api_call', 'json_reader', 'file_reader']
  },
  llmConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    ollamaBaseUrl: 'http://localhost:11434'
  },
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true
  }
});

await server.start();
```

### Custom Middleware

```typescript
import { createServer } from '@clear-ai/server';

const server = createServer({
  port: 3001
});

// Add custom middleware
server.app.use('/api/custom', (req, res) => {
  res.json({ message: 'Custom endpoint' });
});

await server.start();
```

## Development

### Running in Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Available Scripts

- `npm run dev` - Start with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:3001/api-docs`
- OpenAPI Spec: `http://localhost:3001/api-docs.json`

## Monitoring

### Health Endpoints

```bash
# Basic health check
GET /api/health

# Detailed system status
GET /api/health/detailed

# Tool registry status
GET /api/health/tools
```

### Logging

The server uses structured logging with different levels:

```typescript
import { logger } from '@clear-ai/shared';

logger.info('Server started', { port: 3001 });
logger.warn('Deprecated endpoint used', { endpoint: '/old-api' });
logger.error('Database connection failed', { error: error.message });
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist ./dist
COPY package.json ./
RUN npm ci --only=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Environment Configuration

```bash
# Production environment
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/clearai

# External services
REDIS_URL=redis://localhost:6379
```

## Documentation

For complete documentation, visit: https://clear-ai-docs.example.com/docs/packages/server

## License

MIT
