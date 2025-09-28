"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Type your message...", maxLength = 2000, showCharacterCount = true, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [message, setMessage] = (0, react_1.useState)('');
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const textareaRef = (0, react_1.useRef)(null);
    const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: theme.colors.background.paper,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.lg,
        boxShadow: theme.effects.shadow.md,
    };
    const textareaStyles = {
        width: '100%',
        minHeight: '60px',
        maxHeight: '200px',
        padding: '0.75rem',
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: theme.colors.background.default,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.base,
        resize: 'none',
        outline: 'none',
        transition: theme.effects.transition.normal,
        '&:focus': {
            borderColor: theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
        },
        '&::placeholder': {
            color: theme.colors.text.disabled,
        },
    };
    const bottomRowStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    };
    const characterCountStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: message.length > maxLength * 0.9
            ? theme.colors.status.warning
            : theme.colors.text.disabled,
    };
    const sendButtonStyles = {
        padding: '0.5rem 1.5rem',
        backgroundColor: message.trim() && !disabled
            ? theme.colors.primary.main
            : theme.colors.interactive.disabled,
        color: message.trim() && !disabled
            ? theme.colors.background.default
            : theme.colors.text.disabled,
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
        transition: theme.effects.transition.normal,
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
            backgroundColor: message.trim() && !disabled
                ? theme.colors.primary.dark
                : theme.colors.interactive.disabled,
            transform: message.trim() && !disabled ? 'translateY(-1px)' : 'none',
        },
        '&:active': {
            transform: message.trim() && !disabled ? 'translateY(0)' : 'none',
        },
    };
    const shortcutsStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.disabled,
        display: 'flex',
        gap: '1rem',
    };
    const shortcutStyles = {
        color: theme.colors.text.disabled,
        textDecoration: 'none',
        '&:hover': {
            color: theme.colors.text.secondary,
        },
    };
    // Auto-resize textarea
    (0, react_1.useEffect)(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);
    const handleChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setMessage(value);
        }
    };
    const handleKeyDown = (e) => {
        // Handle Enter to send (but allow Shift+Enter for new lines)
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleCompositionStart = () => {
        setIsComposing(true);
    };
    const handleCompositionEnd = () => {
        setIsComposing(false);
    };
    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
            onSendMessage(trimmedMessage);
            setMessage('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };
    const handlePaste = (e) => {
        // Allow paste but truncate if necessary
        const pastedText = e.clipboardData.getData('text');
        if (message.length + pastedText.length > maxLength) {
            e.preventDefault();
            const remainingSpace = maxLength - message.length;
            const truncatedText = pastedText.substring(0, remainingSpace);
            setMessage(message + truncatedText);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, children: [(0, jsx_runtime_1.jsx)("textarea", { ref: textareaRef, value: message, onChange: handleChange, onKeyDown: handleKeyDown, onCompositionStart: handleCompositionStart, onCompositionEnd: handleCompositionEnd, onPaste: handlePaste, placeholder: placeholder, disabled: disabled, style: textareaStyles, rows: 1 }), (0, jsx_runtime_1.jsxs)("div", { style: bottomRowStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: shortcutsStyles, children: [(0, jsx_runtime_1.jsx)("span", { style: shortcutStyles, children: "Enter to send" }), (0, jsx_runtime_1.jsx)("span", { style: shortcutStyles, children: "Shift+Enter for new line" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [showCharacterCount && ((0, jsx_runtime_1.jsxs)("span", { style: characterCountStyles, children: [message.length, "/", maxLength] })), (0, jsx_runtime_1.jsx)("button", { onClick: handleSend, disabled: !message.trim() || disabled, style: sendButtonStyles, onMouseEnter: (e) => {
                                    if (message.trim() && !disabled) {
                                        e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (message.trim() && !disabled) {
                                        e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }, children: "Send" })] })] })] }));
};
exports.ChatInput = ChatInput;
exports.default = exports.ChatInput;
//# sourceMappingURL=ChatInput.js.map