# Building Your First Tool

This tutorial will walk you through creating your first custom tool for the Clear AI system. We'll build a simple "weather" tool that fetches weather information from an API and integrates it with the MCP system.

## What You'll Learn

By the end of this tutorial, you'll know how to:
- Create a new MCP tool with proper schema validation
- Integrate external APIs
- Handle errors gracefully
- Test your tool
- Deploy it to the system

## Prerequisites

- Clear AI running locally (see [Quick Start Guide](/docs/getting-started/quick-start))
- Basic understanding of TypeScript
- Familiarity with HTTP APIs

## Step 1: Understanding Tool Structure

Let's first understand how tools work in Clear AI:

```typescript
// Tool interface
interface ZodTool {
  name: string;                    // Unique tool name
  description: string;             // Tool description for LLM
  inputSchema: z.ZodSchema;        // Input validation schema
  outputSchema?: z.ZodSchema;      // Output validation schema
  execute: (args: any) => Promise<any>; // Tool implementation
}
```

## Step 2: Create the Weather Tool

Let's create a new weather tool. First, create the file:

```bash
# Navigate to MCP basic package
cd packages/mcp-basic/src/tools

# Create the weather tool file
touch weather.ts
```

Now let's implement the weather tool:

```typescript
// packages/mcp-basic/src/tools/weather.ts
import { z } from 'zod';
import axios from 'axios';
import { ZodTool } from '../types';

// Input schema for the weather tool
const WeatherSchema = z.object({
  city: z.string().min(1, 'City name is required'),
  country: z.string().optional(),
  units: z.enum(['metric', 'imperial']).default('metric'),
  apiKey: z.string().optional().describe('OpenWeatherMap API key'),
});

// Output schema for the weather tool
const WeatherOutputSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.number(),
  description: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  units: z.string(),
  timestamp: z.string(),
});

// Weather tool implementation
export const weatherTool: ZodTool = {
  name: 'weather',
  description: 'Get current weather information for a city',
  inputSchema: WeatherSchema,
  outputSchema: WeatherOutputSchema,
  
  execute: async (args) => {
    const { city, country, units, apiKey } = WeatherSchema.parse(args);
    
    // Use provided API key or fallback to demo key
    const apiKeyToUse = apiKey || 'demo-key';
    
    try {
      // Build the API URL
      const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
      const params = new URLSearchParams({
        q: country ? `${city},${country}` : city,
        units: units,
        appid: apiKeyToUse,
      });
      
      const url = `${baseUrl}?${params}`;
      
      // Make the API call
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Clear-AI-Weather-Tool/1.0',
        },
      });
      
      // Extract weather data
      const weatherData = response.data;
      
      // Return formatted response
      return {
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        units: units === 'metric' ? '°C' : '°F',
        timestamp: new Date().toISOString(),
      };
      
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown API error';
        
        if (status === 401) {
          throw new Error('Invalid API key. Please provide a valid OpenWeatherMap API key.');
        } else if (status === 404) {
          throw new Error(`City "${city}" not found. Please check the city name and try again.`);
        } else if (status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Weather API error: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  },
};
```

## Step 3: Register the Tool

Now we need to register our new tool in the tool registry:

```typescript
// packages/mcp-basic/src/tool-registry.ts
import { ToolRegistry } from './tool-registry';
import { apiCallTool, jsonReaderTool, fileReaderTool, executeParallelTool } from './tools';
import { weatherTool } from './tools/weather'; // Add this import

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // Register default tools
    this.registerTool(apiCallTool);
    this.registerTool(jsonReaderTool);
    this.registerTool(fileReaderTool);
    this.registerTool(executeParallelTool);
    this.registerTool(weatherTool); // Add this line
  }

  // ... rest of the class remains the same
}
```

## Step 4: Export the Tool

Make sure to export the tool from the tools index file:

```typescript
// packages/mcp-basic/src/tools/index.ts
export { apiCallTool } from './api-call';
export { jsonReaderTool } from './json-reader';
export { fileReaderTool } from './file-reader';
export { executeParallelTool } from './execute-parallel';
export { weatherTool } from './weather'; // Add this line
```

## Step 5: Build and Test

Now let's build the package and test our new tool:

```bash
# Build the MCP basic package
cd packages/mcp-basic
npm run build

# Start the MCP server
npm start
```

## Step 6: Test the Tool

### Test 1: Basic Functionality

```bash
# Test the weather tool
curl -X POST http://localhost:3001/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "weather",
    "arguments": {
      "city": "London",
      "country": "UK",
      "units": "metric"
    }
  }'
```

### Test 2: Error Handling

```bash
# Test with invalid city
curl -X POST http://localhost:3001/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "weather",
    "arguments": {
      "city": "InvalidCityName12345"
    }
  }'
```

### Test 3: Using the Client

1. Go to http://localhost:3000
2. Navigate to "Tool Execute"
3. Select "weather" from the dropdown
4. Fill in the parameters:
   - City: "New York"
   - Country: "US"
   - Units: "metric"
5. Click "Execute Tool"

## Step 7: Add API Key Support

For production use, you'll want to add proper API key support. Let's update the tool to use environment variables:

```typescript
// packages/mcp-basic/src/tools/weather.ts
export const weatherTool: ZodTool = {
  name: 'weather',
  description: 'Get current weather information for a city',
  inputSchema: WeatherSchema,
  outputSchema: WeatherOutputSchema,
  
  execute: async (args) => {
    const { city, country, units, apiKey } = WeatherSchema.parse(args);
    
    // Use provided API key, environment variable, or demo key
    const apiKeyToUse = apiKey || 
                       process.env.OPENWEATHERMAP_API_KEY || 
                       'demo-key';
    
    // ... rest of the implementation
  },
};
```

## Step 8: Add Configuration

Create a configuration file for the weather tool:

```typescript
// packages/mcp-basic/src/config/weather.ts
export const WEATHER_CONFIG = {
  API_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
  DEFAULT_UNITS: 'metric',
  TIMEOUT: 10000,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_DAY: 1000,
  },
} as const;
```

## Step 9: Add Caching

Let's add simple caching to avoid hitting the API too frequently:

```typescript
// packages/mcp-basic/src/tools/weather.ts
import { WEATHER_CONFIG } from '../config/weather';

// Simple in-memory cache
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const weatherTool: ZodTool = {
  // ... existing code
  
  execute: async (args) => {
    const { city, country, units, apiKey } = WeatherSchema.parse(args);
    
    // Create cache key
    const cacheKey = `${city}-${country || 'default'}-${units}`;
    
    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // ... existing API call code ...
    
    // Cache the result
    weatherCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });
    
    return result;
  },
};
```

## Step 10: Add Unit Tests

Create tests for your weather tool:

```typescript
// packages/mcp-basic/src/tools/__tests__/weather.test.ts
import { weatherTool } from '../weather';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Weather Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch weather data successfully', async () => {
    // Mock API response
    const mockResponse = {
      data: {
        name: 'London',
        sys: { country: 'GB' },
        main: { temp: 15, humidity: 70 },
        weather: [{ description: 'clear sky' }],
        wind: { speed: 5 },
      },
    };
    
    mockedAxios.get.mockResolvedValue(mockResponse);
    
    // Execute tool
    const result = await weatherTool.execute({
      city: 'London',
      country: 'UK',
      units: 'metric',
    });
    
    // Verify result
    expect(result).toEqual({
      city: 'London',
      country: 'GB',
      temperature: 15,
      description: 'clear sky',
      humidity: 70,
      windSpeed: 5,
      units: '°C',
      timestamp: expect.any(String),
    });
    
    // Verify API call
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('api.openweathermap.org'),
      expect.objectContaining({
        timeout: 10000,
        headers: expect.any(Object),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const mockError = {
      response: {
        status: 404,
        data: { message: 'city not found' },
      },
    };
    
    mockedAxios.get.mockRejectedValue(mockError);
    
    // Execute tool and expect error
    await expect(weatherTool.execute({
      city: 'InvalidCity',
      units: 'metric',
    })).rejects.toThrow('City "InvalidCity" not found');
  });

  it('should validate input parameters', async () => {
    // Test missing required parameter
    await expect(weatherTool.execute({
      units: 'metric',
    })).rejects.toThrow('City name is required');
    
    // Test invalid units
    await expect(weatherTool.execute({
      city: 'London',
      units: 'invalid',
    })).rejects.toThrow();
  });
});
```

## Step 11: Run Tests

```bash
# Run the tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Step 12: Document Your Tool

Add documentation for your tool:

```typescript
// packages/mcp-basic/src/tools/weather.ts
/**
 * Weather Tool
 * 
 * Fetches current weather information for a given city using the OpenWeatherMap API.
 * 
 * @example
 * // Get weather for London
 * {
 *   "toolName": "weather",
 *   "arguments": {
 *     "city": "London",
 *     "country": "UK",
 *     "units": "metric"
 *   }
 * }
 * 
 * @example
 * // Get weather for New York in Fahrenheit
 * {
 *   "toolName": "weather",
 *   "arguments": {
 *     "city": "New York",
 *     "country": "US",
 *     "units": "imperial"
 *   }
 * }
 */
export const weatherTool: ZodTool = {
  // ... implementation
};
```

## Step 13: Deploy to Production

When you're ready to deploy:

1. **Build the package**:
   ```bash
   npm run build
   ```

2. **Set environment variables**:
   ```bash
   export OPENWEATHERMAP_API_KEY=your_actual_api_key
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## Advanced Features

### Rate Limiting

Add rate limiting to prevent API abuse:

```typescript
// packages/mcp-basic/src/tools/weather.ts
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter(60, 'minute'); // 60 requests per minute

export const weatherTool: ZodTool = {
  // ... existing code
  
  execute: async (args) => {
    // Check rate limit
    const hasTokens = await limiter.tryRemoveTokens(1);
    if (!hasTokens) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // ... rest of implementation
  },
};
```

### Retry Logic

Add retry logic for failed requests:

```typescript
// packages/mcp-basic/src/tools/weather.ts
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

export const weatherTool: ZodTool = {
  // ... existing code
  
  execute: async (args) => {
    // ... validation code ...
    
    return await retryWithBackoff(async () => {
      const response = await axios.get(url, config);
      return processWeatherData(response.data);
    });
  },
};
```

## Troubleshooting

### Common Issues

**Tool Not Found**
- Make sure the tool is registered in the ToolRegistry
- Check that the tool is exported from the tools index file
- Restart the MCP server after making changes

**API Key Issues**
- Verify your API key is valid
- Check that the API key has the correct permissions
- Ensure the API key is set in the environment variables

**Validation Errors**
- Check that your input schema matches the expected format
- Verify that required fields are provided
- Ensure data types match the schema

**Network Errors**
- Check your internet connection
- Verify the API endpoint is accessible
- Check for firewall or proxy issues

## Next Steps

Now that you've built your first tool:

1. **Explore More Tools**: Check out the available MCP tools
2. **Learn Workflows**: Understand how to use tools in [LangGraph workflows](/docs/tutorials/creating-workflows)
3. **Build Complex Tools**: Create more sophisticated tools with multiple parameters
4. **Add Monitoring**: Implement logging and metrics for your tools
5. **Share Your Tools**: Contribute your tools back to the project

## Resources

- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [Zod Schema Validation](https://zod.dev/)
- [Axios HTTP Client](https://axios-http.com/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

Happy tool building! 🚀
