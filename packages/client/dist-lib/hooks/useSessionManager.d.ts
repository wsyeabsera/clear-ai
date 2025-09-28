/**
 * React Hook for Session Manager
 *
 * Provides a React-friendly interface to the SessionManager
 */
import { ChatSession, ChatMessage } from '../services/indexedDB';
export interface UseSessionManagerOptions {
    userId: string;
    autoInitialize?: boolean;
}
export interface UseSessionManagerReturn {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    initialize: () => Promise<void>;
    createSession: (title?: string) => Promise<ChatSession>;
    selectSession: (sessionId: string) => Promise<void>;
    updateSession: (sessionId: string, updates: Partial<Pick<ChatSession, 'title' | 'lastMessage' | 'messageCount'>>) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    addMessage: (message: Omit<ChatMessage, 'id' | 'sessionId' | 'userId' | 'timestamp'>) => Promise<ChatMessage>;
    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    clearAllData: () => Promise<void>;
    exportData: () => Promise<{
        sessions: ChatSession[];
        messages: ChatMessage[];
    }>;
    importData: (data: {
        sessions: ChatSession[];
        messages: ChatMessage[];
    }) => Promise<void>;
    getStorageStats: () => Promise<{
        sessionCount: number;
        messageCount: number;
        totalStorageSize: number;
    }>;
    isReady: boolean;
}
export declare function useSessionManager(options: UseSessionManagerOptions): UseSessionManagerReturn;
export default useSessionManager;
//# sourceMappingURL=useSessionManager.d.ts.map