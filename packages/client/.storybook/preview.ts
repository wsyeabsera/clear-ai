import type { Preview } from '@storybook/react'
import '../src/styles/index.css'
import { withThemeProvider } from './withThemeProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Professional 💼' },
          { value: 'neowave', title: 'Neowave 🌊' },
          { value: 'techno', title: 'Techno ⚡' },
          { value: 'oldschool', title: 'Old School 📜' },
          { value: 'alien', title: 'Alien 👽' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  decorators: [withThemeProvider],
};

export default preview;