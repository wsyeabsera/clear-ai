# Clear AI Monorepo

A modern TypeScript monorepo for building scalable web applications with shared code, type safety, and efficient development workflows.

## 🏗️ Architecture

This monorepo contains three main packages:

- **`@clear-ai/shared`** - Shared types, utilities, and constants used across all packages
- **`@clear-ai/client`** - React frontend application with Vite and TypeScript
- **`@clear-ai/server`** - Node.js backend API with Express and TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start all applications in development mode:
```bash
npm run dev
```

This will start:
- Client application on http://localhost:3000
- Server API on http://localhost:3001

## 📦 Packages

### Shared Package (`@clear-ai/shared`)

Contains common types, utilities, and constants used across the entire application.

**Features:**
- Common TypeScript types and interfaces
- Utility functions (date formatting, validation, etc.)
- Application constants and configuration
- API response types

**Usage:**
```typescript
import { User, ApiResponse, formatDate } from '@clear-ai/shared'
```

### Client Package (`@clear-ai/client`)

Modern React application built with Vite, TypeScript, and Tailwind CSS.

**Features:**
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Hot reload and fast refresh

**Development:**
```bash
cd packages/client
npm run dev
```

**Build:**
```bash
npm run build
```

### Server Package (`@clear-ai/server`)

Express.js API server with TypeScript, featuring RESTful endpoints and middleware.

**Features:**
- Express.js with TypeScript
- RESTful API endpoints
- Middleware for validation and error handling
- CORS and security headers
- Request logging with Morgan
- Environment configuration

**Development:**
```bash
cd packages/server
npm run dev
```

**Build:**
```bash
npm run build
npm start
```

## 🛠️ Development

### Available Scripts

From the root directory:

- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages
- `npm run lint` - Run ESLint on all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean all build artifacts and node_modules

### Package-Specific Scripts

Each package has its own set of scripts. Navigate to the package directory and run:

**Shared:**
- `npm run build` - Build the shared package
- `npm run dev` - Watch mode for development

**Client:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm run dev` - Start with tsx watch mode
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## 🔧 Configuration

### Environment Variables

**Server** (copy `packages/server/env.example` to `.env`):
```
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
```

**Client** (create `.env` in `packages/client`):
```
VITE_API_URL=http://localhost:3001
```

### TypeScript Configuration

Each package has its own `tsconfig.json` optimized for its specific use case:
- **Shared**: CommonJS modules with declaration files
- **Client**: ES modules with React JSX
- **Server**: CommonJS modules with Node.js types

## 📁 Project Structure

```
clear-ai-monorepo/
├── packages/
│   ├── shared/                 # Shared utilities and types
│   │   ├── src/
│   │   │   ├── types.ts        # Common TypeScript types
│   │   │   ├── utils.ts        # Utility functions
│   │   │   ├── constants.ts    # Application constants
│   │   │   └── index.ts        # Main export file
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # API services
│   │   │   ├── styles/         # CSS and styles
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── controllers/    # Route controllers
│       │   ├── middleware/     # Express middleware
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── env.example
│
├── package.json               # Root package.json with workspaces
├── turbo.json                 # Turbo build configuration
├── .eslintrc.js              # ESLint configuration
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Building for Production

1. Build all packages:
```bash
npm run build
```

2. The built files will be in:
   - `packages/shared/dist/` - Shared package
   - `packages/client/dist/` - Client build
   - `packages/server/dist/` - Server build

### Docker (Optional)

You can containerize the applications using Docker. Example Dockerfiles:

**Server:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY packages/server/dist ./dist
COPY packages/server/package.json ./
RUN npm ci --only=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Client:**
```dockerfile
FROM nginx:alpine
COPY packages/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting: `npm run lint && npm run type-check`
4. Build all packages: `npm run build`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
- Client runs on port 3000
- Server runs on port 3001
- Change ports in package.json scripts or environment variables

**TypeScript errors:**
- Run `npm run type-check` to see all type errors
- Ensure all packages are built: `npm run build`

**Dependencies issues:**
- Clean and reinstall: `npm run clean && npm install`
- Check workspace dependencies are properly linked

**Hot reload not working:**
- Restart the development servers
- Check file watchers are not exhausted (especially on Linux)
