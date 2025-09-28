"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const index_1 = require("./index");
const ChatLayout = ({ onSendMessage, isLoading = false, error, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [currentSessionId, setCurrentSessionId] = (0, react_1.useState)('');
    const [sidebarCollapsed, setSidebarCollapsed] = (0, react_1.useState)(false);
    const messagesEndRef = (0, react_1.useRef)(null);
    // Auto-scroll to bottom when new messages arrive
    (0, react_1.useEffect)(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // Initialize with a default session
    (0, react_1.useEffect)(() => {
        if (sessions.length === 0) {
            const defaultSession = {
                id: `session-${Date.now()}`,
                title: 'New Chat',
                lastMessage: 'Start a conversation...',
                timestamp: new Date(),
                messageCount: 0,
            };
            setSessions([defaultSession]);
            setCurrentSessionId(defaultSession.id);
        }
    }, [sessions.length]);
    const layoutStyles = {
        display: 'flex',
        height: 'calc(100vh - 120px)', // Account for header
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.effects.borderRadius.lg,
        overflow: 'hidden',
        boxShadow: theme.effects.shadow.lg,
    };
    const chatAreaStyles = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background.paper,
    };
    const messagesAreaStyles = {
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: theme.colors.background.default,
    };
    const inputAreaStyles = {
        padding: '1rem',
        borderTop: `1px solid ${theme.colors.border.default}`,
        backgroundColor: theme.colors.background.paper,
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
        maxWidth: '600px',
    };
    const featureItemStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.effects.borderRadius.md,
        fontSize: theme.typography.fontSize.sm,
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
        if (!message.trim() || !currentSessionId)
            return;
        // Add user message immediately
        const userMessage = {
            id: `msg-${Date.now()}-user`,
            content: message,
            role: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        // Add loading message for assistant
        const loadingMessage = {
            id: `msg-${Date.now()}-loading`,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            isLoading: true,
        };
        setMessages(prev => [...prev, loadingMessage]);
        try {
            // Call the onSendMessage prop if provided
            if (onSendMessage) {
                const result = await onSendMessage(message, currentSessionId);
                // Replace loading message with actual AI response
                const assistantMessage = {
                    id: `msg-${Date.now()}-assistant`,
                    content: result.content,
                    role: 'assistant',
                    timestamp: new Date(),
                    metadata: result.metadata,
                    fullResponseData: result.fullResponseData,
                };
                setMessages(prev => {
                    const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
                    return [...filtered, assistantMessage];
                });
                // Update session
                updateSession(currentSessionId, message, result.content);
            }
            else {
                // Default behavior - simulate AI response
                setTimeout(() => {
                    const assistantMessage = {
                        id: `msg-${Date.now()}-assistant`,
                        content: `I received your message: "${message}". This is a placeholder response. Please integrate with the AI agent API to get real responses.`,
                        role: 'assistant',
                        timestamp: new Date(),
                        metadata: {
                            intent: {
                                type: 'general_query',
                                confidence: 0.95,
                            },
                            reasoning: 'This is a placeholder response. The actual AI agent integration is pending.',
                        },
                    };
                    setMessages(prev => {
                        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
                        return [...filtered, assistantMessage];
                    });
                    // Update session
                    updateSession(currentSessionId, message, assistantMessage.content);
                }, 1000);
            }
        }
        catch (error) {
            // Replace loading message with error
            const errorMessage = {
                id: `msg-${Date.now()}-error`,
                content: '',
                role: 'assistant',
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'An error occurred',
            };
            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
                return [...filtered, errorMessage];
            });
        }
    };
    const updateSession = (sessionId, userMessage, assistantResponse) => {
        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                return {
                    ...session,
                    title: session.title === 'New Chat' ? userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') : session.title,
                    lastMessage: assistantResponse.slice(0, 100) + (assistantResponse.length > 100 ? '...' : ''),
                    timestamp: new Date(),
                    messageCount: session.messageCount + 2, // User + Assistant
                };
            }
            return session;
        }));
    };
    const handleSessionSelect = (sessionId) => {
        setCurrentSessionId(sessionId);
        // In a real app, you'd load messages for this session
        // For now, we'll just clear messages when switching sessions
        setMessages([]);
    };
    const handleNewSession = () => {
        const newSession = {
            id: `session-${Date.now()}`,
            title: 'New Chat',
            lastMessage: 'Start a conversation...',
            timestamp: new Date(),
            messageCount: 0,
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
    };
    const handleDeleteSession = (sessionId) => {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        if (sessionId === currentSessionId) {
            const remainingSessions = sessions.filter(session => session.id !== sessionId);
            if (remainingSessions.length > 0) {
                setCurrentSessionId(remainingSessions[0].id);
                setMessages([]);
            }
            else {
                handleNewSession();
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: layoutStyles, children: [(0, jsx_runtime_1.jsx)(index_1.ChatSidebar, { sessions: sessions, currentSessionId: currentSessionId, onSessionSelect: handleSessionSelect, onNewSession: handleNewSession, onDeleteSession: handleDeleteSession, isCollapsed: sidebarCollapsed, onToggleCollapse: () => setSidebarCollapsed(!sidebarCollapsed) }), (0, jsx_runtime_1.jsxs)("div", { style: chatAreaStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: messagesAreaStyles, children: messages.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { style: welcomeMessageStyles, children: [(0, jsx_runtime_1.jsx)("h2", { style: welcomeTitleStyles, children: "Welcome to Clear AI Chat" }), (0, jsx_runtime_1.jsx)("p", { style: welcomeSubtitleStyles, children: "Start a conversation with your intelligent AI assistant" }), (0, jsx_runtime_1.jsxs)("div", { style: featureListStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83E\uDDE0" }), (0, jsx_runtime_1.jsx)("span", { children: "Advanced reasoning and memory integration" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDCAC" }), (0, jsx_runtime_1.jsx)("span", { children: "Natural conversation with context awareness" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDD27" }), (0, jsx_runtime_1.jsx)("span", { children: "Tool execution and workflow automation" })] }), (0, jsx_runtime_1.jsxs)("div", { style: featureItemStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: iconStyles, children: "\uD83D\uDCDA" }), (0, jsx_runtime_1.jsx)("span", { children: "Persistent memory across conversations" })] })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [messages.map((message) => ((0, jsx_runtime_1.jsx)(index_1.ChatMessage, { ...message }, message.id))), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] })) }), (0, jsx_runtime_1.jsx)("div", { style: inputAreaStyles, children: (0, jsx_runtime_1.jsx)(index_1.ChatInput, { onSendMessage: handleSendMessage, disabled: isLoading, placeholder: error ? 'Error occurred. Try again...' : 'Type your message...' }) })] })] }));
};
exports.ChatLayout = ChatLayout;
exports.default = exports.ChatLayout;
//# sourceMappingURL=ChatLayout.js.map