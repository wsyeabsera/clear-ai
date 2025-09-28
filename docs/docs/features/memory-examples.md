# Memory System Examples

This guide provides practical examples and real-world scenarios showing how to use the Clear-AI Memory System effectively. Each example includes code snippets, explanations, and expected outcomes.

## 🎯 Example 1: Learning Assistant

### Scenario
You're building an AI tutor that helps users learn web development. The system needs to remember what each user has learned, track their progress, and provide personalized guidance.

### Implementation

#### 1. Store Learning Progress
```typescript
// When user completes a lesson
async function recordLessonCompletion(userId: string, lessonData: {
  topic: string;
  difficulty: string;
  score: number;
  timeSpent: number;
  concepts: string[];
}) {
  // Store episodic memory (what happened)
  await storeEpisodicMemory({
    id: `lesson-${Date.now()}`,
    userId,
    sessionId: `session-${Date.now()}`,
    content: `User completed ${lessonData.topic} lesson with score ${lessonData.score}`,
    context: {
      lessonType: 'tutorial',
      difficulty: lessonData.difficulty,
      timeSpent: lessonData.timeSpent
    },
    metadata: {
      source: 'learning-platform',
      importance: lessonData.score > 0.8 ? 0.9 : 0.6,
      tags: ['lesson', 'completion', lessonData.topic, ...lessonData.concepts]
    }
  });

  // Store semantic memory (knowledge gained)
  for (const concept of lessonData.concepts) {
    await storeSemanticMemory({
      id: `knowledge-${userId}-${concept}-${Date.now()}`,
      userId,
      content: `User learned about ${concept} in ${lessonData.topic} lesson`,
      concept: concept,
      category: 'learned-concepts',
      confidence: lessonData.score / 100,
      source: 'lesson-completion',
      timestamp: new Date().toISOString(),
      tags: [lessonData.topic, 'learning', 'concept']
    });
  }
}
```

#### 2. Provide Personalized Recommendations
```typescript
// When user asks for next steps
async function getPersonalizedRecommendations(userId: string, query: string) {
  // Search for what user has learned
  const learnedConcepts = await searchSemanticMemory(
    query,
    {
      userId,
      category: 'learned-concepts',
      minConfidence: 0.5
    },
    10
  );

  // Search for learning progress
  const progress = await searchEpisodicMemory({
    userId,
    query: 'lesson completion',
    limit: 20
  });

  // Analyze learning patterns
  const analysis = analyzeLearningPatterns(learnedConcepts, progress);
  
  // Generate recommendations
  const recommendations = generateRecommendations(analysis, query);
  
  return {
    learnedConcepts: learnedConcepts.map(c => c.concept),
    progress: analysis,
    recommendations
  };
}

function analyzeLearningPatterns(concepts: any[], progress: any[]) {
  const strengths = concepts
    .filter(c => c.confidence > 0.8)
    .map(c => c.concept);
    
  const weaknesses = concepts
    .filter(c => c.confidence < 0.6)
    .map(c => c.concept);
    
  const recentTopics = progress
    .slice(0, 5)
    .map(p => p.metadata.tags[0]);
    
  return {
    strengths,
    weaknesses,
    recentTopics,
    totalLessons: progress.length,
    averageScore: progress.reduce((sum, p) => sum + p.metadata.importance, 0) / progress.length
  };
}
```

#### 3. Track Learning Journey
```typescript
// Get user's learning journey
async function getLearningJourney(userId: string) {
  // Get all learning-related memories
  const memories = await searchMemories({
    userId,
    query: 'learning lesson tutorial',
    limit: 50
  });

  // Group by topic and timeline
  const journey = memories.reduce((acc, memory) => {
    const topic = memory.metadata.tags[0];
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push({
      date: memory.timestamp,
      content: memory.content,
      score: memory.metadata.importance
    });
    return acc;
  }, {});

  // Sort by date
  Object.keys(journey).forEach(topic => {
    journey[topic].sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  return journey;
}
```

### Expected Outcome
The system can now:
- Remember what each user has learned
- Track their progress over time
- Provide personalized next steps
- Identify strengths and weaknesses
- Show learning journey visualization

## 🎯 Example 2: Code Review Assistant

### Scenario
You're building an AI assistant that reviews code and provides feedback. The system needs to remember coding patterns, user preferences, and previous feedback to provide consistent, personalized reviews.

### Implementation

#### 1. Store Code Review Context
```typescript
// When user submits code for review
async function storeCodeReview(userId: string, codeData: {
  language: string;
  code: string;
  context: string;
  previousReviews?: string[];
}) {
  // Store the code submission
  await storeEpisodicMemory({
    id: `code-review-${Date.now()}`,
    userId,
    sessionId: `review-session-${Date.now()}`,
    content: `User submitted ${codeData.language} code for review`,
    context: {
      language: codeData.language,
      codeLength: codeData.code.length,
      hasContext: !!codeData.context
    },
    metadata: {
      source: 'code-review',
      importance: 0.8,
      tags: ['code-review', codeData.language, 'submission']
    }
  });

  // Store coding patterns
  const patterns = analyzeCodePatterns(codeData.code, codeData.language);
  for (const pattern of patterns) {
    await storeSemanticMemory({
      id: `pattern-${userId}-${pattern.type}-${Date.now()}`,
      userId,
      content: `User used ${pattern.type} pattern in ${codeData.language}`,
      concept: pattern.type,
      category: 'coding-patterns',
      confidence: pattern.confidence,
      source: 'code-analysis',
      timestamp: new Date().toISOString(),
      tags: [codeData.language, 'pattern', pattern.type]
    });
  }
}

function analyzeCodePatterns(code: string, language: string): any[] {
  const patterns = [];
  
  // Detect common patterns
  if (code.includes('async') && code.includes('await')) {
    patterns.push({ type: 'async-await', confidence: 0.9 });
  }
  
  if (code.includes('class ') && code.includes('extends')) {
    patterns.push({ type: 'inheritance', confidence: 0.8 });
  }
  
  if (code.includes('useState') || code.includes('useEffect')) {
    patterns.push({ type: 'react-hooks', confidence: 0.9 });
  }
  
  return patterns;
}
```

#### 2. Provide Contextual Feedback
```typescript
// Generate personalized code review
async function generateCodeReview(userId: string, codeData: any) {
  // Get user's coding history
  const codingHistory = await searchSemanticMemory(
    'coding patterns programming style',
    {
      userId,
      category: 'coding-patterns',
      limit: 20
    }
  );

  // Get previous feedback
  const previousFeedback = await searchEpisodicMemory({
    userId,
    query: 'code review feedback',
    limit: 10
  });

  // Analyze user's coding style
  const codingStyle = analyzeCodingStyle(codingHistory);
  
  // Generate personalized feedback
  const feedback = generatePersonalizedFeedback(codeData, codingStyle, previousFeedback);
  
  return {
    feedback,
    suggestions: generateSuggestions(codeData, codingStyle),
    patterns: codingStyle.patterns,
    improvements: identifyImprovements(codeData, codingStyle)
  };
}

function analyzeCodingStyle(history: any[]) {
  const patterns = history.map(h => h.concept);
  const patternCounts = patterns.reduce((acc, pattern) => {
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {});

  return {
    preferredPatterns: Object.keys(patternCounts)
      .sort((a, b) => patternCounts[b] - patternCounts[a])
      .slice(0, 5),
    patterns: patternCounts,
    totalPatterns: patterns.length
  };
}
```

#### 3. Track Improvement Over Time
```typescript
// Track coding improvement
async function trackCodingImprovement(userId: string) {
  // Get all code reviews over time
  const reviews = await searchEpisodicMemory({
    userId,
    query: 'code review',
    limit: 100
  });

  // Analyze improvement trends
  const trends = reviews
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(review => ({
      date: review.timestamp,
      score: review.metadata.importance,
      language: review.context.language,
      patterns: review.metadata.tags.filter(t => t !== 'code-review')
    }));

  // Calculate improvement metrics
  const improvement = calculateImprovementMetrics(trends);
  
  return {
    trends,
    improvement,
    recommendations: generateImprovementRecommendations(improvement)
  };
}
```

### Expected Outcome
The system can now:
- Remember user's coding patterns and preferences
- Provide consistent, personalized feedback
- Track improvement over time
- Suggest relevant coding practices
- Maintain context across multiple reviews

## 🎯 Example 3: Project Management Assistant

### Scenario
You're building an AI assistant for project management that helps teams track progress, remember decisions, and maintain context across multiple projects.

### Implementation

#### 1. Store Project Context
```typescript
// When starting a new project
async function initializeProject(projectData: {
  projectId: string;
  name: string;
  description: string;
  team: string[];
  technologies: string[];
}) {
  // Store project initialization
  await storeEpisodicMemory({
    id: `project-init-${projectData.projectId}`,
    userId: 'system',
    sessionId: `project-${projectData.projectId}`,
    content: `Project "${projectData.name}" initialized with team ${projectData.team.join(', ')}`,
    context: {
      projectId: projectData.projectId,
      teamSize: projectData.team.length,
      technologies: projectData.technologies
    },
    metadata: {
      source: 'project-management',
      importance: 0.9,
      tags: ['project', 'initialization', projectData.name, ...projectData.technologies]
    }
  });

  // Store project knowledge
  await storeSemanticMemory({
    id: `project-knowledge-${projectData.projectId}`,
    userId: 'system',
    content: `Project ${projectData.name}: ${projectData.description}`,
    concept: projectData.name,
    category: 'project-knowledge',
    confidence: 1.0,
    source: 'project-initialization',
    timestamp: new Date().toISOString(),
    tags: ['project', projectData.name, ...projectData.technologies]
  });
}
```

#### 2. Track Project Decisions
```typescript
// When making project decisions
async function recordProjectDecision(projectId: string, decision: {
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: string;
  madeBy: string;
}) {
  // Store decision
  await storeEpisodicMemory({
    id: `decision-${projectId}-${Date.now()}`,
    userId: decision.madeBy,
    sessionId: `project-${projectId}`,
    content: `Decision made: ${decision.decision}`,
    context: {
      projectId,
      decisionType: 'project-decision',
      alternatives: decision.alternatives,
      impact: decision.impact
    },
    metadata: {
      source: 'project-management',
      importance: 0.8,
      tags: ['decision', 'project', projectId, decision.madeBy]
    }
  });

  // Store decision rationale
  await storeSemanticMemory({
    id: `rationale-${projectId}-${Date.now()}`,
    userId: decision.madeBy,
    content: `Rationale for ${decision.decision}: ${decision.rationale}`,
    concept: decision.decision,
    category: 'project-decisions',
    confidence: 0.9,
    source: 'decision-making',
    timestamp: new Date().toISOString(),
    tags: ['decision', 'rationale', projectId, decision.madeBy]
  });
}
```

#### 3. Provide Project Context
```typescript
// Get project context for new team members
async function getProjectContext(projectId: string, userId: string) {
  // Get project history
  const projectHistory = await searchEpisodicMemory({
    userId: 'system',
    sessionId: `project-${projectId}`,
    limit: 50
  });

  // Get project decisions
  const decisions = await searchSemanticMemory(
    'project decisions rationale',
    {
      userId: 'system',
      category: 'project-decisions',
      limit: 20
    }
  );

  // Get team knowledge
  const teamKnowledge = await searchSemanticMemory(
    'team knowledge expertise',
    {
      userId: 'system',
      category: 'project-knowledge',
      limit: 10
    }
  );

  // Compile context
  const context = {
    projectHistory: projectHistory.map(h => ({
      date: h.timestamp,
      event: h.content,
      importance: h.metadata.importance
    })),
    decisions: decisions.map(d => ({
      decision: d.concept,
      rationale: d.content,
      date: d.timestamp
    })),
    teamKnowledge: teamKnowledge.map(k => ({
      concept: k.concept,
      description: k.content,
      confidence: k.confidence
    }))
  };

  return context;
}
```

### Expected Outcome
The system can now:
- Maintain project context across team members
- Track important decisions and rationale
- Provide onboarding information for new team members
- Remember project history and milestones
- Support knowledge transfer between team members

## 🎯 Example 4: Customer Support Assistant

### Scenario
You're building an AI customer support system that needs to remember customer interactions, preferences, and issue history to provide personalized support.

### Implementation

#### 1. Store Customer Interactions
```typescript
// When customer contacts support
async function recordCustomerInteraction(customerId: string, interaction: {
  type: 'email' | 'chat' | 'phone';
  issue: string;
  resolution: string;
  satisfaction: number;
  agent: string;
}) {
  // Store interaction
  await storeEpisodicMemory({
    id: `interaction-${customerId}-${Date.now()}`,
    userId: customerId,
    sessionId: `support-${Date.now()}`,
    content: `Customer ${customerId} contacted support about: ${interaction.issue}`,
    context: {
      interactionType: interaction.type,
      agent: interaction.agent,
      satisfaction: interaction.satisfaction,
      resolution: interaction.resolution
    },
    metadata: {
      source: 'customer-support',
      importance: interaction.satisfaction > 0.7 ? 0.8 : 0.6,
      tags: ['support', interaction.type, customerId, interaction.agent]
    }
  });

  // Store issue knowledge
  await storeSemanticMemory({
    id: `issue-${customerId}-${Date.now()}`,
    userId: customerId,
    content: `Issue: ${interaction.issue}. Resolution: ${interaction.resolution}`,
    concept: interaction.issue,
    category: 'customer-issues',
    confidence: 0.9,
    source: 'support-interaction',
    timestamp: new Date().toISOString(),
    tags: ['issue', 'resolution', customerId, interaction.type]
  });
}
```

#### 2. Provide Personalized Support
```typescript
// Get customer context for support agent
async function getCustomerContext(customerId: string) {
  // Get customer history
  const history = await searchEpisodicMemory({
    userId: customerId,
    query: 'support interaction',
    limit: 20
  });

  // Get previous issues
  const issues = await searchSemanticMemory(
    'customer issues problems',
    {
      userId: customerId,
      category: 'customer-issues',
      limit: 10
    }
  );

  // Analyze customer patterns
  const patterns = analyzeCustomerPatterns(history, issues);
  
  return {
    history: history.map(h => ({
      date: h.timestamp,
      type: h.context.interactionType,
      issue: h.content,
      satisfaction: h.context.satisfaction,
      agent: h.context.agent
    })),
    issues: issues.map(i => ({
      issue: i.concept,
      resolution: i.content,
      date: i.timestamp
    })),
    patterns,
    recommendations: generateSupportRecommendations(patterns)
  };
}

function analyzeCustomerPatterns(history: any[], issues: any[]) {
  const interactionTypes = history.map(h => h.context.interactionType);
  const satisfactionScores = history.map(h => h.context.satisfaction);
  const commonIssues = issues.map(i => i.concept);
  
  return {
    preferredContactMethod: getMostCommon(interactionTypes),
    averageSatisfaction: satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length,
    commonIssues: getMostCommon(commonIssues),
    totalInteractions: history.length,
    lastInteraction: history[0]?.timestamp
  };
}
```

#### 3. Track Support Metrics
```typescript
// Track support team performance
async function trackSupportMetrics(agentId: string, timeRange: string) {
  // Get agent's interactions
  const interactions = await searchEpisodicMemory({
    userId: agentId,
    query: 'support interaction',
    limit: 100
  });

  // Filter by time range
  const filteredInteractions = interactions.filter(i => 
    isWithinTimeRange(i.timestamp, timeRange)
  );

  // Calculate metrics
  const metrics = {
    totalInteractions: filteredInteractions.length,
    averageSatisfaction: filteredInteractions.reduce((sum, i) => 
      sum + i.context.satisfaction, 0) / filteredInteractions.length,
    resolutionRate: filteredInteractions.filter(i => 
      i.context.resolution).length / filteredInteractions.length,
    commonIssues: getMostCommonIssues(filteredInteractions)
  };

  return metrics;
}
```

### Expected Outcome
The system can now:
- Remember customer interaction history
- Provide personalized support based on past issues
- Track support team performance
- Identify common issues and solutions
- Improve customer satisfaction through context awareness

## 🎯 Example 5: Content Management System

### Scenario
You're building a content management system that needs to remember content preferences, user behavior, and content relationships to provide personalized content recommendations.

### Implementation

#### 1. Track Content Consumption
```typescript
// When user consumes content
async function trackContentConsumption(userId: string, contentData: {
  contentId: string;
  title: string;
  category: string;
  tags: string[];
  timeSpent: number;
  completionRate: number;
}) {
  // Store consumption event
  await storeEpisodicMemory({
    id: `consumption-${userId}-${Date.now()}`,
    userId,
    sessionId: `content-session-${Date.now()}`,
    content: `User consumed content: ${contentData.title}`,
    context: {
      contentId: contentData.contentId,
      category: contentData.category,
      timeSpent: contentData.timeSpent,
      completionRate: contentData.completionRate
    },
    metadata: {
      source: 'content-management',
      importance: contentData.completionRate > 0.8 ? 0.9 : 0.6,
      tags: ['content', 'consumption', contentData.category, ...contentData.tags]
    }
  });

  // Store content preferences
  await storeSemanticMemory({
    id: `preference-${userId}-${contentData.contentId}`,
    userId,
    content: `User preference for ${contentData.category} content: ${contentData.title}`,
    concept: contentData.category,
    category: 'content-preferences',
    confidence: contentData.completionRate,
    source: 'content-consumption',
    timestamp: new Date().toISOString(),
    tags: ['preference', contentData.category, ...contentData.tags]
  });
}
```

#### 2. Generate Content Recommendations
```typescript
// Generate personalized content recommendations
async function generateContentRecommendations(userId: string, limit: number = 10) {
  // Get user preferences
  const preferences = await searchSemanticMemory(
    'content preferences categories',
    {
      userId,
      category: 'content-preferences',
      limit: 20
    }
  );

  // Get consumption history
  const history = await searchEpisodicMemory({
    userId,
    query: 'content consumption',
    limit: 50
  });

  // Analyze user behavior
  const behavior = analyzeUserBehavior(preferences, history);
  
  // Generate recommendations
  const recommendations = generateRecommendations(behavior, limit);
  
  return {
    recommendations,
    preferences: behavior.preferences,
    patterns: behavior.patterns,
    confidence: behavior.confidence
  };
}

function analyzeUserBehavior(preferences: any[], history: any[]) {
  const categories = preferences.map(p => p.concept);
  const categoryScores = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const timeSpent = history.map(h => h.context.timeSpent);
  const completionRates = history.map(h => h.context.completionRate);
  
  return {
    preferences: Object.keys(categoryScores)
      .sort((a, b) => categoryScores[b] - categoryScores[a])
      .slice(0, 5),
    averageTimeSpent: timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length,
    averageCompletionRate: completionRates.reduce((a, b) => a + b, 0) / completionRates.length,
    totalContent: history.length,
    patterns: identifyContentPatterns(history)
  };
}
```

#### 3. Track Content Performance
```typescript
// Track content performance across users
async function trackContentPerformance(contentId: string) {
  // Get all consumption events for this content
  const consumptions = await searchEpisodicMemory({
    query: `content consumption ${contentId}`,
    limit: 100
  });

  // Calculate performance metrics
  const metrics = {
    totalViews: consumptions.length,
    averageTimeSpent: consumptions.reduce((sum, c) => 
      sum + c.context.timeSpent, 0) / consumptions.length,
    averageCompletionRate: consumptions.reduce((sum, c) => 
      sum + c.context.completionRate, 0) / consumptions.length,
    userSatisfaction: consumptions.reduce((sum, c) => 
      sum + c.metadata.importance, 0) / consumptions.length,
    topUsers: getTopUsers(consumptions)
  };

  return metrics;
}
```

### Expected Outcome
The system can now:
- Track user content consumption patterns
- Generate personalized content recommendations
- Analyze content performance across users
- Identify popular content categories
- Improve content discovery and engagement

## 🚀 Best Practices for Examples

### 1. Memory Organization
- **Use consistent naming**: Follow naming conventions for IDs and tags
- **Categorize properly**: Use appropriate categories for different memory types
- **Set importance levels**: Use importance scores to prioritize memories
- **Include timestamps**: Always include timestamps for temporal analysis

### 2. Query Optimization
- **Use appropriate limits**: Don't fetch more data than needed
- **Filter effectively**: Use filters to narrow down results
- **Cache frequently accessed data**: Implement caching for performance
- **Monitor query performance**: Track query times and optimize as needed

### 3. Error Handling
- **Handle missing data**: Always check for null/undefined values
- **Implement fallbacks**: Provide default values when data is missing
- **Log errors**: Log errors for debugging and monitoring
- **Graceful degradation**: Continue functioning even when some features fail

### 4. Security and Privacy
- **User isolation**: Never mix data between users
- **Input validation**: Sanitize all user inputs
- **Access control**: Implement proper authentication and authorization
- **Data encryption**: Use encryption for sensitive data

## 🎯 Next Steps

Now that you've seen practical examples, explore:

1. **[Troubleshooting Guide](./memory-troubleshooting.md)** - Common issues and solutions
2. **[Memory System Overview](./memory-system-overview.md)** - Complete system understanding
3. **[Neo4j Integration](./neo4j-integration.md)** - Deep dive into episodic memory
4. **[Pinecone Vectors](./pinecone-vectors.md)** - Understanding semantic memory

---

*Ready to troubleshoot issues? Check out the [Troubleshooting Guide](./memory-troubleshooting.md)!*
