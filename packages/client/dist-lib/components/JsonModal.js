"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const JsonModal = ({ isOpen, onClose, data, title = 'Response Data', }) => {
    const { theme } = (0, themes_1.useTheme)();
    // Lock body scroll when modal is open
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            // Store the original overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow;
            // Lock the body scroll
            document.body.style.overflow = 'hidden';
            // Cleanup function to restore scroll when modal closes
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const overlayStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Higher z-index to ensure it's above everything
        padding: '1rem',
        width: '100vw',
        height: '100vh',
    };
    const modalStyles = {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.effects.borderRadius.lg,
        boxShadow: theme.effects.shadow.xl,
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '800px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };
    const headerStyles = {
        padding: '1rem 1.5rem',
        borderBottom: `1px solid ${theme.colors.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };
    const titleStyles = {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
    };
    const closeButtonStyles = {
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        cursor: 'pointer',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.interactive.hover,
            color: theme.colors.text.primary,
        },
    };
    const contentStyles = {
        flex: 1,
        padding: '1rem 1.5rem',
        overflow: 'auto',
    };
    const jsonContainerStyles = {
        backgroundColor: theme.colors.background.default,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        padding: '1rem',
        fontFamily: 'monospace',
        fontSize: theme.typography.fontSize.sm,
        lineHeight: '1.5',
        overflow: 'auto',
        maxHeight: '60vh',
        whiteSpace: 'pre-wrap',
    };
    const copyButtonStyles = {
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.background.default,
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.effects.transition.normal,
        '&:hover': {
            backgroundColor: theme.colors.primary.dark,
        },
    };
    const formatJson = (data) => {
        try {
            return JSON.stringify(data, null, 2);
        }
        catch (error) {
            return String(data);
        }
    };
    const handleCopyToClipboard = async () => {
        try {
            const jsonString = formatJson(data);
            await navigator.clipboard.writeText(jsonString);
            // You could add a toast notification here
        }
        catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: overlayStyles, onClick: handleOverlayClick, onKeyDown: handleKeyDown, tabIndex: -1, children: (0, jsx_runtime_1.jsxs)("div", { style: modalStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: headerStyles, children: [(0, jsx_runtime_1.jsx)("h3", { style: titleStyles, children: title }), (0, jsx_runtime_1.jsx)("button", { style: closeButtonStyles, onClick: onClose, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                e.currentTarget.style.color = theme.colors.text.primary;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = theme.colors.text.secondary;
                            }, title: "Close modal", children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { style: contentStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: jsonContainerStyles, children: formatJson(data) }), (0, jsx_runtime_1.jsx)("button", { style: copyButtonStyles, onClick: handleCopyToClipboard, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                            }, children: "Copy to Clipboard" })] })] }) }));
};
exports.JsonModal = JsonModal;
exports.default = exports.JsonModal;
//# sourceMappingURL=JsonModal.js.map