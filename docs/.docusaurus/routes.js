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
    path: '/Clear-AI/',
    component: ComponentCreator('/Clear-AI/', '969'),
    routes: [
      {
        path: '/Clear-AI/',
        component: ComponentCreator('/Clear-AI/', 'bdd'),
        routes: [
          {
            path: '/Clear-AI/',
            component: ComponentCreator('/Clear-AI/', '91f'),
            routes: [
              {
                path: '/Clear-AI/api/overview',
                component: ComponentCreator('/Clear-AI/api/overview', '696'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/Clear-AI/api/server/tools',
                component: ComponentCreator('/Clear-AI/api/server/tools', 'ec2'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/Clear-AI/architecture/overview',
                component: ComponentCreator('/Clear-AI/architecture/overview', '4d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/getting-started/development',
                component: ComponentCreator('/Clear-AI/getting-started/development', 'e9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/getting-started/installation',
                component: ComponentCreator('/Clear-AI/getting-started/installation', '42f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/getting-started/quick-start',
                component: ComponentCreator('/Clear-AI/getting-started/quick-start', '254'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/intro',
                component: ComponentCreator('/Clear-AI/intro', 'ebc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/packages/client',
                component: ComponentCreator('/Clear-AI/packages/client', '51c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/packages/mcp-basic',
                component: ComponentCreator('/Clear-AI/packages/mcp-basic', 'a0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/packages/server',
                component: ComponentCreator('/Clear-AI/packages/server', '60f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/packages/shared',
                component: ComponentCreator('/Clear-AI/packages/shared', '5fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/tutorial-basics/congratulations',
                component: ComponentCreator('/Clear-AI/tutorial-basics/congratulations', '1bd'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/Clear-AI/tutorial-basics/create-a-blog-post', '350'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-basics/create-a-document',
                component: ComponentCreator('/Clear-AI/tutorial-basics/create-a-document', 'c38'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-basics/create-a-page',
                component: ComponentCreator('/Clear-AI/tutorial-basics/create-a-page', '181'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/Clear-AI/tutorial-basics/deploy-your-site', '5b3'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-basics/markdown-features',
                component: ComponentCreator('/Clear-AI/tutorial-basics/markdown-features', 'acb'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/Clear-AI/tutorial-extras/manage-docs-versions', '310'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorial-extras/translate-your-site',
                component: ComponentCreator('/Clear-AI/tutorial-extras/translate-your-site', 'e54'),
                exact: true
              },
              {
                path: '/Clear-AI/tutorials/building-your-first-tool',
                component: ComponentCreator('/Clear-AI/tutorials/building-your-first-tool', '20e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/tutorials/creating-workflows',
                component: ComponentCreator('/Clear-AI/tutorials/creating-workflows', '24c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/Clear-AI/',
                component: ComponentCreator('/Clear-AI/', '136'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
