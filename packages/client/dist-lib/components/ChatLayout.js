"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const index_1 = require("./index");
const useSessionManager_1 = require("../hooks/useSessionManager");
const ChatLayout = ({ userId, onSendMessage, isLoading = false, error, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [sidebarCollapsed, setSidebarCollapsed] = (0, react_1.useState)(false);
    const [currentPrompt, setCurrentPrompt] = (0, react_1.useState)('');
    const messagesEndRef = (0, react_1.useRef)(null);
    // Use session manager for persistent storage
    const { sessions, currentSession, messages: dbMessages, isLoading: sessionLoading, error: sessionError, createSession, selectSession, deleteSession, addMessage, updateMessage, } = (0, useSessionManager_1.useSessionManager)({ userId, autoInitialize: true });
    // Convert DB messages to ChatMessageProps format
    const messages = dbMessages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
        fullResponseData: msg.fullResponseData,
        isLoading: msg.isLoading,
        error: msg.error,
    }));
    // Auto-scroll to bottom when new messages arrive
    (0, react_1.useEffect)(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const layoutStyles = {
        display: 'flex',
        minHeight: 'calc(100vh - 120px)', // Account for header
        height: 'fit-content',
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: theme.effects.borderRadius.lg,
        overflow: 'visible',
    };
    const chatAreaStyles = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
    };
    const messagesAreaStyles = {
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: 'transparent',
        minHeight: '400px',
        maxHeight: 'calc(100vh - 200px)',
    };
    const inputAreaStyles = {
        padding: '1rem',
        backgroundColor: 'transparent',
    };
    const welcomeMessageStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: theme.colors.text.secondary,
        padding: '2rem',
    };
    const welcomeTitleStyles = {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: '1rem',
    };
    const welcomeSubtitleStyles = {
        fontSize: theme.typography.fontSize.lg,
        marginBottom: '2rem',
    };
    const featureListStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
    };
    const featureItemStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0',
        backgroundColor: 'transparent',
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    };
    const iconStyles = {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
    };
    const handleSendMessage = async (message) => {
        if (!message.trim())
            return;
        // Ensure we have a current session
        let sessionId = currentSession?.id;
        if (!sessionId) {
            try {
                const newSession = await createSession();
                sessionId = newSession.id;
            }
            catch (error) {
                console.error('Failed to create session:', error);
                return;
            }
        }
        try {
            // Add user message to database
            await addMessage({
                content: message,
                role: 'user',
            });
            // Add loading message for assistant
            const loadingMessage = await addMessage({
                content: '',
                role: 'assistant',
                isLoading: true,
            });
            // Call the onSendMessage prop if provided
            if (onSendMessage) {
                const result = await onSendMessage(message, sessionId);
                // Update loading message with actual AI response
                await updateMessage(loadingMessage.id, {
                    content: result.content,
                    metadata: result.metadata,
                    fullResponseData: result.fullResponseData,
                    isLoading: false,
                });
                // Clear the prompt after sending
                setCurrentPrompt('');
            }
            else {
                // Default behavior - simulate AI response
                setTimeout(async () => {
                    await updateMessage(loadingMessage.id, {
                        content: `I received your message: "${message}". This is a placeholder response. Please integrate with the AI agent API to get real responses.`,
                        metadata: {
                            intent: {
                                type: 'general_query',
                                confidence: 0.95,
                            },
                            reasoning: 'This is a placeholder response. The actual AI agent integration is pending.',
                        },
                        isLoading: false,
                    });
                    // Clear the prompt after sending
                    setCurrentPrompt('');
                }, 1000);
            }
        }
        catch (error) {
            // Update loading message with error
            try {
                const loadingMessage = messages.find(msg => msg.isLoading);
                if (loadingMessage) {
                    await updateMessage(loadingMessage.id, {
                        content: '',
                        error: error instanceof Error ? error.message : 'An error occurred',
                        isLoading: false,
                    });
                }
            }
            catch (updateError) {
                console.error('Failed to update message with error:', updateError);
            }
        }
    };
    const handleSessionSelect = async (sessionId) => {
        try {
            await selectSession(sessionId);
        }
        catch (error) {
            console.error('Failed to select session:', error);
        }
    };
    const handleNewSession = async () => {
        try {
            await createSession();
        }
        catch (error) {
            console.error('Failed to create new session:', error);
        }
    };
    const handleDeleteSession = async (sessionId) => {
        try {
            await deleteSession(sessionId);
        }
        catch (error) {
            console.error('Failed to delete session:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: layoutStyles, children: [(0, jsx_runtime_1.jsx)(index_1.ChatSidebar, { sessions: sessions, currentSessionId: currentSession?.id, onSessionSelect: handleSessionSelect, onNewSession: handleNewSession, onDeleteSession: handleDeleteSession, isCollapsed: sidebarCollapsed, onToggleCollapse: () => setSidebarCollapsed(!sidebarCollapsed) }), (0, jsx_runtime_1.jsxs)("div", { style: chatAreaStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: messagesAreaStyles, children: messages.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { style: welcomeMessageStyles, children: [(0, jsx_runtime_1.jsx)("h2", { style: welcomeTitleStyles, children: "Welcome to Clear AI Chat" }), (0, jsx_runtime_1.jsx)("p", { style: welcomeSubtitleStyles, children: "Start a conversation with your intelligent AI assistant" }), (0, jsx_runtime_1.jsxs)("div", { style: featureListStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83E\uDDE0" }), (0, jsx_runtime_1.jsx)("span", { children: "Advanced reasoning and memory integration" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDCAC" }), (0, jsx_runtime_1.jsx)("span", { children: "Natural conversation with context awareness" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDD27" }), (0, jsx_runtime_1.jsx)("span", { children: "Tool execution and workflow automation" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDCDA" }), (0, jsx_runtime_1.jsx)("span", { children: "Persistent memory across conversations" })] })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [messages.map((message) => ((0, jsx_runtime_1.jsx)(index_1.ChatMessage, { ...message }, message.id))), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] })) }), (0, jsx_runtime_1.jsx)("div", { style: inputAreaStyles, children: (0, jsx_runtime_1.jsx)(index_1.ChatInput, { onSendMessage: handleSendMessage, disabled: isLoading || sessionLoading, placeholder: error || sessionError ? 'Error occurred. Try again...' : 'Type your message...', value: currentPrompt, onChange: setCurrentPrompt, showPromptSelector: true }) })] })] }));
};
exports.ChatLayout = ChatLayout;
exports.default = exports.ChatLayout;
//# sourceMappingURL=ChatLayout.js.map