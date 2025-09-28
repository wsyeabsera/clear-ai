# Health APIs

The Health APIs provide system health monitoring and status information for the Clear AI server.

## Endpoints

### GET /api/health

Check the overall system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 3600,
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "llm": "healthy",
      "tools": "healthy"
    }
  },
  "message": "System is healthy"
}
```

### GET /api/health/detailed

Get detailed health information for all system components.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 3600,
    "version": "1.0.0",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 5,
        "lastCheck": "2024-01-15T10:29:55Z"
      },
      "llm": {
        "status": "healthy",
        "providers": ["openai", "groq"],
        "lastCheck": "2024-01-15T10:29:50Z"
      },
      "tools": {
        "status": "healthy",
        "registeredTools": 15,
        "lastCheck": "2024-01-15T10:29:45Z"
      }
    },
    "metrics": {
      "memoryUsage": "45%",
      "cpuUsage": "12%",
      "activeConnections": 5
    }
  },
  "message": "Detailed health check completed"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | System is healthy |
| 503 | System is unhealthy |

## Error Responses

### Service Unavailable
```json
{
  "success": false,
  "message": "System is unhealthy",
  "error": "Database connection failed",
  "details": {
    "status": "unhealthy",
    "failedServices": ["database"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Usage Examples

### Basic Health Check
```bash
curl http://localhost:3001/api/health
```

### Detailed Health Check
```bash
curl http://localhost:3001/api/health/detailed
```

### JavaScript/TypeScript
```typescript
import { ClearAIClient } from 'clear-ai';

const client = new ClearAIClient({
  baseURL: 'http://localhost:3001'
});

// Basic health check
const health = await client.health.check();

// Detailed health check
const detailedHealth = await client.health.detailed();
```

## Monitoring Integration

These endpoints are designed to work with monitoring systems like:
- Prometheus
- Grafana
- DataDog
- New Relic

The health endpoints return standard HTTP status codes and JSON responses that can be easily integrated into monitoring dashboards.
