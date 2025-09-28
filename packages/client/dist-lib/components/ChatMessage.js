"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const JsonModal_1 = require("./JsonModal");
const ConfirmationButtons_1 = require("./ConfirmationButtons");
const ChatMessage = ({ content, role, timestamp, isLoading = false, error, metadata, fullResponseData, onConfirmAction, onCancelAction }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [showMetadata, setShowMetadata] = (0, react_1.useState)(false);
    const [showJsonModal, setShowJsonModal] = (0, react_1.useState)(false);
    const isUser = role === 'user';
    const isAssistant = role === 'assistant';
    // Check if this is a confirmation request
    const isConfirmationRequest = isAssistant &&
        content.includes('Would you like me to perform this action for you?') &&
        onConfirmAction &&
        onCancelAction;
    const messageStyles = {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
        alignItems: isUser ? 'flex-end' : 'flex-start',
    };
    const bubbleStyles = {
        maxWidth: '90%',
        padding: '0.75rem 1rem',
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: isUser
            ? theme.colors.primary.main
            : 'rgba(255, 255, 255, 0.1)',
        color: isUser
            ? theme.colors.background.default
            : theme.colors.text.primary,
        border: 'none',
        backdropFilter: 'blur(10px)',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
    };
    const timestampStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.disabled,
        marginTop: '0.25rem',
        marginBottom: '0.5rem',
    };
    const metadataButtonStyles = {
        backgroundColor: 'transparent',
        border: 'none',
        color: theme.colors.text.disabled,
        fontSize: theme.typography.fontSize.xs,
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        borderRadius: theme.effects.borderRadius.sm,
        marginTop: '0.5rem',
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.interactive.hover,
            color: theme.colors.text.secondary,
        },
    };
    const metadataStyles = {
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.effects.borderRadius.sm,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    };
    const loadingStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: theme.colors.text.disabled,
    };
    const errorStyles = {
        color: theme.colors.status.error,
        fontSize: theme.typography.fontSize.sm,
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: theme.colors.status.error + '10',
        borderRadius: theme.effects.borderRadius.sm,
        border: `1px solid ${theme.colors.status.error}40`,
    };
    const LoadingDots = () => ((0, jsx_runtime_1.jsxs)("div", { style: loadingStyles, children: [(0, jsx_runtime_1.jsx)("span", { children: "Thinking" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '0.25rem' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: theme.colors.text.disabled,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: theme.colors.text.disabled,
                            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: theme.colors.text.disabled,
                            animation: 'pulse 1.5s ease-in-out infinite 0.4s',
                        } })] })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { style: messageStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: timestampStyles, children: timestamp.toLocaleTimeString() }), (0, jsx_runtime_1.jsx)("div", { style: bubbleStyles, children: isLoading ? ((0, jsx_runtime_1.jsx)(LoadingDots, {})) : error ? ((0, jsx_runtime_1.jsxs)("div", { style: errorStyles, children: ["Error: ", error] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [content, isConfirmationRequest && ((0, jsx_runtime_1.jsx)(ConfirmationButtons_1.ConfirmationButtons, { onConfirm: onConfirmAction, onCancel: onCancelAction, isLoading: isLoading })), isAssistant && metadata && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }, children: [(0, jsx_runtime_1.jsx)("button", { style: metadataButtonStyles, onClick: () => setShowMetadata(!showMetadata), onMouseEnter: (e) => {
                                                e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                                e.currentTarget.style.color = theme.colors.text.secondary;
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = theme.colors.text.disabled;
                                            }, children: showMetadata ? 'Hide Details' : 'Show Details' }), fullResponseData && ((0, jsx_runtime_1.jsx)("button", { style: {
                                                ...metadataButtonStyles,
                                                backgroundColor: theme.colors.primary.main,
                                                color: theme.colors.background.default,
                                                fontWeight: theme.typography.fontWeight.medium,
                                            }, onClick: () => setShowJsonModal(true), onMouseEnter: (e) => {
                                                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                                            }, children: "\uD83D\uDCCB Copy Full Response" }))] }), showMetadata && ((0, jsx_runtime_1.jsxs)("div", { style: metadataStyles, children: [metadata.intent && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '0.5rem' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Intent:" }), " ", metadata.intent.type, (0, jsx_runtime_1.jsxs)("span", { style: { color: theme.colors.text.disabled, marginLeft: '0.5rem' }, children: ["(confidence: ", (metadata.intent.confidence * 100).toFixed(1), "%)"] })] })), metadata.reasoning && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '0.5rem' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Reasoning:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                        marginTop: '0.25rem',
                                                        padding: '0.5rem',
                                                        backgroundColor: theme.colors.background.default,
                                                        borderRadius: theme.effects.borderRadius.sm,
                                                        fontFamily: 'monospace',
                                                        fontSize: theme.typography.fontSize.xs,
                                                    }, children: metadata.reasoning })] })), metadata.memoryContext && metadata.memoryContext.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Memory Context:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                        marginTop: '0.25rem',
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                    }, children: metadata.memoryContext.map((memory, index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                            marginBottom: '0.25rem',
                                                            padding: '0.25rem',
                                                            backgroundColor: theme.colors.background.default,
                                                            borderRadius: theme.effects.borderRadius.sm,
                                                            fontSize: theme.typography.fontSize.xs,
                                                        }, children: [(0, jsx_runtime_1.jsxs)("strong", { children: [memory.type, ":"] }), " ", memory.content, memory.relevance && ((0, jsx_runtime_1.jsxs)("span", { style: { color: theme.colors.text.disabled, marginLeft: '0.5rem' }, children: ["(relevance: ", (memory.relevance * 100).toFixed(1), "%)"] }))] }, index))) })] }))] }))] }))] })) }), fullResponseData && ((0, jsx_runtime_1.jsx)(JsonModal_1.JsonModal, { isOpen: showJsonModal, onClose: () => setShowJsonModal(false), data: fullResponseData, title: "Full Response Data" }))] }));
};
exports.ChatMessage = ChatMessage;
exports.default = exports.ChatMessage;
//# sourceMappingURL=ChatMessage.js.map