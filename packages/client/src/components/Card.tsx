import React from 'react';
import { useTheme } from '../themes';

export interface CardProps {
  /**
   * The content to display inside the card
   */
  children: React.ReactNode;
  /**
   * The title of the card
   */
  title?: string;
  /**
   * Whether the card has a shadow
   */
  shadow?: boolean;
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  shadow = true,
  clickable = false,
  onClick,
  className = '',
}) => {
  const { theme } = useTheme();
  
  const cardStyles = {
    backgroundColor: theme.colors.background.paper,
    border: `1px solid ${theme.colors.border.light}`,
    borderRadius: theme.effects.borderRadius.lg,
    padding: '1.5rem',
    fontFamily: theme.typography.fontFamily.primary,
    transition: theme.effects.transition.normal,
    cursor: clickable ? 'pointer' : 'default',
    boxShadow: shadow ? theme.effects.shadow.sm : 'none',
    '&:hover': clickable ? {
      boxShadow: theme.effects.shadow.md,
      transform: 'translateY(-2px)',
    } : {},
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: '1rem',
    fontFamily: theme.typography.fontFamily.primary,
  };

  // Use the styles object directly for inline styles (React expects camelCase)
  const inlineStyles = Object.entries(cardStyles).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (like &:hover) - skip these for inline styles
      return acc;
    }
    // Keep camelCase for React inline styles
    acc[key] = String(value);
    return acc;
  }, {} as Record<string, string>);

  const titleInlineStyles = Object.entries(titleStyles).reduce((acc, [key, value]) => {
    // Keep camelCase for React inline styles
    acc[key] = String(value);
    return acc;
  }, {} as Record<string, string>);
  
  return (
    <div style={inlineStyles} className={className} onClick={onClick}>
      {title && (
        <h3 style={titleInlineStyles}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
