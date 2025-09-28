"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationButtons = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = __importDefault(require("./Button"));
const ConfirmationButtons = ({ onConfirm, onCancel, isLoading = false, confirmText = 'Yes, do it', cancelText = 'No, cancel' }) => {
    const containerStyles = {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1rem',
        justifyContent: 'flex-start',
        alignItems: 'center',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, children: [(0, jsx_runtime_1.jsx)(Button_1.default, { onClick: onConfirm, disabled: isLoading, size: "sm", children: isLoading ? '⏳ Processing...' : `✅ ${confirmText}` }), (0, jsx_runtime_1.jsxs)(Button_1.default, { onClick: onCancel, disabled: isLoading, size: "sm", children: ["\u274C ", cancelText] })] }));
};
exports.ConfirmationButtons = ConfirmationButtons;
exports.default = exports.ConfirmationButtons;
//# sourceMappingURL=ConfirmationButtons.js.map