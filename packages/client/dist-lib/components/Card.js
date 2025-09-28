"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const Card = ({ children, title, shadow = true, clickable = false, onClick, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const cardStyles = {
        backgroundColor: theme.colors.background.paper,
        border: `1px solid ${theme.colors.border.light}`,
        borderRadius: theme.effects.borderRadius.lg,
        padding: '1.5rem',
        fontFamily: theme.typography.fontFamily.primary,
        transition: theme.effects.transition.normal,
        cursor: clickable ? 'pointer' : 'default',
        boxShadow: shadow ? theme.effects.shadow.sm : 'none',
        '&:hover': clickable ? {
            boxShadow: theme.effects.shadow.md,
            transform: 'translateY(-2px)',
        } : {},
    };
    const titleStyles = {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.primary,
        marginBottom: '1rem',
        fontFamily: theme.typography.fontFamily.primary,
    };
    // Convert styles object to CSS string for inline styles
    const inlineStyles = Object.entries(cardStyles).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
            // Handle nested objects (like &:hover)
            return acc;
        }
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const titleInlineStyles = Object.entries(titleStyles).reduce((acc, [key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    return ((0, jsx_runtime_1.jsxs)("div", { style: inlineStyles, className: className, onClick: onClick, children: [title && ((0, jsx_runtime_1.jsx)("h3", { style: titleInlineStyles, children: title })), children] }));
};
exports.default = Card;
//# sourceMappingURL=Card.js.map