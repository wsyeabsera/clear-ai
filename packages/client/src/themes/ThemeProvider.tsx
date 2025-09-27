import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName } from './types';
import { themes } from './configs';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'default',
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [theme, setThemeState] = useState<Theme>(themes[defaultTheme]);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    setThemeState(themes[newThemeName]);
    
    // Store theme preference in localStorage
    localStorage.setItem('theme-preference', newThemeName);
    
    // Apply theme to document root for global CSS variables
    applyThemeToDocument(themes[newThemeName]);
  };

  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary-main', theme.colors.primary.main);
    root.style.setProperty('--color-primary-light', theme.colors.primary.light);
    root.style.setProperty('--color-primary-dark', theme.colors.primary.dark);
    root.style.setProperty('--color-primary-contrast', theme.colors.primary.contrast);
    
    root.style.setProperty('--color-secondary-main', theme.colors.secondary.main);
    root.style.setProperty('--color-secondary-light', theme.colors.secondary.light);
    root.style.setProperty('--color-secondary-dark', theme.colors.secondary.dark);
    root.style.setProperty('--color-secondary-contrast', theme.colors.secondary.contrast);
    
    root.style.setProperty('--color-background-default', theme.colors.background.default);
    root.style.setProperty('--color-background-paper', theme.colors.background.paper);
    root.style.setProperty('--color-background-elevated', theme.colors.background.elevated);
    
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--color-text-disabled', theme.colors.text.disabled);
    root.style.setProperty('--color-text-inverse', theme.colors.text.inverse);
    
    root.style.setProperty('--color-border-default', theme.colors.border.default);
    root.style.setProperty('--color-border-light', theme.colors.border.light);
    root.style.setProperty('--color-border-dark', theme.colors.border.dark);
    
    root.style.setProperty('--color-status-success', theme.colors.status.success);
    root.style.setProperty('--color-status-warning', theme.colors.status.warning);
    root.style.setProperty('--color-status-error', theme.colors.status.error);
    root.style.setProperty('--color-status-info', theme.colors.status.info);
    
    root.style.setProperty('--color-interactive-hover', theme.colors.interactive.hover);
    root.style.setProperty('--color-interactive-active', theme.colors.interactive.active);
    root.style.setProperty('--color-interactive-focus', theme.colors.interactive.focus);
    root.style.setProperty('--color-interactive-disabled', theme.colors.interactive.disabled);
    
    root.style.setProperty('--shadow-sm', theme.effects.shadow.sm);
    root.style.setProperty('--shadow-md', theme.effects.shadow.md);
    root.style.setProperty('--shadow-lg', theme.effects.shadow.lg);
    root.style.setProperty('--shadow-xl', theme.effects.shadow.xl);
    
    root.style.setProperty('--border-radius-sm', theme.effects.borderRadius.sm);
    root.style.setProperty('--border-radius-md', theme.effects.borderRadius.md);
    root.style.setProperty('--border-radius-lg', theme.effects.borderRadius.lg);
    root.style.setProperty('--border-radius-full', theme.effects.borderRadius.full);
    
    root.style.setProperty('--transition-fast', theme.effects.transition.fast);
    root.style.setProperty('--transition-normal', theme.effects.transition.normal);
    root.style.setProperty('--transition-slow', theme.effects.transition.slow);
    
    // Apply font families
    root.style.setProperty('--font-family-primary', theme.typography.fontFamily.primary);
    root.style.setProperty('--font-family-secondary', theme.typography.fontFamily.secondary);
    root.style.setProperty('--font-family-mono', theme.typography.fontFamily.mono);
    
    // Set theme name as a data attribute for CSS targeting
    root.setAttribute('data-theme', theme.name);
  };

  useEffect(() => {
    // Load theme preference from localStorage on mount
    const savedTheme = localStorage.getItem('theme-preference') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
      setThemeState(themes[savedTheme]);
      applyThemeToDocument(themes[savedTheme]);
    } else {
      applyThemeToDocument(theme);
    }
  }, []);

  const availableThemes: ThemeName[] = Object.keys(themes) as ThemeName[];

  const contextValue: ThemeContextType = {
    theme,
    themeName,
    setTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  return {
    // Button styles
    button: {
      primary: {
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.primary.contrast,
        border: `1px solid ${theme.colors.primary.main}`,
        boxShadow: theme.effects.shadow.sm,
        borderRadius: theme.effects.borderRadius.md,
        transition: theme.effects.transition.normal,
        fontFamily: theme.typography.fontFamily.primary,
        '&:hover': {
          backgroundColor: theme.colors.primary.dark,
          boxShadow: theme.effects.shadow.md,
        },
        '&:active': {
          backgroundColor: theme.colors.primary.dark,
          transform: 'translateY(1px)',
        },
        '&:disabled': {
          backgroundColor: theme.colors.interactive.disabled,
          color: theme.colors.text.disabled,
          cursor: 'not-allowed',
        },
      },
      secondary: {
        backgroundColor: theme.colors.secondary.main,
        color: theme.colors.secondary.contrast,
        border: `1px solid ${theme.colors.secondary.main}`,
        boxShadow: theme.effects.shadow.sm,
        borderRadius: theme.effects.borderRadius.md,
        transition: theme.effects.transition.normal,
        fontFamily: theme.typography.fontFamily.primary,
        '&:hover': {
          backgroundColor: theme.colors.secondary.dark,
          boxShadow: theme.effects.shadow.md,
        },
        '&:active': {
          backgroundColor: theme.colors.secondary.dark,
          transform: 'translateY(1px)',
        },
        '&:disabled': {
          backgroundColor: theme.colors.interactive.disabled,
          color: theme.colors.text.disabled,
          cursor: 'not-allowed',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: theme.colors.primary.main,
        border: `2px solid ${theme.colors.primary.main}`,
        borderRadius: theme.effects.borderRadius.md,
        transition: theme.effects.transition.normal,
        fontFamily: theme.typography.fontFamily.primary,
        '&:hover': {
          backgroundColor: theme.colors.interactive.hover,
          boxShadow: theme.effects.shadow.sm,
        },
        '&:active': {
          backgroundColor: theme.colors.interactive.active,
          transform: 'translateY(1px)',
        },
        '&:disabled': {
          borderColor: theme.colors.text.disabled,
          color: theme.colors.text.disabled,
          cursor: 'not-allowed',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.primary.main,
        border: 'none',
        borderRadius: theme.effects.borderRadius.md,
        transition: theme.effects.transition.normal,
        fontFamily: theme.typography.fontFamily.primary,
        '&:hover': {
          backgroundColor: theme.colors.interactive.hover,
        },
        '&:active': {
          backgroundColor: theme.colors.interactive.active,
        },
        '&:disabled': {
          color: theme.colors.text.disabled,
          cursor: 'not-allowed',
        },
      },
    },
    // Card styles
    card: {
      backgroundColor: theme.colors.background.paper,
      border: `1px solid ${theme.colors.border.light}`,
      borderRadius: theme.effects.borderRadius.lg,
      boxShadow: theme.effects.shadow.sm,
      transition: theme.effects.transition.normal,
      fontFamily: theme.typography.fontFamily.primary,
      '&:hover': {
        boxShadow: theme.effects.shadow.md,
      },
    },
    // Input styles
    input: {
      backgroundColor: theme.colors.background.default,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.default}`,
      borderRadius: theme.effects.borderRadius.md,
      boxShadow: theme.effects.shadow.sm,
      transition: theme.effects.transition.normal,
      fontFamily: theme.typography.fontFamily.primary,
      '&:focus': {
        outline: 'none',
        borderColor: theme.colors.primary.main,
        boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
      },
      '&:disabled': {
        backgroundColor: theme.colors.interactive.disabled,
        color: theme.colors.text.disabled,
        cursor: 'not-allowed',
      },
      '&::placeholder': {
        color: theme.colors.text.disabled,
      },
    },
  };
};
