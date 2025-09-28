import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/clear-ai/blog',
    component: ComponentCreator('/clear-ai/blog', 'c74'),
    exact: true
  },
  {
    path: '/clear-ai/blog/archive',
    component: ComponentCreator('/clear-ai/blog/archive', '1f6'),
    exact: true
  },
  {
    path: '/clear-ai/blog/authors',
    component: ComponentCreator('/clear-ai/blog/authors', 'dba'),
    exact: true
  },
  {
    path: '/clear-ai/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/clear-ai/blog/authors/all-sebastien-lorber-articles', '1e4'),
    exact: true
  },
  {
    path: '/clear-ai/blog/authors/yangshun',
    component: ComponentCreator('/clear-ai/blog/authors/yangshun', 'cd0'),
    exact: true
  },
  {
    path: '/clear-ai/blog/first-blog-post',
    component: ComponentCreator('/clear-ai/blog/first-blog-post', '170'),
    exact: true
  },
  {
    path: '/clear-ai/blog/long-blog-post',
    component: ComponentCreator('/clear-ai/blog/long-blog-post', '1b8'),
    exact: true
  },
  {
    path: '/clear-ai/blog/mdx-blog-post',
    component: ComponentCreator('/clear-ai/blog/mdx-blog-post', 'd7f'),
    exact: true
  },
  {
    path: '/clear-ai/blog/tags',
    component: ComponentCreator('/clear-ai/blog/tags', '34c'),
    exact: true
  },
  {
    path: '/clear-ai/blog/tags/docusaurus',
    component: ComponentCreator('/clear-ai/blog/tags/docusaurus', 'c7e'),
    exact: true
  },
  {
    path: '/clear-ai/blog/tags/facebook',
    component: ComponentCreator('/clear-ai/blog/tags/facebook', '952'),
    exact: true
  },
  {
    path: '/clear-ai/blog/tags/hello',
    component: ComponentCreator('/clear-ai/blog/tags/hello', '062'),
    exact: true
  },
  {
    path: '/clear-ai/blog/tags/hola',
    component: ComponentCreator('/clear-ai/blog/tags/hola', 'c61'),
    exact: true
  },
  {
    path: '/clear-ai/blog/welcome',
    component: ComponentCreator('/clear-ai/blog/welcome', '0e7'),
    exact: true
  },
  {
    path: '/clear-ai/docs',
    component: ComponentCreator('/clear-ai/docs', '482'),
    routes: [
      {
        path: '/clear-ai/docs',
        component: ComponentCreator('/clear-ai/docs', '27f'),
        routes: [
          {
            path: '/clear-ai/docs',
            component: ComponentCreator('/clear-ai/docs', '6b5'),
            routes: [
              {
                path: '/clear-ai/docs/',
                component: ComponentCreator('/clear-ai/docs/', '434'),
                exact: true
              },
              {
                path: '/clear-ai/docs/api/overview',
                component: ComponentCreator('/clear-ai/docs/api/overview', '9db'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/clear-ai/docs/api/server/tools',
                component: ComponentCreator('/clear-ai/docs/api/server/tools', '87b'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/clear-ai/docs/architecture/overview',
                component: ComponentCreator('/clear-ai/docs/architecture/overview', '60d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/getting-started/development',
                component: ComponentCreator('/clear-ai/docs/getting-started/development', '2de'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/getting-started/installation',
                component: ComponentCreator('/clear-ai/docs/getting-started/installation', 'ce2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/getting-started/quick-start',
                component: ComponentCreator('/clear-ai/docs/getting-started/quick-start', '9b3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/intro',
                component: ComponentCreator('/clear-ai/docs/intro', '320'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/packages/client',
                component: ComponentCreator('/clear-ai/docs/packages/client', '1ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/packages/mcp-basic',
                component: ComponentCreator('/clear-ai/docs/packages/mcp-basic', 'edf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/packages/server',
                component: ComponentCreator('/clear-ai/docs/packages/server', 'ad9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/packages/shared',
                component: ComponentCreator('/clear-ai/docs/packages/shared', '39b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/tutorial-basics/congratulations',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/congratulations', '08b'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/create-a-blog-post', 'ff4'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-basics/create-a-document',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/create-a-document', '2ca'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-basics/create-a-page',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/create-a-page', 'db4'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/deploy-your-site', '5f4'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-basics/markdown-features',
                component: ComponentCreator('/clear-ai/docs/tutorial-basics/markdown-features', '7bc'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/clear-ai/docs/tutorial-extras/manage-docs-versions', 'a10'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorial-extras/translate-your-site',
                component: ComponentCreator('/clear-ai/docs/tutorial-extras/translate-your-site', '28b'),
                exact: true
              },
              {
                path: '/clear-ai/docs/tutorials/building-your-first-tool',
                component: ComponentCreator('/clear-ai/docs/tutorials/building-your-first-tool', 'f9f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/clear-ai/docs/tutorials/creating-workflows',
                component: ComponentCreator('/clear-ai/docs/tutorials/creating-workflows', 'b95'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/clear-ai/',
    component: ComponentCreator('/clear-ai/', 'cca'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
