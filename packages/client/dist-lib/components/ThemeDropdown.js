"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const themes_1 = require("../themes");
const ThemeDropdown = ({ className = '', size = 'md', showLabels = true, }) => {
    const { theme, themeName, setTheme, availableThemes } = (0, themes_1.useTheme)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const dropdownRef = (0, react_1.useRef)(null);
    const themeConfig = {
        default: { name: 'Professional', emoji: '💼' },
        neowave: { name: 'Neowave', emoji: '🌊' },
        techno: { name: 'Techno', emoji: '⚡' },
        oldschool: { name: 'Old School', emoji: '📜' },
        alien: { name: 'Alien', emoji: '👽' },
    };
    const currentTheme = themeConfig[themeName];
    const sizeStyles = {
        sm: {
            button: 'px-2 py-1 text-xs',
            dropdown: 'min-w-32',
            item: 'px-2 py-1 text-xs',
        },
        md: {
            button: 'px-3 py-2 text-sm',
            dropdown: 'min-w-40',
            item: 'px-3 py-2 text-sm',
        },
        lg: {
            button: 'px-4 py-3 text-base',
            dropdown: 'min-w-48',
            item: 'px-4 py-3 text-base',
        },
    };
    const currentSize = sizeStyles[size];
    // Close dropdown when clicking outside
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleThemeChange = (themeKey) => {
        setTheme(themeKey);
        setIsOpen(false);
    };
    const buttonStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: size === 'sm' ? '0.25rem 0.5rem' :
            size === 'lg' ? '0.75rem 1rem' :
                '0.5rem 0.75rem',
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        fontSize: size === 'sm' ? theme.typography.fontSize.xs :
            size === 'lg' ? theme.typography.fontSize.base :
                theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.primary,
        cursor: 'pointer',
        transition: theme.effects.transition.normal,
        outline: 'none',
        minWidth: size === 'sm' ? '6rem' : size === 'lg' ? '8rem' : '7rem',
    };
    const dropdownStyles = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: theme.colors.background.paper,
        border: `1px solid ${theme.colors.border.default}`,
        borderRadius: theme.effects.borderRadius.md,
        boxShadow: theme.effects.shadow.lg,
        marginTop: '0.25rem',
        overflow: 'hidden',
    };
    const itemStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: size === 'sm' ? '0.25rem 0.5rem' :
            size === 'lg' ? '0.75rem 1rem' :
                '0.5rem 0.75rem',
        cursor: 'pointer',
        transition: theme.effects.transition.fast,
        fontSize: size === 'sm' ? theme.typography.fontSize.xs :
            size === 'lg' ? theme.typography.fontSize.base :
                theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.primary,
        color: theme.colors.text.primary,
        backgroundColor: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
    };
    const activeItemStyles = {
        ...itemStyles,
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.primary.contrast,
    };
    const hoverItemStyles = {
        backgroundColor: theme.colors.interactive.hover,
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: dropdownRef, className: `relative ${className}`, children: [(0, jsx_runtime_1.jsxs)("button", { style: buttonStyles, onClick: () => setIsOpen(!isOpen), onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.paper;
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem' }, children: currentTheme.emoji }), showLabels && ((0, jsx_runtime_1.jsx)("span", { children: currentTheme.name }))] }), (0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: '0.75rem',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: theme.effects.transition.fast,
                        }, children: "\u25BC" })] }), isOpen && ((0, jsx_runtime_1.jsx)("div", { style: dropdownStyles, className: currentSize.dropdown, children: availableThemes.map((themeKey) => {
                    const isActive = themeName === themeKey;
                    const config = themeConfig[themeKey];
                    return ((0, jsx_runtime_1.jsxs)("button", { style: isActive ? activeItemStyles : itemStyles, onClick: () => handleThemeChange(themeKey), onMouseEnter: (e) => {
                            if (!isActive) {
                                Object.assign(e.currentTarget.style, hoverItemStyles);
                            }
                        }, onMouseLeave: (e) => {
                            if (!isActive) {
                                Object.assign(e.currentTarget.style, itemStyles);
                            }
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem' }, children: config.emoji }), showLabels && ((0, jsx_runtime_1.jsx)("span", { children: config.name }))] }, themeKey));
                }) }))] }));
};
exports.default = ThemeDropdown;
//# sourceMappingURL=ThemeDropdown.js.map