"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicForm = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Input_1 = __importDefault(require("./Input"));
const Button_1 = __importDefault(require("./Button"));
const Select_1 = __importDefault(require("./Select"));
const TextArea_1 = __importDefault(require("./TextArea"));
const DynamicForm = ({ schema, onSubmit, loading = false }) => {
    const [formData, setFormData] = (0, react_1.useState)({});
    const [errors, setErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        // Initialize form data with default values
        const initialData = {};
        if (schema?.properties) {
            Object.entries(schema.properties).forEach(([key, prop]) => {
                if (prop.default !== undefined) {
                    initialData[key] = prop.default;
                }
                else if (prop.type === 'boolean') {
                    initialData[key] = false;
                }
                else if (prop.type === 'array') {
                    initialData[key] = [];
                }
                else if (prop.type === 'object') {
                    initialData[key] = {};
                }
            });
        }
        setFormData(initialData);
    }, [schema]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    const validateField = (field, value, prop) => {
        if (prop.required && (value === undefined || value === null || value === '')) {
            return `${field} is required`;
        }
        if (prop.type === 'string' && prop.format === 'uri' && value) {
            try {
                new URL(value);
            }
            catch {
                return `${field} must be a valid URL`;
            }
        }
        if (prop.type === 'number' && value !== undefined && value !== '') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                return `${field} must be a valid number`;
            }
            if (prop.minimum !== undefined && numValue < prop.minimum) {
                return `${field} must be at least ${prop.minimum}`;
            }
            if (prop.maximum !== undefined && numValue > prop.maximum) {
                return `${field} must be at most ${prop.maximum}`;
            }
        }
        if (prop.enum && value && !prop.enum.includes(value)) {
            return `${field} must be one of: ${prop.enum.join(', ')}`;
        }
        return '';
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate all fields
        const newErrors = {};
        if (schema?.properties) {
            Object.entries(schema.properties).forEach(([key, prop]) => {
                const error = validateField(key, formData[key], prop);
                if (error) {
                    newErrors[key] = error;
                }
            });
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        }
    };
    const renderField = (field, prop) => {
        const value = formData[field] || '';
        const error = errors[field];
        const isRequired = schema?.required?.includes(field) || false;
        if (prop.type === 'boolean') {
            return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => handleInputChange(field, e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium text-gray-700", children: [field, " ", isRequired && (0, jsx_runtime_1.jsx)("span", { className: "text-red-500", children: "*" })] })] }), error && (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: error })] }, field));
        }
        if (prop.enum) {
            const options = prop.enum.map((option) => ({
                value: option,
                label: option,
            }));
            return ((0, jsx_runtime_1.jsx)(Select_1.default, { label: field, value: value, onChange: (newValue) => handleInputChange(field, newValue), options: options, placeholder: `Select ${field}`, required: isRequired, error: error }, field));
        }
        if (prop.type === 'object') {
            return ((0, jsx_runtime_1.jsx)(TextArea_1.default, { label: field, value: typeof value === 'string' ? value : JSON.stringify(value, null, 2), onChange: (newValue) => {
                    try {
                        const parsed = JSON.parse(newValue);
                        handleInputChange(field, parsed);
                    }
                    catch {
                        handleInputChange(field, newValue);
                    }
                }, placeholder: `Enter ${field} as JSON`, rows: 4, required: isRequired, error: error }, field));
        }
        if (prop.type === 'array') {
            return ((0, jsx_runtime_1.jsx)(TextArea_1.default, { label: field, value: Array.isArray(value) ? JSON.stringify(value, null, 2) : '', onChange: (newValue) => {
                    try {
                        const parsed = JSON.parse(newValue);
                        if (Array.isArray(parsed)) {
                            handleInputChange(field, parsed);
                        }
                    }
                    catch {
                        // Keep as string for now
                    }
                }, placeholder: `Enter ${field} as JSON array`, rows: 3, required: isRequired, error: error }, field));
        }
        // Default to text input
        return ((0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsx)(Input_1.default, { label: field, type: prop.format === 'uri' ? 'url' : prop.type === 'number' ? 'number' : 'text', value: value, onChange: (value) => handleInputChange(field, value), required: isRequired, error: error, placeholder: prop.description || `Enter ${field}` }) }, field));
    };
    if (!schema?.properties) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-gray-500 py-8", children: "No form schema available" }));
    }
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(schema.properties).map(([field, prop]) => renderField(field, prop)) }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-end pt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", disabled: loading, className: "px-6 py-2", children: loading ? 'Executing...' : 'Execute Tool' }) })] }));
};
exports.DynamicForm = DynamicForm;
//# sourceMappingURL=DynamicForm.js.map