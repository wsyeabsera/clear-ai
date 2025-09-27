import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes';
import { ThemeName } from '../themes/types';

export interface ThemeDropdownProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Size of the dropdown
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Show theme labels in dropdown
   */
  showLabels?: boolean;
}

const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  className = '',
  size = 'md',
  showLabels = true,
}) => {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeConfig = {
    default: { name: 'Professional', emoji: '💼' },
    neowave: { name: 'Neowave', emoji: '🌊' },
    techno: { name: 'Techno', emoji: '⚡' },
    oldschool: { name: 'Old School', emoji: '📜' },
    alien: { name: 'Alien', emoji: '👽' },
  };

  const currentTheme = themeConfig[themeName as keyof typeof themeConfig];

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (themeKey: string) => {
    setTheme(themeKey as ThemeName);
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
    position: 'absolute' as const,
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
    textAlign: 'left' as const,
  };

  const activeItemStyles = {
    ...itemStyles,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
  };

  const hoverItemStyles = {
    backgroundColor: theme.colors.interactive.hover,
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        style={buttonStyles}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.paper;
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem' }}>
            {currentTheme.emoji}
          </span>
          {showLabels && (
            <span>{currentTheme.name}</span>
          )}
        </div>
        <span style={{ 
          fontSize: '0.75rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: theme.effects.transition.fast,
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={dropdownStyles} className={currentSize.dropdown}>
          {availableThemes.map((themeKey) => {
            const isActive = themeName === themeKey;
            const config = themeConfig[themeKey as keyof typeof themeConfig];
            
            return (
              <button
                key={themeKey}
                style={isActive ? activeItemStyles : itemStyles}
                onClick={() => handleThemeChange(themeKey)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    Object.assign(e.currentTarget.style, hoverItemStyles);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    Object.assign(e.currentTarget.style, itemStyles);
                  }
                }}
              >
                <span style={{ fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem' }}>
                  {config.emoji}
                </span>
                {showLabels && (
                  <span>{config.name}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
