"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const api_1 = require("../services/api");
const ModelSelector = ({ selectedModel, onModelChange, disabled = false, className = '', }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [models, setModels] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchModels = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const availableModels = await api_1.apiService.getAvailableModels();
                setModels(availableModels);
                // If no model is selected, use the current model from the server
                if (!selectedModel && availableModels.current) {
                    onModelChange(availableModels.current);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load models');
                console.error('Error fetching models:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, [selectedModel, onModelChange]);
    const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '200px',
    };
    const labelStyles = {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
    };
    const selectStyles = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${error ? theme.colors.status.error : theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: disabled ? theme.colors.interactive.disabled : theme.colors.background.default,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        transition: theme.effects.transition.normal,
        opacity: disabled ? 0.6 : 1,
        '&:focus': {
            borderColor: error ? theme.colors.status.error : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${error ? theme.colors.status.error : theme.colors.primary.main}33`,
        },
    };
    const loadingStyles = {
        padding: '0.5rem 0.75rem',
        color: theme.colors.text.disabled,
        fontSize: theme.typography.fontSize.sm,
        fontStyle: 'italic',
    };
    const errorStyles = {
        padding: '0.5rem 0.75rem',
        color: theme.colors.status.error,
        fontSize: theme.typography.fontSize.sm,
        backgroundColor: theme.colors.status.error + '10',
        borderRadius: theme.effects.borderRadius.sm,
        border: `1px solid ${theme.colors.status.error}40`,
    };
    const modelInfoStyles = {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.disabled,
        marginTop: '0.25rem',
    };
    const handleChange = (e) => {
        onModelChange(e.target.value);
    };
    if (isLoading) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, className: className, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyles, children: "Model" }), (0, jsx_runtime_1.jsx)("div", { style: loadingStyles, children: "Loading models..." })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, className: className, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyles, children: "Model" }), (0, jsx_runtime_1.jsx)("div", { style: errorStyles, children: error })] }));
    }
    if (!models || models.available.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, className: className, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyles, children: "Model" }), (0, jsx_runtime_1.jsx)("div", { style: errorStyles, children: "No models available" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: containerStyles, className: className, children: [(0, jsx_runtime_1.jsxs)("label", { style: labelStyles, children: ["Model", models.current && selectedModel === models.current && ((0, jsx_runtime_1.jsx)("span", { style: { color: theme.colors.status.success, marginLeft: '0.5rem' }, children: "(Current)" }))] }), (0, jsx_runtime_1.jsx)("select", { value: selectedModel, onChange: handleChange, disabled: disabled, style: selectStyles, children: models.available.map((model) => ((0, jsx_runtime_1.jsxs)("option", { value: model, children: [model, model === models.current ? ' (Current)' : ''] }, model))) }), models && ((0, jsx_runtime_1.jsxs)("div", { style: modelInfoStyles, children: [models.count, " model", models.count !== 1 ? 's' : '', " available"] }))] }));
};
exports.ModelSelector = ModelSelector;
exports.default = exports.ModelSelector;
//# sourceMappingURL=ModelSelector.js.map