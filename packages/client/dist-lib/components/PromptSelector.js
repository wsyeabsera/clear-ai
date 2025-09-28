"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const PromptModal_1 = require("./PromptModal");
const PromptSelector = ({ onPromptSelect, disabled = false, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const buttonStyles = {
        padding: '0.5rem 1rem',
        backgroundColor: disabled
            ? theme.colors.interactive.disabled
            : theme.colors.primary.main,
        color: disabled
            ? theme.colors.text.disabled
            : theme.colors.background.default,
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.effects.transition.normal,
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        '&:hover': {
            backgroundColor: disabled
                ? theme.colors.interactive.disabled
                : theme.colors.primary.dark,
            transform: disabled ? 'none' : 'translateY(-1px)',
        },
    };
    const handlePromptSelect = (prompt) => {
        onPromptSelect(prompt);
        setIsModalOpen(false);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'inline-block' }, className: className, children: (0, jsx_runtime_1.jsxs)("button", { style: buttonStyles, onClick: () => setIsModalOpen(true), disabled: disabled, onMouseEnter: (e) => {
                        if (!disabled) {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                    }, onMouseLeave: (e) => {
                        if (!disabled) {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }, title: "Select example prompt", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCA1" }), (0, jsx_runtime_1.jsx)("span", { children: "Prompts" })] }) }), (0, jsx_runtime_1.jsx)(PromptModal_1.PromptModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onPromptSelect: handlePromptSelect, disabled: disabled })] }));
};
exports.PromptSelector = PromptSelector;
exports.default = exports.PromptSelector;
//# sourceMappingURL=PromptSelector.js.map