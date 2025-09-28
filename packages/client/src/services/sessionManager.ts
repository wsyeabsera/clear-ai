/**
 * Session Manager for Clear AI Client
 * 
 * Manages chat sessions and messages with persistent storage using IndexedDB
 */

import { indexedDBService, ChatSession, ChatMessage } from './indexedDB';

export interface SessionManagerState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export class SessionManager {
  private userId: string;
  private state: SessionManagerState;
  private listeners: Set<(state: SessionManagerState) => void> = new Set();

  constructor(userId: string) {
    this.userId = userId;
    this.state = {
      sessions: [],
      currentSession: null,
      messages: [],
      isLoading: false,
      error: null,
    };
  }

  // Subscribe to state changes
  subscribe(listener: (state: SessionManagerState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Get current state
  getState(): SessionManagerState {
    return { ...this.state };
  }

  // Update state and notify listeners
  private updateState(updates: Partial<SessionManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Initialize session manager - load all sessions for user
  async initialize(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const sessions = await indexedDBService.getAllSessions(this.userId);
      
      // Sort sessions by timestamp (most recent first)
      sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      this.updateState({
        sessions,
        isLoading: false,
        error: null,
      });

      // If there are sessions but no current session, select the most recent one
      if (sessions.length > 0 && !this.state.currentSession) {
        await this.selectSession(sessions[0].id);
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize sessions',
      });
    }
  }

  // Create a new session
  async createSession(title: string = 'New Chat'): Promise<ChatSession> {
    const now = new Date();
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title,
      lastMessage: 'Start a conversation...',
      timestamp: now,
      messageCount: 0,
      userId: this.userId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await indexedDBService.saveSession(newSession);
      
      const updatedSessions = [newSession, ...this.state.sessions];
      this.updateState({
        sessions: updatedSessions,
        currentSession: newSession,
        messages: [], // Clear messages for new session
      });

      return newSession;
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to create session',
      });
      throw error;
    }
  }

  // Select a session and load its messages
  async selectSession(sessionId: string): Promise<void> {
    const session = this.state.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    this.updateState({ isLoading: true, error: null });

    try {
      const messages = await indexedDBService.getMessagesForSession(sessionId);
      
      this.updateState({
        currentSession: session,
        messages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load session',
      });
    }
  }

  // Update session metadata (title, lastMessage, etc.)
  async updateSession(sessionId: string, updates: Partial<Pick<ChatSession, 'title' | 'lastMessage' | 'messageCount'>>): Promise<void> {
    const session = this.state.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession: ChatSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };

    try {
      await indexedDBService.saveSession(updatedSession);
      
      const updatedSessions = this.state.sessions.map(s => 
        s.id === sessionId ? updatedSession : s
      );
      
      this.updateState({
        sessions: updatedSessions,
        currentSession: this.state.currentSession?.id === sessionId ? updatedSession : this.state.currentSession,
      });
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to update session',
      });
    }
  }

  // Delete a session and all its messages
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await indexedDBService.deleteSession(sessionId);
      
      const updatedSessions = this.state.sessions.filter(s => s.id !== sessionId);
      
      // If we're deleting the current session, select another one or clear current
      let newCurrentSession = this.state.currentSession;
      let newMessages = this.state.messages;
      
      if (this.state.currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          newCurrentSession = updatedSessions[0];
          newMessages = await indexedDBService.getMessagesForSession(updatedSessions[0].id);
        } else {
          newCurrentSession = null;
          newMessages = [];
        }
      }

      this.updateState({
        sessions: updatedSessions,
        currentSession: newCurrentSession,
        messages: newMessages,
      });
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to delete session',
      });
    }
  }

  // Add a message to the current session
  async addMessage(message: Omit<ChatMessage, 'id' | 'sessionId' | 'userId' | 'timestamp'>): Promise<ChatMessage> {
    if (!this.state.currentSession) {
      throw new Error('No active session');
    }

    const now = new Date();
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.state.currentSession.id,
      userId: this.userId,
      timestamp: now,
    };

    try {
      await indexedDBService.saveMessage(newMessage);
      
      const updatedMessages = [...this.state.messages, newMessage];
      
      // Update session metadata
      const sessionUpdates: Partial<Pick<ChatSession, 'lastMessage' | 'messageCount'>> = {
        messageCount: this.state.currentSession.messageCount + 1,
      };

      // If this is the first message, update the title
      if (this.state.currentSession.messageCount === 0 && message.role === 'user') {
        sessionUpdates.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
      }

      // Update last message if this is an assistant response
      if (message.role === 'assistant') {
        sessionUpdates.lastMessage = message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '');
      }

      await this.updateSession(this.state.currentSession.id, sessionUpdates);

      this.updateState({
        messages: updatedMessages,
      });

      return newMessage;
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to add message',
      });
      throw error;
    }
  }

  // Update an existing message
  async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void> {
    const messageIndex = this.state.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }

    const updatedMessage: ChatMessage = {
      ...this.state.messages[messageIndex],
      ...updates,
    };

    try {
      await indexedDBService.saveMessage(updatedMessage);
      
      const updatedMessages = this.state.messages.map(m => 
        m.id === messageId ? updatedMessage : m
      );
      
      this.updateState({
        messages: updatedMessages,
      });
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to update message',
      });
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const message = this.state.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    try {
      // Note: We don't have a deleteMessage method in IndexedDB service yet
      // For now, we'll just remove it from the current state
      // In a real implementation, you'd want to add this to the IndexedDB service
      
      const updatedMessages = this.state.messages.filter(m => m.id !== messageId);
      
      // Update session message count
      if (this.state.currentSession) {
        await this.updateSession(this.state.currentSession.id, {
          messageCount: Math.max(0, this.state.currentSession.messageCount - 1),
        });
      }

      this.updateState({
        messages: updatedMessages,
      });
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to delete message',
      });
    }
  }

  // Clear all data for the user
  async clearAllData(): Promise<void> {
    try {
      await indexedDBService.clearUserData(this.userId);
      
      this.updateState({
        sessions: [],
        currentSession: null,
        messages: [],
      });
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to clear data',
      });
    }
  }

  // Export conversation data
  async exportData(): Promise<{ sessions: ChatSession[]; messages: ChatMessage[] }> {
    try {
      return await indexedDBService.exportConversationData(this.userId);
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to export data',
      });
      throw error;
    }
  }

  // Import conversation data
  async importData(data: { sessions: ChatSession[]; messages: ChatMessage[] }): Promise<void> {
    try {
      await indexedDBService.importConversationData(data, this.userId);
      
      // Reload sessions after import
      await this.initialize();
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to import data',
      });
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{ sessionCount: number; messageCount: number; totalStorageSize: number }> {
    try {
      return await indexedDBService.getStorageStats(this.userId);
    } catch (error) {
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to get storage stats',
      });
      throw error;
    }
  }
}

// Export types
export type { SessionManagerState };
