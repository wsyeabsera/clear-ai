# Storybook Setup

This project includes a comprehensive Storybook setup for component development and documentation.

## Getting Started

### Running Storybook

```bash
# Start Storybook development server
yarn storybook

# Build Storybook for production
yarn build-storybook

# Run tests for all stories
yarn test-storybook
```

Storybook will be available at `http://localhost:6006`

## Features

### Addons Included

- **@storybook/addon-docs** - Automatic documentation generation
- **@storybook/addon-controls** - Interactive controls for component props
- **@storybook/addon-actions** - Action logging for event handlers
- **@storybook/addon-viewport** - Test components in different viewport sizes
- **@storybook/addon-backgrounds** - Test components on different backgrounds
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-vitest** - Run tests directly in Storybook

### TypeScript Support

- Full TypeScript support with type checking
- Automatic prop type documentation
- IntelliSense support in stories

### Tailwind CSS Integration

- Tailwind CSS is automatically imported in all stories
- All utility classes work as expected
- Responsive design testing with viewport addon

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MyComponent from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
  },
  args: {
    onClick: action('clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

### Story Types

1. **Basic Stories** - Simple component variations
2. **Interactive Stories** - Stories with user interactions
3. **Composition Stories** - Multiple components together
4. **Playground Stories** - All variants in one view

### Best Practices

1. **Use meaningful story names** that describe the use case
2. **Include all prop variations** as separate stories
3. **Add controls** for interactive props
4. **Use actions** for event handlers
5. **Include composition stories** showing real usage
6. **Add documentation** with JSDoc comments

## Component Guidelines

### Props Interface

```typescript
export interface ComponentProps {
  /**
   * Description of the prop
   */
  propName: string;
  /**
   * Optional prop with default
   */
  optionalProp?: boolean;
  /**
   * Event handler
   */
  onClick?: () => void;
}
```

### Styling

- Use Tailwind CSS classes
- Follow the design system patterns
- Include responsive variants
- Test with different themes/backgrounds

### Accessibility

- Include proper ARIA attributes
- Test with a11y addon
- Ensure keyboard navigation works
- Use semantic HTML elements

## Testing

### Running Tests

```bash
# Run all Storybook tests
yarn test-storybook

# Run tests in watch mode
yarn test-storybook --watch

# Run tests with coverage
yarn test-storybook --coverage
```

### Test Structure

Tests are automatically generated from stories and can be customized in the `.storybook/vitest.setup.ts` file.

## File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.test.tsx (optional)
│   └── index.ts
└── styles/
    └── index.css (imported in .storybook/preview.ts)
```

## Configuration

### Main Configuration (`.storybook/main.ts`)

- Story discovery patterns
- Addon configuration
- TypeScript settings
- Vite integration

### Preview Configuration (`.storybook/preview.ts`)

- Global styles
- Default parameters
- Decorators
- Global arg types

## Tips and Tricks

1. **Use the Controls addon** to test different prop combinations
2. **Use the Viewport addon** to test responsive behavior
3. **Use the Actions addon** to verify event handlers
4. **Use the A11y addon** to check accessibility
5. **Use composition stories** to show real-world usage
6. **Document complex props** with JSDoc comments

## Troubleshooting

### Common Issues

1. **Tailwind classes not working** - Ensure CSS is imported in preview.ts
2. **TypeScript errors** - Check tsconfig.json includes story files
3. **Path aliases not working** - Verify viteFinal configuration
4. **Tests not running** - Check vitest configuration

### Getting Help

- Check the [Storybook documentation](https://storybook.js.org/docs)
- Review the [Vite integration guide](https://storybook.js.org/docs/react/builders/vite)
- Check the [TypeScript guide](https://storybook.js.org/docs/react/configure/typescript)
