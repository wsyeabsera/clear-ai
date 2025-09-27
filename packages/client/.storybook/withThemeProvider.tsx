import React from 'react';
import { Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/themes';

// Create a decorator that wraps stories with ThemeProvider
export const withThemeProvider: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'default';
  
  return (
    <ThemeProvider defaultTheme={theme}>
      <div style={{ 
        minHeight: '100vh', 
        padding: '2rem',
        fontFamily: 'var(--font-family-primary)'
      }}>
        <Story />
      </div>
    </ThemeProvider>
  );
};
