/**
 * Memory System Integration Example
 * 
 * This example shows how to integrate the memory system with your existing
 * LangChain/LangGraph workflows for intelligent memory management.
 */

import { MemoryContextService } from '@clear-ai/shared';
import { SimpleLangChainService } from '@clear-ai/shared';

// Configuration
const memoryConfig = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
    database: process.env.NEO4J_DATABASE || 'neo4j'
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'clear-ai-memories'
  },
  embedding: {
    model: process.env.MEMORY_EMBEDDING_MODEL || 'nomic-embed-text',
    dimensions: parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS || '768')
  }
};

const langchainConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: 'gpt-3.5-turbo',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  mistralModel: 'mistral-small',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: 'llama3-8b-8192',
  ollamaModel: 'llama2',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY || '',
  langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  langfuseBaseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
};

class IntelligentChatBot {
  private memoryService: MemoryContextService;
  private langchainService: SimpleLangChainService;

  constructor() {
    this.memoryService = new MemoryContextService(memoryConfig, langchainConfig);
    this.langchainService = new SimpleLangChainService(langchainConfig);
  }

  async initialize() {
    await this.memoryService.initialize();
    await this.langchainService.initialize();
    console.log('✅ Intelligent ChatBot initialized with memory');
  }

  async chat(userId: string, sessionId: string, message: string): Promise<string> {
    try {
      // 1. Store user message in episodic memory
      const userMemory = await this.memoryService.storeEpisodicMemory({
        userId,
        sessionId,
        timestamp: new Date(),
        content: message,
        context: { 
          conversation_turn: Date.now(),
          user_input: true 
        },
        metadata: {
          source: 'chat',
          importance: 0.7,
          tags: ['user_message', 'chat'],
          location: 'web_interface'
        },
        relationships: {
          previous: undefined,
          next: undefined,
          related: []
        }
      });

      // 2. Enhance context with relevant memories
      const enhanced = await this.memoryService.enhanceContextWithMemories(
        userId, 
        sessionId, 
        message
      );

      // 3. Generate response using LangChain with memory context
      const prompt = this.buildPrompt(enhanced.enhancedContext, message);
      const response = await this.langchainService.generateResponse(prompt);

      // 4. Store AI response in episodic memory
      const aiMemory = await this.memoryService.storeEpisodicMemory({
        userId,
        sessionId,
        timestamp: new Date(),
        content: response,
        context: { 
          conversation_turn: Date.now(),
          ai_response: true,
          related_to: userMemory.id
        },
        metadata: {
          source: 'ai',
          importance: 0.8,
          tags: ['ai_response', 'chat'],
          location: 'web_interface'
        },
        relationships: {
          previous: userMemory.id,
          next: undefined,
          related: [userMemory.id]
        }
      });

      // 5. Update user memory with next relationship
      await this.memoryService.updateEpisodicMemory(userMemory.id, {
        relationships: {
          ...userMemory.relationships,
          next: aiMemory.id
        }
      });

      // 6. Extract and store knowledge if relevant
      await this.extractAndStoreKnowledge(userId, message, response);

      return response;

    } catch (error) {
      console.error('Error in chat:', error);
      return 'I apologize, but I encountered an error processing your message.';
    }
  }

  private buildPrompt(context: string, message: string): string {
    return `
Context from previous conversations:
${context}

Current user message: ${message}

Please provide a helpful response that takes into account the context from previous conversations. Be conversational and relevant to what the user has discussed before.
`;
  }

  private async extractAndStoreKnowledge(
    userId: string, 
    userMessage: string, 
    aiResponse: string
  ): Promise<void> {
    try {
      // Simple knowledge extraction - in a real implementation, 
      // you might use more sophisticated NLP techniques
      const knowledgeKeywords = this.extractKeywords(userMessage + ' ' + aiResponse);
      
      for (const keyword of knowledgeKeywords) {
        if (keyword.length > 3) { // Only store meaningful concepts
          await this.memoryService.storeSemanticMemory({
            userId,
            concept: keyword,
            description: `Concept mentioned in conversation: ${keyword}`,
            metadata: {
              category: 'conversation',
              confidence: 0.6,
              source: 'chat_extraction',
              lastAccessed: new Date(),
              accessCount: 0
            },
            relationships: {
              similar: [],
              parent: undefined,
              children: []
            }
          });
        }
      }
    } catch (error) {
      console.error('Error storing knowledge:', error);
    }
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - replace with more sophisticated NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use']);
    
    return [...new Set(words.filter(word => !stopWords.has(word)))];
  }

  async getConversationHistory(userId: string, sessionId: string): Promise<any[]> {
    const context = await this.memoryService.getMemoryContext(userId, sessionId);
    return context.episodic;
  }

  async searchKnowledge(userId: string, query: string): Promise<any[]> {
    const results = await this.memoryService.searchSemanticMemories({
      userId,
      query,
      threshold: 0.7,
      limit: 10
    });
    return results;
  }

  async getMemoryStats(userId: string): Promise<any> {
    return await this.memoryService.getMemoryStats(userId);
  }

  async clearUserMemories(userId: string): Promise<boolean> {
    return await this.memoryService.clearUserMemories(userId);
  }
}

// Usage example
async function main() {
  const chatbot = new IntelligentChatBot();
  await chatbot.initialize();

  const userId = 'user123';
  const sessionId = 'session456';

  // Example conversation
  console.log('Starting conversation...');
  
  let response = await chatbot.chat(userId, sessionId, 'Hi, I want to learn about machine learning');
  console.log('AI:', response);

  response = await chatbot.chat(userId, sessionId, 'What are the main types of machine learning?');
  console.log('AI:', response);

  response = await chatbot.chat(userId, sessionId, 'Can you explain supervised learning?');
  console.log('AI:', response);

  // Get conversation history
  const history = await chatbot.getConversationHistory(userId, sessionId);
  console.log('\nConversation history:', history.length, 'messages');

  // Search for knowledge
  const knowledge = await chatbot.searchKnowledge(userId, 'supervised learning');
  console.log('\nFound knowledge:', knowledge.length, 'items');

  // Get memory statistics
  const stats = await chatbot.getMemoryStats(userId);
  console.log('\nMemory stats:', stats);
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { IntelligentChatBot };
