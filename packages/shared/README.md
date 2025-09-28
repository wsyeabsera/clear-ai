# @clear-ai/shared

Shared utilities, types, and services for Clear AI.

## Installation

```bash
npm install @clear-ai/shared
```

## Quick Start

```typescript
import { 
  SimpleLangChainService, 
  ToolExecutionService,
  SimpleWorkflowService,
  logger 
} from '@clear-ai/shared';

// Initialize LLM service
const langchainService = new SimpleLangChainService({
  openaiApiKey: 'your-key',
  ollamaBaseUrl: 'http://localhost:11434',
  // ... other config
});

// Initialize tool execution service
const toolService = new ToolExecutionService(langchainService);

// Initialize workflow service
const workflowService = new SimpleWorkflowService(langchainService, toolService);

// Execute a workflow
const result = await workflowService.executeWorkflow(
  'Make an API call to get user data and process it'
);
```

## Available Services

### LLM Services
- **SimpleLangChainService** - Multi-provider LLM integration
- **ToolExecutionService** - Tool registration and execution
- **SimpleWorkflowService** - Workflow orchestration

### Utilities
- **Logger** - Structured logging
- **Type definitions** - Common TypeScript interfaces
- **Validation utilities** - Input validation helpers

## Usage Examples

### LLM Service

```typescript
import { SimpleLangChainService } from '@clear-ai/shared';

const llm = new SimpleLangChainService(config);

const response = await llm.complete('Hello, world!', {
  model: 'ollama',
  temperature: 0.7
});
```

### Tool Execution

```typescript
import { ToolExecutionService } from '@clear-ai/shared';

const toolService = new ToolExecutionService(llmConfig);

// Register a tool
toolService.registerTool({
  name: 'calculator',
  description: 'Basic calculator',
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string' },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b']
  },
  execute: async (args) => {
    const { operation, a, b } = args;
    switch (operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      default: throw new Error('Unknown operation');
    }
  }
});

// Execute tool
const result = await toolService.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});
```

### Workflow Execution

```typescript
import { SimpleWorkflowService } from '@clear-ai/shared';

const workflow = new SimpleWorkflowService(llmConfig, toolService);

const result = await workflow.executeWorkflow(
  'Get weather data and format it nicely',
  { model: 'gpt-3.5-turbo' }
);
```

## Type Definitions

```typescript
import { 
  ApiResponse, 
  User, 
  ToolExecutionRequest,
  WorkflowExecutionResult 
} from '@clear-ai/shared';

// Use shared types
const response: ApiResponse<User[]> = {
  success: true,
  data: users,
  message: 'Users fetched successfully'
};
```

## Documentation

For complete documentation, visit: https://clear-ai-docs.example.com/docs/packages/shared

## License

MIT
