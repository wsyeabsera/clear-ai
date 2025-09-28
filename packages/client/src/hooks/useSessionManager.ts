/**
 * React Hook for Session Manager
 * 
 * Provides a React-friendly interface to the SessionManager
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionManager, SessionManagerState } from '../services/sessionManager';
import { ChatSession, ChatMessage } from '../services/indexedDB';

export interface UseSessionManagerOptions {
  userId: string;
  autoInitialize?: boolean;
}

export interface UseSessionManagerReturn {
  // State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  createSession: (title?: string) => Promise<ChatSession>;
  selectSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Pick<ChatSession, 'title' | 'lastMessage' | 'messageCount'>>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'sessionId' | 'userId' | 'timestamp'>) => Promise<ChatMessage>;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<{ sessions: ChatSession[]; messages: ChatMessage[] }>;
  importData: (data: { sessions: ChatSession[]; messages: ChatMessage[] }) => Promise<void>;
  getStorageStats: () => Promise<{ sessionCount: number; messageCount: number; totalStorageSize: number }>;

  // Utilities
  isReady: boolean;
}

export function useSessionManager(options: UseSessionManagerOptions): UseSessionManagerReturn {
  const { userId, autoInitialize = true } = options;
  
  // Create session manager instance
  const sessionManagerRef = useRef<SessionManager | null>(null);
  if (!sessionManagerRef.current) {
    sessionManagerRef.current = new SessionManager(userId);
  }

  // Local state that syncs with session manager
  const [state, setState] = useState<SessionManagerState>({
    sessions: [],
    currentSession: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  // Subscribe to session manager state changes
  useEffect(() => {
    const unsubscribe = sessionManagerRef.current!.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Auto-initialize if enabled
  useEffect(() => {
    if (autoInitialize && !state.isLoading && state.sessions.length === 0 && !state.error) {
      initialize();
    }
  }, [autoInitialize, state.isLoading, state.sessions.length, state.error]);

  // Action wrappers with error handling
  const initialize = useCallback(async (): Promise<void> => {
    try {
      await sessionManagerRef.current!.initialize();
    } catch (error) {
      console.error('Failed to initialize session manager:', error);
      throw error;
    }
  }, []);

  const createSession = useCallback(async (title?: string): Promise<ChatSession> => {
    try {
      return await sessionManagerRef.current!.createSession(title);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, []);

  const selectSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await sessionManagerRef.current!.selectSession(sessionId);
    } catch (error) {
      console.error('Failed to select session:', error);
      throw error;
    }
  }, []);

  const updateSession = useCallback(async (
    sessionId: string, 
    updates: Partial<Pick<ChatSession, 'title' | 'lastMessage' | 'messageCount'>>
  ): Promise<void> => {
    try {
      await sessionManagerRef.current!.updateSession(sessionId, updates);
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await sessionManagerRef.current!.deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }, []);

  const addMessage = useCallback(async (
    message: Omit<ChatMessage, 'id' | 'sessionId' | 'userId' | 'timestamp'>
  ): Promise<ChatMessage> => {
    try {
      return await sessionManagerRef.current!.addMessage(message);
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }, []);

  const updateMessage = useCallback(async (
    messageId: string, 
    updates: Partial<ChatMessage>
  ): Promise<void> => {
    try {
      await sessionManagerRef.current!.updateMessage(messageId, updates);
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await sessionManagerRef.current!.deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await sessionManagerRef.current!.clearAllData();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback(async (): Promise<{ sessions: ChatSession[]; messages: ChatMessage[] }> => {
    try {
      return await sessionManagerRef.current!.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (
    data: { sessions: ChatSession[]; messages: ChatMessage[] }
  ): Promise<void> => {
    try {
      await sessionManagerRef.current!.importData(data);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, []);

  const getStorageStats = useCallback(async (): Promise<{
    sessionCount: number;
    messageCount: number;
    totalStorageSize: number;
  }> => {
    try {
      return await sessionManagerRef.current!.getStorageStats();
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }, []);

  return {
    // State
    sessions: state.sessions,
    currentSession: state.currentSession,
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    initialize,
    createSession,
    selectSession,
    updateSession,
    deleteSession,
    addMessage,
    updateMessage,
    deleteMessage,
    clearAllData,
    exportData,
    importData,
    getStorageStats,

    // Utilities
    isReady: !state.isLoading && !state.error,
  };
}

export default useSessionManager;
