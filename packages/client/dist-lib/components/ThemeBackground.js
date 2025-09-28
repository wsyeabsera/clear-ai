"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const themes_1 = require("../themes");
const ThemeBackground = ({ pattern, effect, animation, opacity = 0.1, className = '', children, fullscreen = false, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const getPatternStyle = () => {
        if (!pattern)
            return {};
        const patternValue = theme.effects.patterns?.[pattern];
        if (!patternValue)
            return {};
        return {
            backgroundImage: patternValue,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            opacity: opacity,
        };
    };
    const getEffectStyle = () => {
        if (!effect)
            return {};
        const effectValue = theme.effects.effects?.[effect];
        if (!effectValue)
            return {};
        return {
            background: effectValue,
            backgroundSize: '200% 200%',
            backgroundRepeat: 'no-repeat',
            opacity: opacity,
        };
    };
    const getAnimationStyle = () => {
        if (!animation)
            return {};
        const animationValue = theme.effects.backgroundAnimations?.[animation];
        if (!animationValue)
            return {};
        return {
            animation: animationValue,
        };
    };
    const getBackgroundStyle = () => {
        const patternStyle = getPatternStyle();
        const effectStyle = getEffectStyle();
        const animationStyle = getAnimationStyle();
        return {
            ...patternStyle,
            ...effectStyle,
            ...animationStyle,
            position: fullscreen ? 'fixed' : 'relative',
            top: fullscreen ? 0 : 'auto',
            left: fullscreen ? 0 : 'auto',
            right: fullscreen ? 0 : 'auto',
            bottom: fullscreen ? 0 : 'auto',
            width: fullscreen ? '100vw' : '100%',
            height: fullscreen ? '100vh' : '100%',
            zIndex: fullscreen ? 1 : 'auto',
            pointerEvents: fullscreen ? 'none' : 'auto',
        };
    };
    const containerClasses = [
        'theme-background',
        pattern ? `pattern-${pattern}` : '',
        effect ? `effect-${effect}` : '',
        animation ? `animate-${animation}` : '',
        className,
    ].filter(Boolean).join(' ');
    return ((0, jsx_runtime_1.jsx)("div", { className: containerClasses, style: getBackgroundStyle(), children: children }));
};
exports.default = ThemeBackground;
//# sourceMappingURL=ThemeBackground.js.map