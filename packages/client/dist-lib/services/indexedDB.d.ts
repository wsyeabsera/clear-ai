/**
 * IndexedDB Service for Clear AI Client
 *
 * Provides persistent storage for chat sessions and messages using IndexedDB
 */
export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
    sessionId: string;
    userId: string;
    metadata?: {
        intent?: {
            type: string;
            confidence: number;
        };
        reasoning?: string;
        memoryContext?: any[];
    };
    fullResponseData?: any;
    isLoading?: boolean;
    error?: string;
}
export interface ConversationData {
    sessions: ChatSession[];
    messages: ChatMessage[];
}
declare class IndexedDBService {
    private db;
    private dbPromise;
    constructor();
    private initDB;
    private getDB;
    saveSession(session: ChatSession): Promise<void>;
    getSession(sessionId: string): Promise<ChatSession | null>;
    getAllSessions(userId: string): Promise<ChatSession[]>;
    deleteSession(sessionId: string): Promise<void>;
    saveMessage(message: ChatMessage): Promise<void>;
    getMessagesForSession(sessionId: string): Promise<ChatMessage[]>;
    getAllMessages(userId: string): Promise<ChatMessage[]>;
    exportConversationData(userId: string): Promise<ConversationData>;
    importConversationData(data: ConversationData, userId: string): Promise<void>;
    clearUserData(userId: string): Promise<void>;
    clearAllData(): Promise<void>;
    getStorageStats(userId: string): Promise<{
        sessionCount: number;
        messageCount: number;
        totalStorageSize: number;
    }>;
}
export declare const indexedDBService: IndexedDBService;
export default indexedDBService;
//# sourceMappingURL=indexedDB.d.ts.map