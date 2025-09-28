# Client Package

The Clear AI client is a modern React application that provides the user interface for interacting with the AI-powered tool execution system. Built with TypeScript, Vite, and Tailwind CSS, it offers a responsive, themeable, and highly interactive experience.

## Overview

The client package (`@clear-ai/client`) is the frontend of the Clear AI system. It provides:

- **User Interface**: React-based web application
- **Theme System**: Multiple visual themes with smooth transitions
- **Component Library**: Reusable UI components with Storybook documentation
- **API Integration**: Seamless communication with the backend services
- **Tool Execution Interface**: User-friendly tools for running AI workflows

## Technology Stack

### Core Technologies
- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety throughout
- **Vite**: Lightning-fast development and building
- **Tailwind CSS**: Utility-first CSS framework

### Additional Libraries
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Storybook**: Component documentation and testing

## Project Structure

```
packages/client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── AvailableTools.tsx
│   │   ├── ToolExecute.tsx
│   │   └── Users.tsx
│   ├── services/           # API services
│   │   ├── api.ts
│   │   ├── toolService.ts
│   │   └── userService.ts
│   ├── themes/             # Theme system
│   │   ├── ThemeProvider.tsx
│   │   ├── types.ts
│   │   ├── configs.ts
│   │   └── themes/
│   │       ├── default/
│   │       ├── neowave/
│   │       ├── techno/
│   │       ├── oldschool/
│   │       └── alien/
│   ├── styles/             # Global styles
│   │   ├── index.css
│   │   ├── theme-animations.css
│   │   └── theme-patterns.css
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── dist/                   # Built files
├── storybook-static/       # Storybook build
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Features

### 1. Theme System

Clear AI includes a sophisticated theme system with 5 different themes:

#### Available Themes

**Default Theme**
- Clean, modern design
- Light color scheme
- Professional appearance

**NeoWave Theme**
- Dark, futuristic design
- Neon accents
- Cyberpunk aesthetic

**Techno Theme**
- High-contrast design
- Electric colors
- Tech-focused styling

**OldSchool Theme**
- Retro design
- Warm colors
- Classic appearance

**Alien Theme**
- Otherworldly design
- Unusual color combinations
- Sci-fi inspired

#### Theme Implementation

```typescript
// Theme configuration
export interface Theme {
  name: string;
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    background: ColorPalette;
    text: ColorPalette;
  };
  animations: AnimationConfig;
  patterns: PatternConfig;
}

// Using themes in components
const { theme, setTheme } = useTheme();

return (
  <div style={{ color: theme.colors.text.primary }}>
    <button onClick={() => setTheme('neowave')}>
      Switch to NeoWave
    </button>
  </div>
);
```

### 2. Component Library

The client includes a comprehensive component library:

#### Core Components

**Button Component**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Card Component**
```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}
```

**Input Component**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
```

#### Component Features
- **Type Safety**: Full TypeScript support
- **Theme Integration**: Automatic theme-aware styling
- **Accessibility**: ARIA attributes and keyboard navigation
- **Responsive**: Mobile-first design
- **Customizable**: Extensive prop options

### 3. Page Components

#### Home Page (`/`)
- Welcome message
- Feature highlights
- Quick start guide
- System status

#### Available Tools (`/available-tools`)
- List of registered tools
- Tool descriptions
- Usage examples
- Execution history

#### Tool Execute (`/tool-execute`)
- Tool execution interface
- Parameter input forms
- Real-time results
- Error handling

#### Users (`/users`)
- User management
- User creation
- User listing
- User details

#### Components (`/components`)
- Component showcase
- Interactive examples
- Theme switching
- Code snippets

### 4. API Integration

#### Service Layer

The client uses a service layer pattern for API communication:

```typescript
// API service base class
class ApiService {
  protected baseURL: string;
  protected axios: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axios = axios.create({ baseURL });
  }
}

// Tool service
class ToolService extends ApiService {
  async getTools(): Promise<Tool[]> {
    const response = await this.axios.get('/api/tools');
    return response.data.data;
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    const response = await this.axios.post('/api/tools/execute', {
      toolName,
      args
    });
    return response.data.data;
  }
}
```

#### Error Handling

Comprehensive error handling throughout the application:

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Development

### Getting Started

```bash
# Navigate to client package
cd packages/client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Storybook
npm run storybook    # Start Storybook dev server
npm run build-storybook  # Build Storybook

# Testing
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
```

### Building

```bash
# Build for production
npm run build

# The built files will be in dist/
# - index.html
# - assets/index-*.js
# - assets/index-*.css
```

### Environment Variables

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=true
```

## Styling

### Tailwind CSS

The client uses Tailwind CSS for styling:

```typescript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

### Custom CSS

Global styles are in `src/styles/`:

- `index.css`: Base styles and Tailwind imports
- `theme-animations.css`: Theme-specific animations
- `theme-patterns.css`: Background patterns

### Theme Styling

Components automatically adapt to the current theme:

```typescript
// Component with theme integration
const ThemedButton = ({ children, ...props }) => {
  const { theme } = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.text.primary,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Testing

### Unit Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Component Testing

Components are tested using Vitest and React Testing Library:

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Storybook Testing

Components are documented and tested in Storybook:

```typescript
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

## Performance

### Optimization Strategies

1. **Code Splitting**: Routes are lazy-loaded
2. **Bundle Analysis**: Regular bundle size monitoring
3. **Image Optimization**: Optimized assets
4. **Caching**: API response caching
5. **Memoization**: React.memo for expensive components

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Serve locally
npm run preview
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Best Practices

### Code Organization

1. **Component Structure**: Keep components small and focused
2. **Custom Hooks**: Extract reusable logic
3. **Type Safety**: Use TypeScript strictly
4. **Error Boundaries**: Handle errors gracefully
5. **Performance**: Optimize re-renders

### Naming Conventions

- **Components**: PascalCase (`Button`, `UserCard`)
- **Hooks**: camelCase starting with `use` (`useTheme`, `useApi`)
- **Files**: kebab-case (`user-service.ts`, `theme-provider.tsx`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## Troubleshooting

### Common Issues

**Hot Reload Not Working**
```bash
# Restart dev server
npm run dev
```

**TypeScript Errors**
```bash
# Check types
npm run type-check
```

**Build Failures**
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Next Steps

Now that you understand the client package:

1. **Explore Components**: Check out the [component library](/docs/features/component-library)
2. **Learn Theming**: Deep dive into the [theme system](/docs/features/theme-system)
3. **API Integration**: Understand [API services](/docs/api/client/services)
4. **Build Something**: Follow the [tutorials](/docs/tutorials/custom-themes)
