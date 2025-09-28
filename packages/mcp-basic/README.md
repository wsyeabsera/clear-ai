# @clear-ai/mcp-basic

🧠 **Intelligent MCP Server** - Model Context Protocol server with advanced tools and intelligence capabilities.

[![Intelligence Score](https://img.shields.io/badge/Intelligence-8.5%2F10-brightgreen)](https://github.com/wsyeabsera/clear-ai)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol-blue)](https://github.com/wsyeabsera/clear-ai)
[![Tool Integration](https://img.shields.io/badge/Tools-Advanced-green)](https://github.com/wsyeabsera/clear-ai)

## 🚀 Installation

```bash
npm install @clear-ai/mcp-basic
```

## 🧠 Intelligence Features

### **Smart Tool Execution (8.5/10)**
- **Intelligent Tool Selection**: Automatically chooses appropriate tools based on context
- **Parallel Execution**: Runs multiple tools concurrently for efficiency
- **Error Recovery**: Graceful handling of tool failures with fallback strategies
- **Context Awareness**: Tools understand and utilize conversation context

### **Advanced API Integration (9/10)**
- **Relationship Understanding**: Recognizes complex API data hierarchies
- **Pattern Recognition**: Identifies data flow and structure patterns
- **Semantic Grouping**: Categorizes API resources by function and purpose
- **Multi-step Reasoning**: Complex data traversal and analysis

### **Intelligent Data Processing (8/10)**
- **Smart JSON Parsing**: Context-aware JSON data extraction and processing
- **File Intelligence**: Intelligent file reading with content analysis
- **Data Transformation**: Automatic data formatting and structure optimization
- **Memory Integration**: Tools can access and utilize memory context

## 🚀 Quick Start

```typescript
import { MCPServer, ToolRegistry, IntelligenceEnhancer } from '@clear-ai/mcp-basic';

// Create intelligent MCP server
const server = new MCPServer({
  intelligenceEnabled: true,
  memoryIntegration: true,
  relationshipAnalysis: true
});

// Get enhanced tool registry
const toolRegistry = server.getToolRegistry();

// Register intelligent custom tools
toolRegistry.registerTool({
  name: 'intelligent-analyzer',
  description: 'Analyzes data with memory context and relationship understanding',
  inputSchema: z.object({
    data: z.any(),
    analysisType: z.enum(['relationships', 'patterns', 'semantic']),
    includeMemory: z.boolean().optional()
  }),
  execute: async (args, context) => {
    // Access memory context if available
    const memoryContext = context?.memoryContext || [];
    
    // Perform intelligent analysis
    const analysis = await performIntelligentAnalysis(args.data, {
      type: args.analysisType,
      memoryContext,
      includeRelationships: true
    });
    
    return { 
      result: analysis,
      intelligence: {
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        relationships: analysis.relationships
      }
    };
  }
});

// Start intelligent server
await server.start();
```

## 🧠 Available Tools

### **Core Intelligence Tools**
- **Intelligent API Call Tool** - Smart HTTP requests with relationship understanding
- **Smart JSON Reader Tool** - Context-aware JSON parsing and extraction
- **Intelligent File Reader Tool** - File reading with content analysis
- **Parallel Execution Tool** - Concurrent tool execution with intelligence

### **Advanced Analysis Tools**
- **Relationship Analyzer Tool** - Complex data relationship analysis
- **Pattern Recognition Tool** - Data pattern identification and classification
- **Semantic Grouping Tool** - Intelligent data categorization and grouping
- **Memory Integration Tool** - Memory context access and utilization

### **Traditional Tools**
- **API Call Tool** - Make HTTP requests
- **JSON Reader Tool** - Parse and extract JSON data
- **File Reader Tool** - Read files and directories
- **Execute Parallel Tool** - Run multiple tools concurrently

## 🧠 Intelligence Usage Examples

### **Intelligent API Call Tool**

```typescript
// Smart API calls with relationship understanding
const result = await toolRegistry.executeTool('intelligent_api_call', {
  url: 'https://api.example.com/users/1',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
  intelligence: {
    analyzeRelationships: true,
    extractPatterns: true,
    includeMemoryContext: true
  }
});

// Response includes:
// - API data
// - Relationship analysis
// - Pattern recognition
// - Memory context integration
```

### **Smart JSON Reader Tool**

```typescript
// Context-aware JSON parsing with intelligence
const result = await toolRegistry.executeTool('smart_json_reader', {
  jsonString: '{"users": [{"id": 1, "name": "John", "posts": [...]}]}',
  path: '$.users[0].name',
  intelligence: {
    analyzeStructure: true,
    extractRelationships: true,
    semanticGrouping: true
  }
});

// Output includes:
// - Extracted data
// - Structure analysis
// - Relationship mapping
// - Semantic categorization
```

### **Intelligent File Reader Tool**

```typescript
// File reading with content analysis
const result = await toolRegistry.executeTool('intelligent_file_reader', {
  path: '/path/to/data.json',
  operation: 'read',
  encoding: 'utf8',
  intelligence: {
    analyzeContent: true,
    extractMetadata: true,
    identifyPatterns: true
  }
});

// Response includes:
// - File content
// - Content analysis
// - Metadata extraction
// - Pattern identification
```

### **Relationship Analyzer Tool**

```typescript
// Complex data relationship analysis
const result = await toolRegistry.executeTool('relationship_analyzer', {
  data: {
    users: [{ id: 1, name: 'Alice' }],
    posts: [{ id: 1, userId: 1, title: 'My Post' }],
    comments: [{ id: 1, postId: 1, userId: 2, text: 'Great!' }]
  },
  analysisType: 'hierarchical',
  includePatterns: true,
  includeSemanticGrouping: true
});

// Output includes:
// - Hierarchical relationships
// - Many-to-many relationships
// - Pattern recognition
// - Semantic groupings
```

### **Parallel Execution with Intelligence**

```typescript
// Run multiple tools concurrently with intelligence
const result = await toolRegistry.executeTool('intelligent_parallel', {
  tools: [
    {
      name: 'api_call',
      args: { url: 'https://api.example.com/users' }
    },
    {
      name: 'json_reader',
      args: { jsonString: '{"data": "value"}' }
    },
    {
      name: 'relationship_analyzer',
      args: { data: userData, analysisType: 'patterns' }
    }
  ],
  intelligence: {
    crossToolAnalysis: true,
    relationshipMapping: true,
    memoryIntegration: true
  }
});

// Response includes:
// - Results from all tools
// - Cross-tool relationship analysis
// - Integrated intelligence insights
// - Memory context utilization
```

### **Memory Integration Tool**

```typescript
// Access and utilize memory context
const result = await toolRegistry.executeTool('memory_integration', {
  query: 'What do you remember about our previous API discussions?',
  userId: 'user-123',
  sessionId: 'session-456',
  memoryTypes: ['episodic', 'semantic'],
  includeRelationships: true
});

// Output includes:
// - Relevant memories
// - Memory relationships
// - Context analysis
// - Intelligence insights
```

## Documentation

For complete documentation, visit: https://clear-ai-docs.example.com/docs/packages/mcp-basic

## License

MIT
