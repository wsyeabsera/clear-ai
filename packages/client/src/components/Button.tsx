import React from 'react';
import { useTheme } from '../themes';

export interface ButtonProps {
  /**
   * The content to display inside the button
   */
  children: React.ReactNode;
  /**
   * The variant style of the button
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /**
   * The size of the button
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * The button type
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  const { theme } = useTheme();
  
  const getVariantStyles = () => {
    const baseStyles = {
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeight.medium,
      borderRadius: theme.effects.borderRadius.md,
      transition: theme.effects.transition.normal,
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary.main,
          color: theme.colors.primary.contrast,
          boxShadow: theme.effects.shadow.sm,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.secondary.main,
          color: theme.colors.secondary.contrast,
          boxShadow: theme.effects.shadow.sm,
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: theme.colors.primary.main,
          border: `2px solid ${theme.colors.primary.main}`,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: theme.colors.primary.main,
        };
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: theme.typography.fontSize.sm,
        };
      case 'md':
        return {
          padding: '0.5rem 1rem',
          fontSize: theme.typography.fontSize.base,
        };
      case 'lg':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: theme.typography.fontSize.lg,
        };
      default:
        return {
          padding: '0.5rem 1rem',
          fontSize: theme.typography.fontSize.base,
        };
    }
  };

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
  };

  // Use the styles object directly for inline styles (React expects camelCase)
  const inlineStyles = Object.entries(buttonStyles).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (like &:hover) - skip these for inline styles
      return acc;
    }
    // Keep camelCase for React inline styles
    acc[key] = String(value);
    return acc;
  }, {} as Record<string, string>);

  return (
    <button
      style={inlineStyles}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
