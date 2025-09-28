# Client Service APIs

The Client Service APIs provide frontend service layer functionality for React applications using Clear AI.

## Service Classes

### ClearAIService

Main service class for AI operations.

```typescript
import { ClearAIService } from 'clear-ai/client';

const aiService = new ClearAIService({
  baseURL: 'http://localhost:3001',
  apiKey: 'your-api-key' // Optional
});
```

#### Methods

##### executeTool(toolName: string, args: any)
Execute a tool with the given arguments.

```typescript
const result = await aiService.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});
```

##### executeWorkflow(query: string, options?: WorkflowOptions)
Execute a LangGraph workflow with a natural language query.

```typescript
const result = await aiService.executeWorkflow(
  'Get weather for London and analyze the data',
  {
    model: 'gpt-3.5-turbo',
    temperature: 0.1
  }
);
```

##### getAvailableTools()
Get list of available tools.

```typescript
const tools = await aiService.getAvailableTools();
```

##### getWorkflowStatus(workflowId: string)
Get the status of a running workflow.

```typescript
const status = await aiService.getWorkflowStatus('workflow-123');
```

### ToolService

Service for tool management and execution.

```typescript
import { ToolService } from 'clear-ai/client';

const toolService = new ToolService({
  baseURL: 'http://localhost:3001'
});
```

#### Methods

##### registerTool(tool: ToolDefinition)
Register a new tool.

```typescript
const tool = {
  name: 'custom_calculator',
  description: 'Custom calculator tool',
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string' },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b']
  }
};

await toolService.registerTool(tool);
```

##### executeTool(toolName: string, args: any)
Execute a specific tool.

```typescript
const result = await toolService.executeTool('calculator', {
  operation: 'multiply',
  a: 4,
  b: 5
});
```

##### getToolSchema(toolName: string)
Get the schema for a specific tool.

```typescript
const schema = await toolService.getToolSchema('calculator');
```

### WorkflowService

Service for workflow management and execution.

```typescript
import { WorkflowService } from 'clear-ai/client';

const workflowService = new WorkflowService({
  baseURL: 'http://localhost:3001'
});
```

#### Methods

##### createWorkflow(workflow: WorkflowDefinition)
Create a new workflow.

```typescript
const workflow = {
  name: 'data-analysis',
  description: 'Analyze data using multiple tools',
  steps: [
    {
      id: 'fetch_data',
      type: 'api_call',
      config: {
        url: 'https://api.example.com/data',
        method: 'GET'
      }
    },
    {
      id: 'analyze',
      type: 'llm_call',
      config: {
        prompt: 'Analyze this data: {{fetch_data.result}}',
        model: 'gpt-3.5-turbo'
      }
    }
  ]
};

const createdWorkflow = await workflowService.createWorkflow(workflow);
```

##### executeWorkflow(workflowId: string, inputs: any)
Execute a workflow with given inputs.

```typescript
const result = await workflowService.executeWorkflow('workflow-123', {
  query: 'analyze sales data'
});
```

##### getWorkflowStatus(workflowId: string)
Get the current status of a workflow execution.

```typescript
const status = await workflowService.getWorkflowStatus('workflow-123');
```

##### listWorkflows()
Get list of available workflows.

```typescript
const workflows = await workflowService.listWorkflows();
```

### LLMService

Service for language model operations.

```typescript
import { LLMService } from 'clear-ai/client';

const llmService = new LLMService({
  baseURL: 'http://localhost:3001'
});
```

#### Methods

##### generateText(prompt: string, options?: LLMOptions)
Generate text using a language model.

```typescript
const result = await llmService.generateText(
  'Explain artificial intelligence in simple terms',
  {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500
  }
);
```

##### chat(messages: ChatMessage[], options?: ChatOptions)
Have a conversation with the language model.

```typescript
const messages = [
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'assistant', content: 'I am doing well, thank you!' },
  { role: 'user', content: 'Can you help me with coding?' }
];

const response = await llmService.chat(messages, {
  model: 'gpt-3.5-turbo',
  temperature: 0.5
});
```

##### getAvailableModels()
Get list of available language models.

```typescript
const models = await llmService.getAvailableModels();
```

## React Hooks

### useClearAI

Main hook for AI operations.

```typescript
import { useClearAI } from 'clear-ai/client';

function MyComponent() {
  const { executeTool, executeWorkflow, loading, error } = useClearAI({
    baseURL: 'http://localhost:3001'
  });

  const handleToolExecution = async () => {
    try {
      const result = await executeTool('calculator', {
        operation: 'add',
        a: 5,
        b: 3
      });
      console.log('Result:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleToolExecution} disabled={loading}>
        Execute Tool
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### useToolExecution

Hook for tool execution with state management.

```typescript
import { useToolExecution } from 'clear-ai/client';

function ToolComponent() {
  const {
    executeTool,
    result,
    loading,
    error,
    clearResult
  } = useToolExecution();

  const handleExecute = async () => {
    await executeTool('weather', {
      location: 'London',
      units: 'metric'
    });
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={loading}>
        Get Weather
      </button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <button onClick={clearResult}>Clear</button>
        </div>
      )}
    </div>
  );
}
```

### useWorkflowExecution

Hook for workflow execution with progress tracking.

```typescript
import { useWorkflowExecution } from 'clear-ai/client';

function WorkflowComponent() {
  const {
    executeWorkflow,
    result,
    progress,
    loading,
    error,
    cancelExecution
  } = useWorkflowExecution();

  const handleExecute = async () => {
    await executeWorkflow('data-analysis', {
      query: 'Analyze sales data for Q4'
    });
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={loading}>
        Execute Workflow
      </button>
      {loading && (
        <div>
          <div>Progress: {progress}%</div>
          <button onClick={cancelExecution}>Cancel</button>
        </div>
      )}
      {error && <div>Error: {error.message}</div>}
      {result && (
        <div>
          <h3>Workflow Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

## Type Definitions

### ToolDefinition
```typescript
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  handler?: (args: any) => Promise<any>;
}
```

### WorkflowDefinition
```typescript
interface WorkflowDefinition {
  name: string;
  description: string;
  steps: WorkflowStep[];
  inputs?: JSONSchema;
  outputs?: JSONSchema;
}

interface WorkflowStep {
  id: string;
  type: 'api_call' | 'llm_call' | 'tool_execution';
  config: any;
  condition?: string;
  retry?: RetryConfig;
}
```

### LLMOptions
```typescript
interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}
```

## Error Handling

All services include comprehensive error handling:

```typescript
try {
  const result = await aiService.executeTool('calculator', {
    operation: 'divide',
    a: 10,
    b: 0
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Configuration

### Service Configuration
```typescript
interface ServiceConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
```

### Default Configuration
```typescript
const defaultConfig: ServiceConfig = {
  baseURL: 'http://localhost:3001',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
};
```

## Usage Examples

### Basic Tool Execution
```typescript
import { ClearAIService } from 'clear-ai/client';

const aiService = new ClearAIService({
  baseURL: 'http://localhost:3001'
});

// Execute a calculator tool
const result = await aiService.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});

console.log('Result:', result.data.result); // 8
```

### Workflow Execution with Progress
```typescript
import { useWorkflowExecution } from 'clear-ai/client';

function DataAnalysisComponent() {
  const { executeWorkflow, result, progress, loading } = useWorkflowExecution();

  const analyzeData = async () => {
    await executeWorkflow('data-analysis', {
      query: 'Analyze quarterly sales data and provide insights'
    });
  };

  return (
    <div>
      <button onClick={analyzeData} disabled={loading}>
        Analyze Data
      </button>
      {loading && <div>Progress: {progress}%</div>}
      {result && <div>Analysis: {result.finalResult}</div>}
    </div>
  );
}
```

### Custom Tool Registration
```typescript
import { ToolService } from 'clear-ai/client';

const toolService = new ToolService({
  baseURL: 'http://localhost:3001'
});

// Register a custom tool
await toolService.registerTool({
  name: 'text_analyzer',
  description: 'Analyze text sentiment and extract keywords',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      analysisType: { 
        type: 'string', 
        enum: ['sentiment', 'keywords', 'both'] 
      }
    },
    required: ['text']
  }
});

// Use the custom tool
const analysis = await toolService.executeTool('text_analyzer', {
  text: 'This is a great product!',
  analysisType: 'both'
});
```
