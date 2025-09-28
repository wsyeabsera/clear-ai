"use strict";
/**
 * Session Manager for Clear AI Client
 *
 * Manages chat sessions and messages with persistent storage using IndexedDB
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const indexedDB_1 = require("./indexedDB");
const api_1 = require("./api");
class SessionManager {
    constructor(userId) {
        this.listeners = new Set();
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
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    // Get current state
    getState() {
        return { ...this.state };
    }
    // Update state and notify listeners
    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.listeners.forEach(listener => listener(this.state));
    }
    // Initialize session manager - load all sessions for user
    async initialize() {
        this.updateState({ isLoading: true, error: null });
        try {
            const sessions = await indexedDB_1.indexedDBService.getAllSessions(this.userId);
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
        }
        catch (error) {
            this.updateState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to initialize sessions',
            });
        }
    }
    // Create a new session
    async createSession(title = 'New Chat') {
        const now = new Date();
        const newSession = {
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
            await indexedDB_1.indexedDBService.saveSession(newSession);
            const updatedSessions = [newSession, ...this.state.sessions];
            this.updateState({
                sessions: updatedSessions,
                currentSession: newSession,
                messages: [], // Clear messages for new session
            });
            return newSession;
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to create session',
            });
            throw error;
        }
    }
    // Select a session and load its messages
    async selectSession(sessionId) {
        const session = this.state.sessions.find(s => s.id === sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        this.updateState({ isLoading: true, error: null });
        try {
            const messages = await indexedDB_1.indexedDBService.getMessagesForSession(sessionId);
            this.updateState({
                currentSession: session,
                messages,
                isLoading: false,
                error: null,
            });
        }
        catch (error) {
            this.updateState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load session',
            });
        }
    }
    // Update session metadata (title, lastMessage, etc.)
    async updateSession(sessionId, updates) {
        const session = this.state.sessions.find(s => s.id === sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        const updatedSession = {
            ...session,
            ...updates,
            updatedAt: new Date(),
        };
        try {
            await indexedDB_1.indexedDBService.saveSession(updatedSession);
            const updatedSessions = this.state.sessions.map(s => s.id === sessionId ? updatedSession : s);
            this.updateState({
                sessions: updatedSessions,
                currentSession: this.state.currentSession?.id === sessionId ? updatedSession : this.state.currentSession,
            });
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to update session',
            });
        }
    }
    // Delete a session and all its messages
    async deleteSession(sessionId) {
        try {
            // First, clear the episodic memory from Neo4j for this session
            try {
                await api_1.apiService.clearSessionMemories(this.userId, sessionId);
            }
            catch (memoryError) {
                console.warn('Failed to clear session memories from Neo4j:', memoryError);
                // Continue with local deletion even if memory clearing fails
            }
            // Then delete from IndexedDB
            await indexedDB_1.indexedDBService.deleteSession(sessionId);
            const updatedSessions = this.state.sessions.filter(s => s.id !== sessionId);
            // If we're deleting the current session, select another one or clear current
            let newCurrentSession = this.state.currentSession;
            let newMessages = this.state.messages;
            if (this.state.currentSession?.id === sessionId) {
                if (updatedSessions.length > 0) {
                    newCurrentSession = updatedSessions[0];
                    newMessages = await indexedDB_1.indexedDBService.getMessagesForSession(updatedSessions[0].id);
                }
                else {
                    newCurrentSession = null;
                    newMessages = [];
                }
            }
            this.updateState({
                sessions: updatedSessions,
                currentSession: newCurrentSession,
                messages: newMessages,
            });
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to delete session',
            });
        }
    }
    // Add a message to the current session
    async addMessage(message) {
        if (!this.state.currentSession) {
            throw new Error('No active session');
        }
        const now = new Date();
        const newMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sessionId: this.state.currentSession.id,
            userId: this.userId,
            timestamp: now,
        };
        try {
            await indexedDB_1.indexedDBService.saveMessage(newMessage);
            const updatedMessages = [...this.state.messages, newMessage];
            // Update session metadata
            const sessionUpdates = {
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
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to add message',
            });
            throw error;
        }
    }
    // Update an existing message
    async updateMessage(messageId, updates) {
        const messageIndex = this.state.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) {
            throw new Error('Message not found');
        }
        const updatedMessage = {
            ...this.state.messages[messageIndex],
            ...updates,
        };
        try {
            await indexedDB_1.indexedDBService.saveMessage(updatedMessage);
            const updatedMessages = this.state.messages.map(m => m.id === messageId ? updatedMessage : m);
            this.updateState({
                messages: updatedMessages,
            });
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to update message',
            });
        }
    }
    // Delete a message
    async deleteMessage(messageId) {
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
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to delete message',
            });
        }
    }
    // Clear all data for the user
    async clearAllData() {
        try {
            // First, clear all episodic memories from Neo4j for this user
            try {
                await api_1.apiService.clearUserMemories(this.userId);
            }
            catch (memoryError) {
                console.warn('Failed to clear user memories from Neo4j:', memoryError);
                // Continue with local deletion even if memory clearing fails
            }
            // Then clear from IndexedDB
            await indexedDB_1.indexedDBService.clearUserData(this.userId);
            this.updateState({
                sessions: [],
                currentSession: null,
                messages: [],
            });
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to clear data',
            });
        }
    }
    // Export conversation data
    async exportData() {
        try {
            return await indexedDB_1.indexedDBService.exportConversationData(this.userId);
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to export data',
            });
            throw error;
        }
    }
    // Import conversation data
    async importData(data) {
        try {
            await indexedDB_1.indexedDBService.importConversationData(data, this.userId);
            // Reload sessions after import
            await this.initialize();
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to import data',
            });
        }
    }
    // Get storage statistics
    async getStorageStats() {
        try {
            return await indexedDB_1.indexedDBService.getStorageStats(this.userId);
        }
        catch (error) {
            this.updateState({
                error: error instanceof Error ? error.message : 'Failed to get storage stats',
            });
            throw error;
        }
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=sessionManager.js.map