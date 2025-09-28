import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/Clear-AI/blog',
    component: ComponentCreator('/Clear-AI/blog', '85d'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/archive',
    component: ComponentCreator('/Clear-AI/blog/archive', '108'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/authors',
    component: ComponentCreator('/Clear-AI/blog/authors', '7a8'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/Clear-AI/blog/authors/all-sebastien-lorber-articles', '85c'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/authors/yangshun',
    component: ComponentCreator('/Clear-AI/blog/authors/yangshun', '752'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/first-blog-post',
    component: ComponentCreator('/Clear-AI/blog/first-blog-post', '320'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/long-blog-post',
    component: ComponentCreator('/Clear-AI/blog/long-blog-post', 'bd5'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/mdx-blog-post',
    component: ComponentCreator('/Clear-AI/blog/mdx-blog-post', '710'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/tags',
    component: ComponentCreator('/Clear-AI/blog/tags', '082'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/tags/docusaurus',
    component: ComponentCreator('/Clear-AI/blog/tags/docusaurus', '0f5'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/tags/facebook',
    component: ComponentCreator('/Clear-AI/blog/tags/facebook', '5c8'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/tags/hello',
    component: ComponentCreator('/Clear-AI/blog/tags/hello', '428'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/tags/hola',
    component: ComponentCreator('/Clear-AI/blog/tags/hola', '527'),
    exact: true
  },
  {
    path: '/Clear-AI/blog/welcome',
    component: ComponentCreator('/Clear-AI/blog/welcome', '8b8'),
    exact: true
  },
  {
    path: '/Clear-AI/markdown-page',
    component: ComponentCreator('/Clear-AI/markdown-page', '8d6'),
    exact: true
  },
  {
    path: '/Clear-AI/docs',
    component: ComponentCreator('/Clear-AI/docs', 'a92'),
    routes: [
      {
        path: '/Clear-AI/docs',
        component: ComponentCreator('/Clear-AI/docs', '8da'),
        routes: [
          {
            path: '/Clear-AI/docs',
            component: ComponentCreator('/Clear-AI/docs', 'fa0'),
            routes: [
              {
                path: '/Clear-AI/docs/api/overview',
                component: ComponentCreator('/Clear-AI/docs/api/overview', 'b65'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/Clear-AI/docs/api/server/tools',
                component: ComponentCreator('/Clear-AI/docs/api/server/tools', '5cc'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/Clear-AI/docs/architecture/overview',
                component: ComponentCreator('/Clear-AI/docs/architecture/overview', '3f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/getting-started/development',
                component: ComponentCreator('/Clear-AI/docs/getting-started/development', 'd20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/getting-started/installation',
                component: ComponentCreator('/Clear-AI/docs/getting-started/installation', '4fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/getting-started/quick-start',
                component: ComponentCreator('/Clear-AI/docs/getting-started/quick-start', '099'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/intro',
                component: ComponentCreator('/Clear-AI/docs/intro', '678'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/packages/client',
                component: ComponentCreator('/Clear-AI/docs/packages/client', 'eb6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/packages/mcp-basic',
                component: ComponentCreator('/Clear-AI/docs/packages/mcp-basic', '2d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/packages/server',
                component: ComponentCreator('/Clear-AI/docs/packages/server', '760'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/packages/shared',
                component: ComponentCreator('/Clear-AI/docs/packages/shared', '97a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/congratulations',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/congratulations', '084'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/create-a-blog-post', '9e0'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/create-a-document',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/create-a-document', '23e'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/create-a-page',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/create-a-page', 'f57'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/deploy-your-site', '83e'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-basics/markdown-features',
                component: ComponentCreator('/Clear-AI/docs/tutorial-basics/markdown-features', '740'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/Clear-AI/docs/tutorial-extras/manage-docs-versions', '1ff'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorial-extras/translate-your-site',
                component: ComponentCreator('/Clear-AI/docs/tutorial-extras/translate-your-site', 'a8b'),
                exact: true
              },
              {
                path: '/Clear-AI/docs/tutorials/building-your-first-tool',
                component: ComponentCreator('/Clear-AI/docs/tutorials/building-your-first-tool', '17d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/docs/tutorials/creating-workflows',
                component: ComponentCreator('/Clear-AI/docs/tutorials/creating-workflows', 'ad6'),
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
    path: '/Clear-AI/',
    component: ComponentCreator('/Clear-AI/', '628'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
