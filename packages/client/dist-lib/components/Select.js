"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const Select = ({ label, value, onChange, options, placeholder = 'Select an option', required = false, error, disabled = false, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const selectStyle = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.paper,
        color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
        outline: 'none',
        fontSize: '0.875rem',
        transition: theme.effects.transition.normal,
        cursor: disabled ? 'not-allowed' : 'pointer',
        // Ensure better contrast
        textShadow: 'none',
        fontWeight: '400',
    };
    const optionStyle = {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
    };
    const placeholderStyle = {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.secondary,
    };
    const handleFocus = (e) => {
        if (!disabled) {
            e.target.style.borderColor = theme.colors.primary.main;
            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.interactive.focus}`;
        }
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = error ? theme.colors.status.error : theme.colors.border.default;
        e.target.style.boxShadow = 'none';
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `mb-4 ${className}`, children: [label && ((0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium mb-1", style: { color: theme.colors.text.primary }, children: [label, " ", required && (0, jsx_runtime_1.jsx)("span", { style: { color: theme.colors.status.error }, children: "*" })] })), (0, jsx_runtime_1.jsxs)("select", { value: value, onChange: (e) => onChange(e.target.value), disabled: disabled, style: selectStyle, onFocus: handleFocus, onBlur: handleBlur, children: [(0, jsx_runtime_1.jsx)("option", { value: "", style: placeholderStyle, children: placeholder }), options.map((option) => ((0, jsx_runtime_1.jsx)("option", { value: option.value, style: optionStyle, children: option.label }, option.value)))] }), error && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm", style: { color: theme.colors.status.error }, children: error }))] }));
};
exports.default = Select;
//# sourceMappingURL=Select.js.map