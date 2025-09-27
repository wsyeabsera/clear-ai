# LLM Services

This directory contains the LLM services for the Clear-AI project, providing a unified interface for interacting with different Large Language Model providers.

## Architecture

### Abstract Base Class: `LLMProvider`

The `LLMProvider` abstract class defines the interface that all LLM providers must implement:

- `complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMResponse>`
- `chatComplete(messages: ChatMessage[], options?: LLMCompletionOptions): Promise<LLMResponse>`
- `getAvailableModels(): Promise<string[]>`
- `validateConnection(): Promise<boolean>`
- `getProviderName(): string`

### Tool Selector: `ToolSelector`

The `ToolSelector` class extends `LLMProvider` and allows you to:
- Switch between different LLM providers dynamically
- Use multiple providers in a single application
- Execute requests with specific providers
- Manage provider configurations

## Supported Providers

### 1. OpenAI Provider (`OpenAIProvider`)
- **Models**: GPT-3.5, GPT-4, and other OpenAI models
- **API**: OpenAI Chat Completions API
- **Base URL**: `https://api.openai.com/v1`

### 2. Ollama Provider (`OllamaProvider`)
- **Models**: Local models (Llama, Mistral, etc.)
- **API**: Ollama local API
- **Base URL**: `http://localhost:11434` (default)

### 3. Mistral Provider (`MistralProvider`)
- **Models**: Mistral AI models
- **API**: Mistral Chat Completions API
- **Base URL**: `https://api.mistral.ai/v1`

### 4. Groq Provider (`GroqProvider`)
- **Models**: Llama, Mixtral models via Groq
- **API**: Groq API (OpenAI-compatible)
- **Base URL**: `https://api.groq.com/openai/v1`

## Usage Examples

### Basic Usage

```typescript
import { ToolSelector, OpenAIProvider, OllamaProvider } from '@clear-ai/shared';

// Create providers
const openai = new OpenAIProvider('your-api-key', 'gpt-3.5-turbo');
const ollama = new OllamaProvider('', 'llama2');

// Create tool selector
const providers = new Map([
  ['openai', openai],
  ['ollama', ollama],
]);

const toolSelector = new ToolSelector(providers, 'openai');

// Use the tool selector
const response = await toolSelector.complete('Hello, world!');
console.log(response.content);
```

### Switching Providers

```typescript
// Switch to Ollama
toolSelector.switchProvider('ollama');
const localResponse = await toolSelector.complete('Hello, world!');

// Use specific provider directly
const openaiResponse = await toolSelector.completeWithProvider(
  'openai',
  'Hello, world!'
);
```

### Chat Completion

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
];

const response = await toolSelector.chatComplete(messages);
console.log(response.content);
```

## Configuration Options

All providers support the following options:

```typescript
interface LLMCompletionOptions {
  temperature?: number;        // 0.0 to 1.0
  maxTokens?: number;         // Maximum tokens to generate
  topP?: number;             // Nucleus sampling parameter
  frequencyPenalty?: number;  // -2.0 to 2.0
  presencePenalty?: number;   // -2.0 to 2.0
  stop?: string[];           // Stop sequences
  stream?: boolean;          // Enable streaming
}
```

## Error Handling

All providers throw errors for:
- Invalid API keys
- Network connectivity issues
- API rate limits
- Invalid model names
- Malformed requests

## TypeScript Support

The services are fully typed with TypeScript interfaces for:
- `LLMResponse` - Response structure
- `ChatMessage` - Chat message format
- `LLMCompletionOptions` - Request options
- `LLMProviderConfig` - Provider configuration

## Dependencies

The services use the native `fetch` API for HTTP requests, making them compatible with both Node.js and browser environments.
