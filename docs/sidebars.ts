import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/development',
        'getting-started/memory-setup',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/memory-system',
        'features/component-library',
        'features/theme-system',
      ],
    },
    {
      type: 'category',
      label: 'Packages',
      items: [
        'packages/client',
        'packages/server',
        'packages/mcp-basic',
        'packages/shared',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/building-your-first-tool',
        'tutorials/creating-workflows',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/memory-quick-reference',
      ],
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Server APIs',
      items: [
        'api/server/tools',
        'api/server/memory',
        'api/server/memory-chat',
      ],
    },
  ],
};

export default sidebars;