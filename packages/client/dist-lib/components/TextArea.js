"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const TextArea = ({ label, value, onChange, placeholder, rows = 3, required = false, error, disabled = false, readOnly = false, className = '', minRows = 3, maxRows = 10, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const textAreaStyle = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.paper,
        color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
        outline: 'none',
        fontSize: '0.875rem',
        fontFamily: theme.typography.fontFamily.primary,
        lineHeight: '1.5',
        resize: 'vertical',
        minHeight: `${minRows * 1.5}rem`,
        maxHeight: `${maxRows * 1.5}rem`,
        transition: theme.effects.transition.normal,
        cursor: disabled ? 'not-allowed' : 'text',
        // Ensure better contrast
        textShadow: 'none',
        fontWeight: '400',
    };
    const handleFocus = (e) => {
        if (!disabled && !readOnly) {
            e.target.style.borderColor = theme.colors.primary.main;
            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.focus}`;
        }
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border.default;
        e.target.style.boxShadow = 'none';
    };
    const handleChange = (e) => {
        if (!disabled && !readOnly) {
            onChange(e.target.value);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `mb-4 ${className}`, children: [label && ((0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium mb-1", style: { color: theme.colors.text.primary }, children: [label, " ", required && (0, jsx_runtime_1.jsx)("span", { style: { color: theme.colors.status.error }, children: "*" })] })), (0, jsx_runtime_1.jsx)("textarea", { value: value, onChange: handleChange, onFocus: handleFocus, onBlur: handleBlur, placeholder: placeholder, rows: rows, disabled: disabled, readOnly: readOnly, style: textAreaStyle }), error && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm", style: { color: theme.colors.status.error }, children: error }))] }));
};
exports.default = TextArea;
//# sourceMappingURL=TextArea.js.map