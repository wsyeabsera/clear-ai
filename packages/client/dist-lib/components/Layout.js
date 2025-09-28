"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const ThemeDropdown_1 = __importDefault(require("./ThemeDropdown"));
const themes_1 = require("../themes");
const Layout = ({ children }) => {
    const location = (0, react_router_dom_1.useLocation)();
    const { theme } = (0, themes_1.useTheme)();
    const isActive = (path) => {
        return location.pathname === path;
    };
    const getNavStyle = () => {
        return {
            backgroundColor: `${theme.colors.background.paper}E6`, // 90% opacity
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.colors.border.default}`,
        };
    };
    const getMainStyle = () => {
        return {
            backgroundColor: `${theme.colors.background.paper}66`, // 40% opacity
            backdropFilter: 'blur(8px)',
        };
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen relative z-10", style: { background: 'transparent' }, children: [(0, jsx_runtime_1.jsx)("nav", { className: "shadow-sm relative z-50", style: getNavStyle(), children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between h-16", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 flex items-center", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", className: "text-xl font-bold", style: { color: theme.colors.primary.main }, children: "Clear AI" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "hidden sm:ml-6 sm:flex sm:space-x-8", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Home" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/chat", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/chat') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/chat') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Chat" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/available-tools", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/available-tools') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/available-tools') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Available Tools" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/tool-execute", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/tool-execute') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/tool-execute') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Tool Execute" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/users", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/users') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/users') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Users" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/components", className: "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", style: {
                                                        borderBottomColor: isActive('/components') ? theme.colors.primary.main : 'transparent',
                                                        color: isActive('/components') ? theme.colors.text.primary : theme.colors.text.secondary,
                                                    }, children: "Components" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: (0, jsx_runtime_1.jsx)(ThemeDropdown_1.default, { size: "sm", showLabels: true, className: "hidden sm:block" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "sm:hidden px-4 py-3 border-t border-gray-200", children: (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(ThemeDropdown_1.default, { size: "sm", showLabels: true }) }) })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-40 rounded-lg", style: getMainStyle(), children: (0, jsx_runtime_1.jsx)("div", { className: "px-4 py-6 sm:px-0", children: children }) })] }));
};
exports.Layout = Layout;
//# sourceMappingURL=Layout.js.map