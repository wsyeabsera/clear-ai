"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const Input = ({ type = 'text', placeholder, value, disabled = false, required = false, label, error, helpText, onChange, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const inputStyles = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        boxShadow: theme.effects.shadow.sm,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.default,
        transition: theme.effects.transition.normal,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.6 : 1,
        '&:focus': {
            borderColor: error ? theme.colors.status.error : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${error ? theme.colors.status.error : theme.colors.primary.main}33`,
        },
        '&::placeholder': {
            color: theme.colors.text.disabled,
        },
    };
    const labelStyles = {
        display: 'block',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        marginBottom: '0.25rem',
        fontFamily: theme.typography.fontFamily.primary,
    };
    const errorStyles = {
        marginTop: '0.25rem',
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.status.error,
        fontFamily: theme.typography.fontFamily.primary,
    };
    const helpStyles = {
        marginTop: '0.25rem',
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily.primary,
    };
    const requiredStyles = {
        color: theme.colors.status.error,
        marginLeft: '0.25rem',
    };
    // Convert styles object to CSS string for inline styles
    const inputInlineStyles = Object.entries(inputStyles).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
            return acc;
        }
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const labelInlineStyles = Object.entries(labelStyles).reduce((acc, [key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const errorInlineStyles = Object.entries(errorStyles).reduce((acc, [key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const helpInlineStyles = Object.entries(helpStyles).reduce((acc, [key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const requiredInlineStyles = Object.entries(requiredStyles).reduce((acc, [key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        acc[cssKey] = String(value);
        return acc;
    }, {});
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full", children: [label && ((0, jsx_runtime_1.jsxs)("label", { style: labelInlineStyles, children: [label, required && (0, jsx_runtime_1.jsx)("span", { style: requiredInlineStyles, children: "*" })] })), (0, jsx_runtime_1.jsx)("input", { type: type, placeholder: placeholder, value: value, disabled: disabled, required: required, onChange: handleChange, style: inputInlineStyles, className: className }), error && ((0, jsx_runtime_1.jsx)("p", { style: errorInlineStyles, children: error })), helpText && !error && ((0, jsx_runtime_1.jsx)("p", { style: helpInlineStyles, children: helpText }))] }));
};
exports.default = Input;
//# sourceMappingURL=Input.js.map