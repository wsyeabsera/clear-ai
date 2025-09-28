/**
 * Session Manager for Clear AI Client
 *
 * Manages chat sessions and messages with persistent storage using IndexedDB
 */
import { ChatSession, ChatMessage } from './indexedDB';
export interface SessionManagerState {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
}
export declare class SessionManager {
    private userId;
    private state;
    private listeners;
    constructor(userId: string);
    subscribe(listener: (state: SessionManagerState) => void): () => void;
    getState(): SessionManagerState;
    private updateState;
    initialize(): Promise<void>;
    createSession(title?: string): Promise<ChatSession>;
    selectSession(sessionId: string): Promise<void>;
    updateSession(sessionId: string, updates: Partial<Pick<ChatSession, 'title' | 'lastMessage' | 'messageCount'>>): Promise<void>;
    clearSemanticMemories(): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
    addMessage(message: Omit<ChatMessage, 'id' | 'sessionId' | 'userId' | 'timestamp'>): Promise<ChatMessage>;
    updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void>;
    deleteMessage(messageId: string): Promise<void>;
    clearAllData(): Promise<void>;
    exportData(): Promise<{
        sessions: ChatSession[];
        messages: ChatMessage[];
    }>;
    importData(data: {
        sessions: ChatSession[];
        messages: ChatMessage[];
    }): Promise<void>;
    getStorageStats(): Promise<{
        sessionCount: number;
        messageCount: number;
        totalStorageSize: number;
    }>;
}
export type { SessionManagerState as SessionManagerStateType };
//# sourceMappingURL=sessionManager.d.ts.map