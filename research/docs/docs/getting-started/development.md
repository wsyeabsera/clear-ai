# Development Guide

This guide will help you understand how to develop with Clear AI, including the development workflow, coding standards, testing practices, and how to contribute to the project.

## Development Workflow

### 1. Setting Up Your Development Environment

```bash
# Clone and install
git clone https://github.com/clear-ai/clear-ai.git
cd clear-ai
npm install

# Build shared package first
npm run build --workspace=@clear-ai/shared

# Start development servers
npm run dev
```

### 2. Understanding the Monorepo Structure

Clear AI uses npm workspaces to manage multiple packages:

```
clear-ai/
├── packages/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   ├── mcp-basic/       # MCP server
│   └── shared/          # Shared code
├── package.json         # Root package.json
└── turbo.json          # Build configuration
```

### 3. Package Dependencies

Packages depend on each other in this order:
- **shared** → No dependencies on other packages
- **mcp-basic** → Depends on shared
- **server** → Depends on shared and mcp-basic
- **client** → Depends on shared

## Development Commands

### Root Level Commands

```bash
# Start all packages in development mode
npm run dev

# Build all packages
npm run build

# Run tests for all packages
npm test

# Run linting for all packages
npm run lint

# Run type checking for all packages
npm run type-check

# Clean all build artifacts
npm run clean
```

### Package-Specific Commands

```bash
# Work with a specific package
cd packages/client

# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Coding Standards

### TypeScript Guidelines

#### Type Safety
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime validation
- Avoid `any` type unless absolutely necessary

```typescript
// Good: Type-safe interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Bad: Using any
function processUser(user: any) {
  return user.name;
}

// Good: Type-safe function
function processUser(user: User): string {
  return user.name;
}
```

#### Import/Export Patterns
- Use named exports for utilities and types
- Use default exports for React components
- Group imports logically

```typescript
// Good: Grouped imports
import React, { useState, useEffect } from 'react';
import { Button, Card } from './components';
import { User, ApiResponse } from '@clear-ai/shared';
import { userService } from './services';
```

#### Error Handling
- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately

```typescript
// Good: Proper error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await userService.getUser(id);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', { userId: id, error: error.message });
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
```

### React Guidelines

#### Component Structure
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props

```typescript
// Good: Well-structured component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### State Management
- Use useState for local state
- Use useReducer for complex state
- Lift state up when needed

```typescript
// Good: State management
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await userService.getUsers();
    setUsers(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### API Development Guidelines

#### Endpoint Design
- Use RESTful conventions
- Provide consistent response format
- Include proper HTTP status codes
- Document all endpoints

```typescript
// Good: RESTful endpoint
app.get('/api/users', async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});
```

#### Validation
- Validate all inputs
- Use Zod schemas for validation
- Provide clear error messages

```typescript
// Good: Input validation
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user')
});

app.post('/api/users', validateRequest(CreateUserSchema), async (req, res) => {
  // Implementation
});
```

## Testing Practices

### Unit Testing

#### Test Structure
- Use describe blocks for grouping tests
- Use descriptive test names
- Test both success and error cases

```typescript
// Good: Well-structured test
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, name: 'John Doe' };
      userService.getUser = jest.fn().mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUser(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(userService.getUser).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      userService.getUser = jest.fn().mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await expect(userService.getUser(userId)).rejects.toThrow('User not found');
    });
  });
});
```

#### Mocking
- Mock external dependencies
- Use jest.fn() for function mocks
- Use jest.mock() for module mocks

```typescript
// Good: Proper mocking
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  mockedAxios.get.mockClear();
});

it('should fetch data from API', async () => {
  // Arrange
  const mockData = { id: 1, name: 'Test' };
  mockedAxios.get.mockResolvedValue({ data: mockData });

  // Act
  const result = await apiService.fetchData();

  // Assert
  expect(result).toEqual(mockData);
  expect(mockedAxios.get).toHaveBeenCalledWith('/api/data');
});
```

### Integration Testing

#### API Testing
- Test complete request/response cycles
- Test error handling
- Test authentication and authorization

```typescript
// Good: API integration test
describe('POST /api/users', () => {
  it('should create user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(userData.name);
  });

  it('should return validation error for invalid data', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email'
    };

    const response = await request(app)
      .post('/api/users')
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('validation');
  });
});
```

### Component Testing

#### React Component Testing
- Test component rendering
- Test user interactions
- Test props and state changes

```typescript
// Good: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

## Debugging

### Client-Side Debugging

#### Browser DevTools
- Use React DevTools extension
- Use browser console for logging
- Use Network tab for API calls

```typescript
// Good: Debug logging
const fetchUsers = async () => {
  console.log('Fetching users...');
  
  try {
    const users = await userService.getUsers();
    console.log('Users fetched:', users);
    setUsers(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    setError(error.message);
  }
};
```

#### React DevTools
- Install React DevTools browser extension
- Use Components tab to inspect component tree
- Use Profiler tab to analyze performance

### Server-Side Debugging

#### Logging
- Use structured logging
- Log important events and errors
- Use different log levels

```typescript
// Good: Structured logging
logger.info('User created', { 
  userId: user.id, 
  email: user.email,
  role: user.role 
});

logger.error('Database connection failed', { 
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

#### Debugging Tools
- Use Node.js debugger
- Use console.log for quick debugging
- Use request logging middleware

```typescript
// Good: Request logging
app.use((req, res, next) => {
  logger.debug('Request received', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});
```

## Performance Optimization

### Client-Side Optimization

#### React Optimization
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers

```typescript
// Good: Optimized component
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
});
```

#### Bundle Optimization
- Use code splitting
- Lazy load routes
- Optimize images and assets

```typescript
// Good: Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
};
```

### Server-Side Optimization

#### Database Optimization
- Use connection pooling
- Optimize queries
- Use caching

```typescript
// Good: Database optimization
const getUsers = async (): Promise<User[]> => {
  // Use connection pooling
  const client = await pool.connect();
  
  try {
    // Optimized query
    const result = await client.query(
      'SELECT id, name, email, role FROM users WHERE active = $1',
      [true]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
};
```

#### Caching
- Cache frequently accessed data
- Use Redis for distributed caching
- Implement cache invalidation

```typescript
// Good: Caching implementation
const getCachedUser = async (id: string): Promise<User | null> => {
  const cacheKey = `user:${id}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await userService.getUser(id);
  if (user) {
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(user));
  }
  
  return user;
};
```

## Code Review Process

### Before Submitting a PR

1. **Run Tests**: Ensure all tests pass
2. **Run Linting**: Fix any linting errors
3. **Type Check**: Ensure TypeScript compiles without errors
4. **Build**: Ensure all packages build successfully
5. **Test Manually**: Test your changes in the browser

```bash
# Pre-submission checklist
npm run test
npm run lint
npm run type-check
npm run build
```

### PR Guidelines

#### PR Description
- Describe what the PR does
- Explain why the changes are needed
- Include screenshots for UI changes
- Reference related issues

#### Code Quality
- Follow coding standards
- Include tests for new features
- Update documentation if needed
- Keep PRs small and focused

#### Review Process
- Request reviews from team members
- Address feedback promptly
- Update PR based on comments
- Ensure CI passes

## Common Patterns

### Error Handling Pattern

```typescript
// Good: Consistent error handling
const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    logger.error(errorMessage, { error: error.message });
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};
```

### Data Fetching Pattern

```typescript
// Good: Data fetching with loading states
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};
```

### Form Handling Pattern

```typescript
// Good: Form handling with validation
const useForm = <T>(initialValues: T, validationSchema: ZodSchema) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const validate = () => {
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  return { values, errors, setValue, validate };
};
```

## Next Steps

Now that you understand the development process:

1. **Start Coding**: Pick an issue or feature to work on
2. **Follow Standards**: Use the coding guidelines and patterns
3. **Write Tests**: Ensure your code is well-tested
4. **Submit PRs**: Contribute back to the project
5. **Learn More**: Explore advanced topics in the documentation

Happy coding! 🚀
