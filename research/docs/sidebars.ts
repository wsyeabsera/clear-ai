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
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/monorepo-structure',
        'architecture/data-flow',
        'architecture/design-patterns',
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
      label: 'Features',
      items: [
        'features/tool-execution',
        'features/langgraph-workflows',
        'features/llm-integration',
        'features/theme-system',
        'features/component-library',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/building-your-first-tool',
        'tutorials/creating-workflows',
        'tutorials/custom-themes',
        'tutorials/api-integration',
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
        'api/server/health',
        'api/server/tools',
        'api/server/langgraph',
        'api/server/mcp',
        'api/server/users',
      ],
    },
    {
      type: 'category',
      label: 'Client APIs',
      items: [
        'api/client/services',
        'api/client/components',
        'api/client/hooks',
      ],
    },
    {
      type: 'category',
      label: 'MCP Tools',
      items: [
        'api/mcp/api-call',
        'api/mcp/json-reader',
        'api/mcp/file-reader',
        'api/mcp/execute-parallel',
      ],
    },
    {
      type: 'category',
      label: 'Shared Services',
      items: [
        'api/shared/llm-providers',
        'api/shared/workflows',
        'api/shared/types',
      ],
    },
  ],
};

export default sidebars;