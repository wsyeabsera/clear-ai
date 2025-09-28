# MCP API Call Tool

The MCP (Model Context Protocol) API Call Tool provides HTTP API request capabilities for AI agents and workflows.

## Overview

The API Call Tool allows AI agents to make HTTP requests to external APIs, enabling them to fetch data, interact with web services, and integrate with third-party systems.

## Tool Definition

```typescript
interface APICallTool {
  name: 'api_call';
  description: 'Make HTTP API requests to external services';
  parameters: {
    type: 'object';
    properties: {
      url: {
        type: 'string';
        description: 'The URL to make the request to';
        format: 'uri';
      };
      method: {
        type: 'string';
        description: 'HTTP method to use';
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        default: 'GET';
      };
      headers: {
        type: 'object';
        description: 'HTTP headers to include in the request';
        additionalProperties: { type: 'string' };
      };
      params: {
        type: 'object';
        description: 'URL query parameters';
        additionalProperties: { type: 'string' | 'number' | 'boolean' };
      };
      body: {
        type: 'string';
        description: 'Request body (for POST, PUT, PATCH requests)';
      };
      timeout: {
        type: 'number';
        description: 'Request timeout in milliseconds';
        default: 30000;
        minimum: 1000;
        maximum: 300000;
      };
      followRedirects: {
        type: 'boolean';
        description: 'Whether to follow HTTP redirects';
        default: true;
      };
      validateSSL: {
        type: 'boolean';
        description: 'Whether to validate SSL certificates';
        default: true;
      };
    };
    required: ['url'];
  };
}
```

## Usage Examples

### Basic GET Request

```typescript
const result = await executeTool('api_call', {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'GET'
});

console.log(result);
// {
//   "success": true,
//   "data": {
//     "userId": 1,
//     "id": 1,
//     "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
//     "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
//   },
//   "status": 200,
//   "headers": { ... },
//   "executionTime": 245
// }
```

### POST Request with JSON Body

```typescript
const result = await executeTool('api_call', {
  url: 'https://jsonplaceholder.typicode.com/posts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    title: 'New Post',
    body: 'This is the content of the new post',
    userId: 1
  })
});
```

### Request with Query Parameters

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.openweathermap.org/data/2.5/weather',
  method: 'GET',
  params: {
    q: 'London',
    appid: 'your-api-key',
    units: 'metric'
  }
});
```

### Request with Custom Headers

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.github.com/user',
  method: 'GET',
  headers: {
    'Authorization': 'token your-github-token',
    'User-Agent': 'ClearAI/1.0.0',
    'Accept': 'application/vnd.github.v3+json'
  }
});
```

### File Upload (Multipart)

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.example.com/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  body: {
    file: 'base64-encoded-file-content',
    filename: 'document.pdf',
    description: 'Uploaded document'
  }
});
```

## Response Format

### Success Response

```typescript
interface APICallSuccessResponse {
  success: true;
  data: any; // Response body parsed as JSON
  status: number; // HTTP status code
  headers: Record<string, string>; // Response headers
  executionTime: number; // Execution time in milliseconds
  url: string; // Final URL after redirects
  method: string; // HTTP method used
}
```

### Error Response

```typescript
interface APICallErrorResponse {
  success: false;
  error: string; // Error message
  status?: number; // HTTP status code (if available)
  headers?: Record<string, string>; // Response headers (if available)
  executionTime: number; // Execution time in milliseconds
  url: string; // Requested URL
  method: string; // HTTP method used
  details?: {
    code?: string; // Error code
    message?: string; // Detailed error message
    stack?: string; // Stack trace (in development)
  };
}
```

## Error Handling

### Network Errors

```typescript
try {
  const result = await executeTool('api_call', {
    url: 'https://unreachable-api.com/data'
  });
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network error:', error.message);
  } else if (error.code === 'TIMEOUT') {
    console.error('Request timeout:', error.message);
  }
}
```

### HTTP Error Status Codes

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.example.com/protected-resource'
});

if (!result.success) {
  switch (result.status) {
    case 401:
      console.error('Unauthorized - check your API key');
      break;
    case 403:
      console.error('Forbidden - insufficient permissions');
      break;
    case 404:
      console.error('Not found - resource does not exist');
      break;
    case 429:
      console.error('Rate limited - too many requests');
      break;
    case 500:
      console.error('Server error - try again later');
      break;
    default:
      console.error('HTTP error:', result.status);
  }
}
```

## Advanced Configuration

### Custom Timeout

```typescript
const result = await executeTool('api_call', {
  url: 'https://slow-api.com/data',
  timeout: 60000 // 60 seconds
});
```

### Disable SSL Validation (Development Only)

```typescript
const result = await executeTool('api_call', {
  url: 'https://self-signed-cert-api.com/data',
  validateSSL: false // Only for development!
});
```

### Disable Redirect Following

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.example.com/redirect-endpoint',
  followRedirects: false
});
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const result = await executeTool('api_call', {
    url: 'https://api.example.com/data'
  });
  
  if (result.success) {
    console.log('Data:', result.data);
  } else {
    console.error('API Error:', result.error);
  }
} catch (error) {
  console.error('Tool execution failed:', error.message);
}
```

### 2. Use Appropriate Timeouts

```typescript
// For fast APIs
const fastResult = await executeTool('api_call', {
  url: 'https://fast-api.com/data',
  timeout: 5000 // 5 seconds
});

// For slow APIs
const slowResult = await executeTool('api_call', {
  url: 'https://slow-processing-api.com/analyze',
  timeout: 120000 // 2 minutes
});
```

### 3. Include Proper Headers

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.example.com/data',
  headers: {
    'User-Agent': 'ClearAI/1.0.0',
    'Accept': 'application/json',
    'Authorization': 'Bearer your-token'
  }
});
```

### 4. Validate URLs

```typescript
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

if (isValidUrl(userProvidedUrl)) {
  const result = await executeTool('api_call', {
    url: userProvidedUrl
  });
} else {
  console.error('Invalid URL provided');
}
```

## Integration Examples

### Weather API Integration

```typescript
async function getWeather(city: string, apiKey: string) {
  const result = await executeTool('api_call', {
    url: 'https://api.openweathermap.org/data/2.5/weather',
    method: 'GET',
    params: {
      q: city,
      appid: apiKey,
      units: 'metric'
    }
  });

  if (result.success) {
    return {
      city: result.data.name,
      temperature: result.data.main.temp,
      description: result.data.weather[0].description
    };
  } else {
    throw new Error(`Weather API error: ${result.error}`);
  }
}
```

### GitHub API Integration

```typescript
async function getGitHubUser(username: string, token: string) {
  const result = await executeTool('api_call', {
    url: `https://api.github.com/users/${username}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (result.success) {
    return {
      username: result.data.login,
      name: result.data.name,
      email: result.data.email,
      publicRepos: result.data.public_repos
    };
  } else {
    throw new Error(`GitHub API error: ${result.error}`);
  }
}
```

### REST API CRUD Operations

```typescript
// Create
async function createPost(title: string, content: string) {
  return await executeTool('api_call', {
    url: 'https://api.example.com/posts',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
}

// Read
async function getPost(id: string) {
  return await executeTool('api_call', {
    url: `https://api.example.com/posts/${id}`,
    method: 'GET'
  });
}

// Update
async function updatePost(id: string, title: string, content: string) {
  return await executeTool('api_call', {
    url: `https://api.example.com/posts/${id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
}

// Delete
async function deletePost(id: string) {
  return await executeTool('api_call', {
    url: `https://api.example.com/posts/${id}`,
    method: 'DELETE'
  });
}
```

## Security Considerations

1. **Never expose API keys in client-side code**
2. **Use HTTPS for all requests**
3. **Validate and sanitize all inputs**
4. **Implement proper error handling**
5. **Use appropriate timeouts**
6. **Follow rate limiting guidelines**

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the API supports CORS or use a proxy
2. **SSL Certificate Errors**: Check certificate validity in production
3. **Timeout Errors**: Increase timeout for slow APIs
4. **Authentication Errors**: Verify API keys and tokens
5. **Rate Limiting**: Implement exponential backoff for retries

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const result = await executeTool('api_call', {
  url: 'https://api.example.com/data',
  debug: true // Enable detailed logging
});
```
