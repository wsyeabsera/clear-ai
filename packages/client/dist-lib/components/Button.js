"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, type = 'button', onClick, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const getVariantStyles = () => {
        const baseStyles = {
            fontFamily: theme.typography.fontFamily.primary,
            fontWeight: theme.typography.fontWeight.medium,
            borderRadius: theme.effects.borderRadius.md,
            transition: theme.effects.transition.normal,
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: disabled ? 0.6 : 1,
        };
        switch (variant) {
            case 'primary':
                return {
                    ...baseStyles,
                    backgroundColor: theme.colors.primary.main,
                    color: theme.colors.primary.contrast,
                    boxShadow: theme.effects.shadow.sm,
                };
            case 'secondary':
                return {
                    ...baseStyles,
                    backgroundColor: theme.colors.secondary.main,
                    color: theme.colors.secondary.contrast,
                    boxShadow: theme.effects.shadow.sm,
                };
            case 'outline':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    color: theme.colors.primary.main,
                    border: `2px solid ${theme.colors.primary.main}`,
                };
            case 'ghost':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    color: theme.colors.primary.main,
                };
            default:
                return baseStyles;
        }
    };
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: '0.375rem 0.75rem',
                    fontSize: theme.typography.fontSize.sm,
                };
            case 'md':
                return {
                    padding: '0.5rem 1rem',
                    fontSize: theme.typography.fontSize.base,
                };
            case 'lg':
                return {
                    padding: '0.75rem 1.5rem',
                    fontSize: theme.typography.fontSize.lg,
                };
            default:
                return {
                    padding: '0.5rem 1rem',
                    fontSize: theme.typography.fontSize.base,
                };
        }
    };
    const buttonStyles = {
        ...getVariantStyles(),
        ...getSizeStyles(),
    };
    // Use the styles object directly for inline styles (React expects camelCase)
    const inlineStyles = Object.entries(buttonStyles).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
            // Handle nested objects (like &:hover) - skip these for inline styles
            return acc;
        }
        // Keep camelCase for React inline styles
        acc[key] = String(value);
        return acc;
    }, {});
    return ((0, jsx_runtime_1.jsx)("button", { style: inlineStyles, disabled: disabled, onClick: onClick, type: type, className: className, children: children }));
};
exports.default = Button;
//# sourceMappingURL=Button.js.map