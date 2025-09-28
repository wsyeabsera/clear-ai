"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const ChatSidebar = ({ sessions, currentSessionId, onSessionSelect, onNewSession, onDeleteSession, isCollapsed = false, onToggleCollapse, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const sidebarStyles = {
        width: isCollapsed ? '60px' : '280px',
        height: '100%',
        backgroundColor: theme.colors.background.paper,
        borderRight: `1px solid ${theme.colors.border.default}`,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.effects.transition.normal,
        overflow: 'hidden',
    };
    const headerStyles = {
        padding: '1rem',
        borderBottom: `1px solid ${theme.colors.border.default}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '60px',
    };
    const titleStyles = {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        opacity: isCollapsed ? 0 : 1,
        transition: theme.effects.transition.normal,
    };
    const newChatButtonStyles = {
        padding: '0.5rem',
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.background.default,
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.effects.transition.normal,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: isCollapsed ? 0 : 1,
        width: isCollapsed ? '40px' : 'auto',
        justifyContent: 'center',
        '&:hover': {
            backgroundColor: theme.colors.primary.dark,
            transform: 'translateY(-1px)',
        },
    };
    const collapseButtonStyles = {
        padding: '0.5rem',
        backgroundColor: 'transparent',
        color: theme.colors.text.secondary,
        border: 'none',
        borderRadius: theme.effects.borderRadius.sm,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.sm,
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.interactive.hover,
            color: theme.colors.text.primary,
        },
    };
    const sessionsListStyles = {
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
    };
    const sessionItemStyles = (isActive) => ({
        padding: '0.75rem',
        marginBottom: '0.5rem',
        backgroundColor: isActive
            ? theme.colors.primary.main + '20'
            : 'transparent',
        border: isActive
            ? `1px solid ${theme.colors.primary.main}40`
            : `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        cursor: 'pointer',
        transition: theme.effects.transition.normal,
        position: 'relative',
        opacity: isCollapsed ? 0 : 1,
        overflow: 'hidden',
        '&:hover': {
            backgroundColor: isActive
                ? theme.colors.primary.main + '30'
                : theme.colors.interactive.hover,
            transform: 'translateY(-1px)',
            boxShadow: theme.effects.shadow.sm,
        },
    });
    const sessionTitleStyles = {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        marginBottom: '0.25rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };
    const sessionPreviewStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.disabled,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: '0.25rem',
    };
    const sessionMetaStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.disabled,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };
    const deleteButtonStyles = {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        padding: '0.25rem',
        backgroundColor: theme.colors.status.error + '20',
        color: theme.colors.status.error,
        border: 'none',
        borderRadius: theme.effects.borderRadius.sm,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.xs,
        opacity: 0,
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.status.error,
            color: theme.colors.background.default,
            opacity: 1,
        },
    };
    const emptyStateStyles = {
        padding: '2rem 1rem',
        textAlign: 'center',
        color: theme.colors.text.disabled,
        fontSize: theme.typography.fontSize.sm,
        opacity: isCollapsed ? 0 : 1,
        transition: theme.effects.transition.normal,
    };
    const collapsedIconStyles = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
    };
    const collapsedSessionStyles = {
        width: '40px',
        height: '40px',
        backgroundColor: theme.colors.interactive.hover,
        borderRadius: theme.effects.borderRadius.md,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.primary.main,
            color: theme.colors.background.default,
        },
    };
    const formatTime = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const handleSessionClick = (sessionId, e) => {
        // Don't trigger if clicking delete button
        if (e.target.closest('[data-delete-button]')) {
            return;
        }
        onSessionSelect(sessionId);
    };
    const handleDeleteClick = (sessionId, e) => {
        e.stopPropagation();
        onDeleteSession(sessionId);
    };
    if (isCollapsed) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: sidebarStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: headerStyles, children: (0, jsx_runtime_1.jsx)("button", { style: collapseButtonStyles, onClick: onToggleCollapse, title: "Expand sidebar", children: "\u2192" }) }), (0, jsx_runtime_1.jsxs)("div", { style: collapsedIconStyles, children: [(0, jsx_runtime_1.jsx)("button", { style: newChatButtonStyles, onClick: onNewSession, title: "New chat", children: "+" }), sessions.slice(0, 10).map((session, index) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                ...collapsedSessionStyles,
                                backgroundColor: currentSessionId === session.id
                                    ? theme.colors.primary.main
                                    : theme.colors.interactive.hover,
                                color: currentSessionId === session.id
                                    ? theme.colors.background.default
                                    : theme.colors.text.secondary,
                            }, onClick: (e) => handleSessionClick(session.id, e), title: session.title, children: index + 1 }, session.id)))] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: sidebarStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: headerStyles, children: [(0, jsx_runtime_1.jsx)("h2", { style: titleStyles, children: "Chat History" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("button", { style: newChatButtonStyles, onClick: onNewSession, children: "+ New Chat" }), (0, jsx_runtime_1.jsx)("button", { style: collapseButtonStyles, onClick: onToggleCollapse, title: "Collapse sidebar", children: "\u2190" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: sessionsListStyles, children: sessions.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { style: emptyStateStyles, children: ["No chat history yet.", (0, jsx_runtime_1.jsx)("br", {}), "Start a new conversation!"] })) : (sessions.map((session) => ((0, jsx_runtime_1.jsxs)("div", { style: sessionItemStyles(currentSessionId === session.id), onClick: (e) => handleSessionClick(session.id, e), onMouseEnter: (e) => {
                        const deleteBtn = e.currentTarget.querySelector('[data-delete-button]');
                        if (deleteBtn)
                            deleteBtn.style.opacity = '1';
                    }, onMouseLeave: (e) => {
                        const deleteBtn = e.currentTarget.querySelector('[data-delete-button]');
                        if (deleteBtn)
                            deleteBtn.style.opacity = '0';
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: sessionTitleStyles, children: session.title }), (0, jsx_runtime_1.jsx)("div", { style: sessionPreviewStyles, children: session.lastMessage }), (0, jsx_runtime_1.jsxs)("div", { style: sessionMetaStyles, children: [(0, jsx_runtime_1.jsx)("span", { children: formatTime(session.timestamp) }), (0, jsx_runtime_1.jsxs)("span", { children: [session.messageCount, " messages"] })] }), (0, jsx_runtime_1.jsx)("button", { "data-delete-button": true, style: deleteButtonStyles, onClick: (e) => handleDeleteClick(session.id, e), title: "Delete chat", children: "\u00D7" })] }, session.id)))) })] }));
};
exports.ChatSidebar = ChatSidebar;
exports.default = exports.ChatSidebar;
//# sourceMappingURL=ChatSidebar.js.map