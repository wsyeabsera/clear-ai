"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const ThemeSwitcher = ({ className = '', showLabels = true, size = 'md', }) => {
    const { theme, themeName, setTheme, availableThemes } = (0, themes_1.useTheme)();
    const themeConfig = {
        default: { name: 'Professional', emoji: '💼' },
        neowave: { name: 'Neowave', emoji: '🌊' },
        techno: { name: 'Techno', emoji: '⚡' },
        oldschool: { name: 'Old School', emoji: '📜' },
        alien: { name: 'Alien', emoji: '👽' },
    };
    const sizeStyles = {
        sm: {
            container: 'gap-1',
            button: 'p-1 text-xs',
            icon: 'text-sm',
        },
        md: {
            container: 'gap-2',
            button: 'p-2 text-sm',
            icon: 'text-base',
        },
        lg: {
            container: 'gap-3',
            button: 'p-3 text-base',
            icon: 'text-lg',
        },
    };
    const currentSize = sizeStyles[size];
    const switcherStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.25rem' : size === 'lg' ? '0.75rem' : '0.5rem',
        fontFamily: theme.typography.fontFamily.primary,
    };
    const buttonStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        padding: size === 'sm' ? '0.25rem' : size === 'lg' ? '0.75rem' : '0.5rem',
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
        minWidth: size === 'sm' ? '2rem' : size === 'lg' ? '4rem' : '3rem',
        minHeight: size === 'sm' ? '2rem' : size === 'lg' ? '3rem' : '2.5rem',
    };
    const activeButtonStyles = {
        ...buttonStyles,
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.primary.contrast,
        borderColor: theme.colors.primary.main,
        boxShadow: theme.effects.shadow.sm,
    };
    const hoverStyles = {
        backgroundColor: theme.colors.interactive.hover,
        borderColor: theme.colors.primary.main,
        boxShadow: theme.effects.shadow.sm,
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: switcherStyles, className: className, children: availableThemes.map((themeKey) => {
            const isActive = themeName === themeKey;
            const config = themeConfig[themeKey];
            return ((0, jsx_runtime_1.jsxs)("button", { style: isActive ? activeButtonStyles : buttonStyles, onClick: () => setTheme(themeKey), title: `Switch to ${config.name} theme`, onMouseEnter: (e) => {
                    if (!isActive) {
                        Object.assign(e.currentTarget.style, hoverStyles);
                    }
                }, onMouseLeave: (e) => {
                    if (!isActive) {
                        Object.assign(e.currentTarget.style, buttonStyles);
                    }
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: currentSize.icon }, children: config.emoji }), showLabels && ((0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: size === 'sm' ? theme.typography.fontSize.xs :
                                size === 'lg' ? theme.typography.fontSize.base :
                                    theme.typography.fontSize.sm,
                            fontFamily: theme.typography.fontFamily.primary,
                        }, children: config.name }))] }, themeKey));
        }) }));
};
exports.default = ThemeSwitcher;
//# sourceMappingURL=ThemeSwitcher.js.map