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
                    '&:hover': !disabled ? {
                        backgroundColor: theme.colors.primary.dark,
                        boxShadow: theme.effects.shadow.md,
                        transform: 'translateY(-1px)',
                    } : {},
                    '&:active': !disabled ? {
                        transform: 'translateY(0px)',
                        boxShadow: theme.effects.shadow.sm,
                    } : {},
                    '&:focus': {
                        boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
                    },
                };
            case 'secondary':
                return {
                    ...baseStyles,
                    backgroundColor: theme.colors.secondary.main,
                    color: theme.colors.secondary.contrast,
                    boxShadow: theme.effects.shadow.sm,
                    '&:hover': !disabled ? {
                        backgroundColor: theme.colors.secondary.dark,
                        boxShadow: theme.effects.shadow.md,
                        transform: 'translateY(-1px)',
                    } : {},
                    '&:active': !disabled ? {
                        transform: 'translateY(0px)',
                        boxShadow: theme.effects.shadow.sm,
                    } : {},
                    '&:focus': {
                        boxShadow: `0 0 0 3px ${theme.colors.secondary.main}33`,
                    },
                };
            case 'outline':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    color: theme.colors.primary.main,
                    border: `2px solid ${theme.colors.primary.main}`,
                    '&:hover': !disabled ? {
                        backgroundColor: theme.colors.interactive.hover,
                        boxShadow: theme.effects.shadow.sm,
                    } : {},
                    '&:active': !disabled ? {
                        backgroundColor: theme.colors.interactive.active,
                    } : {},
                    '&:focus': {
                        boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
                    },
                };
            case 'ghost':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    color: theme.colors.primary.main,
                    '&:hover': !disabled ? {
                        backgroundColor: theme.colors.interactive.hover,
                    } : {},
                    '&:active': !disabled ? {
                        backgroundColor: theme.colors.interactive.active,
                    } : {},
                    '&:focus': {
                        boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
                    },
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
    // Convert styles object to CSS string for inline styles
    const inlineStyles = Object.entries(buttonStyles).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
            // Handle nested objects (like &:hover)
            return acc;
        }
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    return ((0, jsx_runtime_1.jsx)("button", { style: inlineStyles, disabled: disabled, onClick: onClick, type: type, className: className, children: children }));
};
exports.default = Button;
//# sourceMappingURL=Button.js.map