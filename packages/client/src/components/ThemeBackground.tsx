import React from 'react';
import { useTheme } from '../themes';

export interface ThemeBackgroundProps {
  /**
   * Pattern type to apply
   */
  pattern?: 'dots' | 'grid' | 'lines' | 'waves' | 'hexagons' | 'triangles' | 'circles' | 'squares' | 'custom';
  /**
   * Effect type to apply
   */
  effect?: 'hologram' | 'matrix' | 'cyber' | 'vintage' | 'cosmic' | 'quantum';
  /**
   * Background animation type
   */
  animation?: 'floating' | 'rotating' | 'pulsing' | 'morphing' | 'flowing' | 'custom';
  /**
   * Opacity of the pattern/effect
   */
  opacity?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children to render
   */
  children?: React.ReactNode;
  /**
   * Whether to apply the background to the entire viewport
   */
  fullscreen?: boolean;
}

const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
  pattern,
  effect,
  animation,
  opacity = 0.1,
  className = '',
  children,
  fullscreen = false,
}) => {
  const { theme } = useTheme();

  const getPatternStyle = () => {
    if (!pattern) return {};
    
    const patternValue = theme.effects.patterns?.[pattern];
    if (!patternValue) return {};

    return {
      backgroundImage: patternValue,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat',
      opacity: opacity,
    };
  };

  const getEffectStyle = () => {
    if (!effect) return {};
    
    const effectValue = theme.effects.effects?.[effect];
    if (!effectValue) return {};

    return {
      background: effectValue,
      backgroundSize: '200% 200%',
      backgroundRepeat: 'no-repeat',
      opacity: opacity,
    };
  };

  const getAnimationStyle = () => {
    if (!animation) return {};
    
    const animationValue = theme.effects.backgroundAnimations?.[animation];
    if (!animationValue) return {};

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
      position: fullscreen ? 'fixed' as const : 'relative' as const,
      top: fullscreen ? 0 : 'auto',
      left: fullscreen ? 0 : 'auto',
      right: fullscreen ? 0 : 'auto',
      bottom: fullscreen ? 0 : 'auto',
      width: fullscreen ? '100vw' : '100%',
      height: fullscreen ? '100vh' : '100%',
      zIndex: fullscreen ? 1 : 'auto',
      pointerEvents: fullscreen ? 'none' as const : 'auto' as const,
    };
  };

  const containerClasses = [
    'theme-background',
    pattern ? `pattern-${pattern}` : '',
    effect ? `effect-${effect}` : '',
    animation ? `animate-${animation}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={getBackgroundStyle()}
    >
      {children}
    </div>
  );
};

export default ThemeBackground;
