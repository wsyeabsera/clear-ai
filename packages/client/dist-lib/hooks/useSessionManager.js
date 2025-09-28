"use strict";
/**
 * React Hook for Session Manager
 *
 * Provides a React-friendly interface to the SessionManager
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSessionManager = useSessionManager;
const react_1 = require("react");
const sessionManager_1 = require("../services/sessionManager");
function useSessionManager(options) {
    const { userId, autoInitialize = true } = options;
    // Create session manager instance
    const sessionManagerRef = (0, react_1.useRef)(null);
    if (!sessionManagerRef.current) {
        sessionManagerRef.current = new sessionManager_1.SessionManager(userId);
    }
    // Local state that syncs with session manager
    const [state, setState] = (0, react_1.useState)({
        sessions: [],
        currentSession: null,
        messages: [],
        isLoading: false,
        error: null,
    });
    // Subscribe to session manager state changes
    (0, react_1.useEffect)(() => {
        const unsubscribe = sessionManagerRef.current.subscribe((newState) => {
            setState(newState);
        });
        return unsubscribe;
    }, []);
    // Auto-initialize if enabled
    (0, react_1.useEffect)(() => {
        if (autoInitialize && !state.isLoading && state.sessions.length === 0 && !state.error) {
            initialize();
        }
    }, [autoInitialize, state.isLoading, state.sessions.length, state.error]);
    // Action wrappers with error handling
    const initialize = (0, react_1.useCallback)(async () => {
        try {
            await sessionManagerRef.current.initialize();
        }
        catch (error) {
            console.error('Failed to initialize session manager:', error);
            throw error;
        }
    }, []);
    const createSession = (0, react_1.useCallback)(async (title) => {
        try {
            return await sessionManagerRef.current.createSession(title);
        }
        catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    }, []);
    const selectSession = (0, react_1.useCallback)(async (sessionId) => {
        try {
            await sessionManagerRef.current.selectSession(sessionId);
        }
        catch (error) {
            console.error('Failed to select session:', error);
            throw error;
        }
    }, []);
    const updateSession = (0, react_1.useCallback)(async (sessionId, updates) => {
        try {
            await sessionManagerRef.current.updateSession(sessionId, updates);
        }
        catch (error) {
            console.error('Failed to update session:', error);
            throw error;
        }
    }, []);
    const deleteSession = (0, react_1.useCallback)(async (sessionId) => {
        try {
            await sessionManagerRef.current.deleteSession(sessionId);
        }
        catch (error) {
            console.error('Failed to delete session:', error);
            throw error;
        }
    }, []);
    const addMessage = (0, react_1.useCallback)(async (message) => {
        try {
            return await sessionManagerRef.current.addMessage(message);
        }
        catch (error) {
            console.error('Failed to add message:', error);
            throw error;
        }
    }, []);
    const updateMessage = (0, react_1.useCallback)(async (messageId, updates) => {
        try {
            await sessionManagerRef.current.updateMessage(messageId, updates);
        }
        catch (error) {
            console.error('Failed to update message:', error);
            throw error;
        }
    }, []);
    const deleteMessage = (0, react_1.useCallback)(async (messageId) => {
        try {
            await sessionManagerRef.current.deleteMessage(messageId);
        }
        catch (error) {
            console.error('Failed to delete message:', error);
            throw error;
        }
    }, []);
    const clearAllData = (0, react_1.useCallback)(async () => {
        try {
            await sessionManagerRef.current.clearAllData();
        }
        catch (error) {
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }, []);
    const exportData = (0, react_1.useCallback)(async () => {
        try {
            return await sessionManagerRef.current.exportData();
        }
        catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }, []);
    const importData = (0, react_1.useCallback)(async (data) => {
        try {
            await sessionManagerRef.current.importData(data);
        }
        catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }, []);
    const getStorageStats = (0, react_1.useCallback)(async () => {
        try {
            return await sessionManagerRef.current.getStorageStats();
        }
        catch (error) {
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
exports.default = useSessionManager;
//# sourceMappingURL=useSessionManager.js.map