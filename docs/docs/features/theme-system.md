# Theme System

Clear AI includes a comprehensive theming system that allows you to customize the appearance and behavior of your AI applications.

## Overview

The theme system provides:
- **Consistent Design Language**: Unified visual elements across all components
- **Customizable Styling**: Easy customization of colors, typography, and spacing
- **Dark/Light Mode**: Built-in support for theme switching
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: WCAG compliant color schemes and contrast ratios

## Theme Configuration

### Basic Theme Setup

```typescript
import { createTheme } from 'clear-ai/client';

const theme = createTheme({
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  }
});
```

### Dark Mode Theme

```typescript
const darkTheme = createTheme({
  colors: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9'
  },
  // ... other theme properties
});
```

## Color System

### Primary Colors

```typescript
const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Semantic colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    900: '#064e3b'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    900: '#78350f'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    900: '#7f1d1d'
  }
};
```

### Usage in Components

```typescript
import { styled } from 'clear-ai/client';

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary[500]};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  
  &:hover {
    background-color: ${props => props.theme.colors.primary[600]};
  }
`;
```

## Typography System

### Font Families

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};
```

### Typography Components

```typescript
import { Text, Heading } from 'clear-ai/client';

function TypographyExample() {
  return (
    <div>
      <Heading level={1} size="3xl" weight="bold">
        Main Heading
      </Heading>
      <Heading level={2} size="2xl" weight="semibold">
        Section Heading
      </Heading>
      <Text size="lg" weight="medium">
        Large text with medium weight
      </Text>
      <Text size="base" color="secondary">
        Regular text with secondary color
      </Text>
    </div>
  );
}
```

## Spacing System

### Spacing Scale

```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem'    // 96px
};
```

### Usage Examples

```typescript
import { Box } from 'clear-ai/client';

function SpacingExample() {
  return (
    <Box
      padding="lg"
      margin="md"
      gap="sm"
    >
      <Box padding="sm">Small padding</Box>
      <Box padding="md">Medium padding</Box>
      <Box padding="lg">Large padding</Box>
    </Box>
  );
}
```

## Component Theming

### Themed Components

```typescript
import { 
  Button, 
  Input, 
  Card, 
  Modal,
  Tooltip 
} from 'clear-ai/client';

function ThemedComponents() {
  return (
    <div>
      <Button variant="primary" size="lg">
        Primary Button
      </Button>
      
      <Input 
        placeholder="Enter text..."
        variant="outlined"
        size="md"
      />
      
      <Card 
        variant="elevated"
        padding="lg"
      >
        <Heading size="lg">Card Title</Heading>
        <Text>Card content goes here</Text>
      </Card>
      
      <Modal 
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <Heading size="xl">Modal Title</Heading>
        <Text>Modal content</Text>
      </Modal>
    </div>
  );
}
```

### Custom Component Styling

```typescript
import { styled } from 'clear-ai/client';

const CustomCard = styled(Card)`
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary[500]},
    ${props => props.theme.colors.primary[700]}
  );
  color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;
```

## Theme Switching

### Theme Provider

```typescript
import { ThemeProvider, useTheme } from 'clear-ai/client';

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeProvider theme={theme}>
      <ThemeToggle />
      <MainContent />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      variant="outline"
    >
      {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
    </Button>
  );
}
```

### System Theme Detection

```typescript
import { useSystemTheme } from 'clear-ai/client';

function App() {
  const systemTheme = useSystemTheme();
  const [theme, setTheme] = useState(systemTheme);
  
  return (
    <ThemeProvider theme={theme}>
      <MainContent />
    </ThemeProvider>
  );
}
```

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

### Responsive Components

```typescript
import { Box, useBreakpoint } from 'clear-ai/client';

function ResponsiveLayout() {
  const breakpoint = useBreakpoint();
  
  return (
    <Box
      display="flex"
      flexDirection={breakpoint === 'sm' ? 'column' : 'row'}
      gap="md"
      padding={breakpoint === 'sm' ? 'sm' : 'lg'}
    >
      <Box flex={1}>
        <Heading size={breakpoint === 'sm' ? 'lg' : 'xl'}>
          Responsive Heading
        </Heading>
      </Box>
      <Box flex={1}>
        <Text size={breakpoint === 'sm' ? 'sm' : 'base'}>
          Responsive text content
        </Text>
      </Box>
    </Box>
  );
}
```

## Accessibility

### Color Contrast

```typescript
const accessibleColors = {
  text: {
    primary: '#1e293b',    // High contrast on white
    secondary: '#64748b',  // Medium contrast
    disabled: '#94a3b8'    // Low contrast for disabled
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    disabled: '#f1f5f9'
  }
};
```

### Focus States

```typescript
const focusStyles = {
  outline: '2px solid #3b82f6',
  outlineOffset: '2px',
  borderRadius: '4px'
};
```

## Custom Themes

### Creating a Custom Theme

```typescript
import { createTheme } from 'clear-ai/client';

const customTheme = createTheme({
  colors: {
    primary: '#8b5cf6', // Purple primary
    secondary: '#06b6d4', // Cyan secondary
    // ... other colors
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    // ... other typography settings
  },
  components: {
    Button: {
      borderRadius: '12px',
      padding: '12px 24px',
      fontWeight: 600
    },
    Card: {
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }
});
```

### Theme Variants

```typescript
const themeVariants = {
  corporate: {
    colors: { primary: '#1e40af', secondary: '#64748b' },
    typography: { fontFamily: 'Roboto, sans-serif' }
  },
  creative: {
    colors: { primary: '#ec4899', secondary: '#f59e0b' },
    typography: { fontFamily: 'Poppins, sans-serif' }
  },
  minimal: {
    colors: { primary: '#000000', secondary: '#6b7280' },
    typography: { fontFamily: 'Inter, sans-serif' }
  }
};
```

## Best Practices

1. **Consistent Color Usage**: Use semantic color names (primary, secondary, success, etc.)
2. **Accessible Contrast**: Ensure sufficient color contrast ratios
3. **Responsive Design**: Test themes across different screen sizes
4. **Performance**: Use CSS custom properties for dynamic theming
5. **Documentation**: Document custom theme variables and usage

## Migration Guide

### From v1 to v2

```typescript
// v1
const oldTheme = {
  primaryColor: '#3b82f6',
  fontSize: '16px'
};

// v2
const newTheme = createTheme({
  colors: {
    primary: '#3b82f6'
  },
  typography: {
    fontSize: {
      base: '1rem'
    }
  }
});
```

## Troubleshooting

### Common Issues

1. **Theme not applying**: Ensure ThemeProvider wraps your app
2. **Colors not updating**: Check for CSS specificity issues
3. **Dark mode not working**: Verify theme switching logic
4. **Responsive issues**: Check breakpoint definitions

### Debug Mode

```typescript
const theme = createTheme({
  // ... theme config
  debug: true // Enable theme debugging
});
```
