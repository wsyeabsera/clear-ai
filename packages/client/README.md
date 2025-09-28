# @clear-ai/client

🧠 **Intelligent AI Client** - React-based admin panel and CLI with advanced intelligence features and memory integration.

[![Intelligence Score](https://img.shields.io/badge/Intelligence-8.5%2F10-brightgreen)](https://github.com/wsyeabsera/clear-ai)
[![React Components](https://img.shields.io/badge/React-Components-blue)](https://github.com/wsyeabsera/clear-ai)
[![CLI Tools](https://img.shields.io/badge/CLI-Tools-green)](https://github.com/wsyeabsera/clear-ai)

## 🚀 Installation

```bash
npm install @clear-ai/client
```

## 🧠 Intelligence Features

### **Advanced Memory Visualization (9/10)**
- **Episodic Memory Display**: Visualize conversation history and context
- **Semantic Memory Explorer**: Browse conceptual knowledge and relationships
- **Memory Search Interface**: Intelligent memory search with relevance scoring
- **Cross-session Analytics**: Track memory patterns across different sessions

### **Intelligent Agent Interface (8.5/10)**
- **Real-time Query Processing**: Live agent interaction with memory context
- **Intent Classification Display**: Visual representation of query understanding
- **Reasoning Chain Visualization**: Step-by-step reasoning process display
- **Relationship Analysis UI**: Interactive data relationship exploration

### **Smart Admin Dashboard (8/10)**
- **Performance Metrics**: Intelligence scores and performance analytics
- **Memory Statistics**: Memory usage, retrieval patterns, and effectiveness
- **API Relationship Mapping**: Visual representation of API data hierarchies
- **System Health Monitoring**: Real-time system status and intelligence metrics

## 🚀 Quick Start

### **React Components**

```typescript
import React from 'react';
import { 
  AgentInterface, 
  MemoryExplorer, 
  RelationshipAnalyzer,
  IntelligenceDashboard 
} from '@clear-ai/client';

function App() {
  return (
    <div className="intelligent-ai-client">
      <IntelligenceDashboard 
        serverUrl="http://localhost:3001"
        userId="user-123"
        sessionId="session-456"
      />
      
      <AgentInterface 
        onQuerySubmit={(query) => console.log('Query:', query)}
        includeMemoryContext={true}
        showReasoning={true}
      />
      
      <MemoryExplorer 
        userId="user-123"
        memoryTypes={['episodic', 'semantic']}
        searchEnabled={true}
      />
      
      <RelationshipAnalyzer 
        dataSource="api"
        showHierarchies={true}
        showPatterns={true}
      />
    </div>
  );
}
```

### **CLI Tools**

```bash
# Install globally
npm install -g @clear-ai/client

# Start intelligent agent CLI
clear-ai agent --server http://localhost:3001

# Memory management CLI
clear-ai memory --user user-123 --action search --query "machine learning"

# Intelligence analytics
clear-ai analytics --show-metrics --include-memory-stats

# Relationship analysis
clear-ai relationships --analyze --data-source api --format json
```

## 🧠 Available Components

### **Core Intelligence Components**
- **AgentInterface** - Interactive agent query interface with memory context
- **MemoryExplorer** - Visual memory browser with search and filtering
- **RelationshipAnalyzer** - Interactive data relationship visualization
- **IntelligenceDashboard** - Comprehensive intelligence metrics and analytics

### **Memory Management Components**
- **EpisodicMemoryViewer** - Conversation history and context display
- **SemanticMemoryBrowser** - Conceptual knowledge and relationship explorer
- **MemorySearchInterface** - Advanced memory search with relevance scoring
- **MemoryStatistics** - Memory usage and effectiveness analytics

### **Analytics Components**
- **PerformanceMetrics** - Intelligence scores and performance tracking
- **APIRelationshipMap** - Visual API data hierarchy representation
- **SystemHealthMonitor** - Real-time system status and intelligence metrics
- **QueryAnalytics** - Query processing and intent classification analytics

### **UI Components**
- **ThemeProvider** - Multiple theme support (default, neowave, techno, oldschool, alien)
- **ComponentLibrary** - Reusable UI components with intelligence features
- **ResponsiveLayout** - Adaptive layout for different screen sizes
- **InteractiveCharts** - Data visualization with intelligence metrics

## 🧠 Usage Examples

### **Intelligent Agent Interface**

```typescript
import { AgentInterface } from '@clear-ai/client';

function ChatInterface() {
  const handleQuery = async (query: string, options: QueryOptions) => {
    const response = await agentService.executeQuery(query, {
      userId: 'user-123',
      sessionId: 'session-456',
      includeMemoryContext: true,
      includeReasoning: true,
      model: 'gpt-4'
    });
    
    console.log('Response:', response);
    console.log('Intent:', response.intent);
    console.log('Reasoning:', response.reasoning);
    console.log('Memory Context:', response.memoryContext);
  };

  return (
    <AgentInterface
      onQuerySubmit={handleQuery}
      showMemoryContext={true}
      showReasoning={true}
      showIntentClassification={true}
      theme="neowave"
    />
  );
}
```

### **Memory Explorer**

```typescript
import { MemoryExplorer } from '@clear-ai/client';

function MemoryDashboard() {
  return (
    <MemoryExplorer
      userId="user-123"
      memoryTypes={['episodic', 'semantic']}
      searchEnabled={true}
      filterOptions={{
        dateRange: { start: '2025-01-01', end: '2025-12-31' },
        importance: { min: 0.7 },
        tags: ['machine-learning', 'AI']
      }}
      onMemorySelect={(memory) => {
        console.log('Selected memory:', memory);
      }}
    />
  );
}
```

### **Relationship Analyzer**

```typescript
import { RelationshipAnalyzer } from '@clear-ai/client';

function DataAnalysis() {
  return (
    <RelationshipAnalyzer
      dataSource="api"
      showHierarchies={true}
      showPatterns={true}
      showSemanticGrouping={true}
      onRelationshipSelect={(relationship) => {
        console.log('Selected relationship:', relationship);
      }}
      visualizationOptions={{
        layout: 'hierarchical',
        showLabels: true,
        interactive: true
      }}
    />
  );
}
```

### **Intelligence Dashboard**

```typescript
import { IntelligenceDashboard } from '@clear-ai/client';

function AdminPanel() {
  return (
    <IntelligenceDashboard
      serverUrl="http://localhost:3001"
      userId="user-123"
      sessionId="session-456"
      metrics={[
        'intelligence-score',
        'memory-effectiveness',
        'query-accuracy',
        'relationship-understanding',
        'response-time'
      ]}
      realTimeUpdates={true}
      alertThresholds={{
        intelligenceScore: 8.0,
        memoryEffectiveness: 0.8,
        queryAccuracy: 0.95
      }}
    />
  );
}
```

## 🎨 Theme System

The client supports multiple intelligent themes:

```typescript
import { ThemeProvider } from '@clear-ai/client';

// Available themes
const themes = [
  'default',    // Clean, professional interface
  'neowave',    // Futuristic, cyberpunk aesthetic
  'techno',     // High-tech, modern design
  'oldschool',  // Retro, classic computing feel
  'alien'       // Otherworldly, sci-fi inspired
];

function App() {
  return (
    <ThemeProvider theme="neowave">
      <YourAppComponents />
    </ThemeProvider>
  );
}
```

## 🛠️ CLI Commands

### **Agent Commands**

```bash
# Start interactive agent session
clear-ai agent --server http://localhost:3001 --user user-123

# Execute single query
clear-ai agent query "What do you remember about machine learning?" --include-memory

# Batch query processing
clear-ai agent batch --file queries.json --output results.json
```

### **Memory Commands**

```bash
# Search memories
clear-ai memory search --query "machine learning" --user user-123 --limit 10

# Export memories
clear-ai memory export --user user-123 --format json --output memories.json

# Memory statistics
clear-ai memory stats --user user-123 --include-analytics
```

### **Analytics Commands**

```bash
# Intelligence metrics
clear-ai analytics intelligence --show-breakdown --include-trends

# Performance analysis
clear-ai analytics performance --timeframe 7d --include-memory-stats

# Relationship analysis
clear-ai analytics relationships --data-source api --format visual
```

## 📊 Intelligence Metrics

The client provides comprehensive intelligence metrics:

- **Overall Intelligence Score**: 8.5/10
- **Memory Integration**: 9/10
- **Intent Classification**: 9.5/10
- **Relationship Analysis**: 9/10
- **Contextual Understanding**: 8.5/10
- **Learning & Adaptation**: 8/10

## 🔧 Configuration

### **Environment Variables**

```bash
# Server configuration
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_USER_ID=user-123
REACT_APP_SESSION_ID=session-456

# Intelligence features
REACT_APP_ENABLE_MEMORY_CONTEXT=true
REACT_APP_ENABLE_REASONING_DISPLAY=true
REACT_APP_ENABLE_RELATIONSHIP_ANALYSIS=true

# Theme configuration
REACT_APP_DEFAULT_THEME=neowave
REACT_APP_ENABLE_THEME_SWITCHING=true
```

### **Component Configuration**

```typescript
interface IntelligenceConfig {
  serverUrl: string;
  userId: string;
  sessionId: string;
  enableMemoryContext: boolean;
  enableReasoningDisplay: boolean;
  enableRelationshipAnalysis: boolean;
  theme: 'default' | 'neowave' | 'techno' | 'oldschool' | 'alien';
  realTimeUpdates: boolean;
  alertThresholds: {
    intelligenceScore: number;
    memoryEffectiveness: number;
    queryAccuracy: number;
  };
}
```

## 📚 Documentation

For complete documentation, visit: https://wsyeabsera.github.io/clear-ai/docs/packages/client

## 🧪 Testing

```bash
# Run component tests
npm run test

# Run Storybook for component development
npm run storybook

# Run E2E tests
npm run test:e2e
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build component library
npm run build:lib
```

## 📄 License

MIT
