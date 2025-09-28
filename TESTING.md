# Clear-AI Memory System Testing

This directory contains comprehensive testing scripts for the Clear-AI Memory System API endpoints.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   cd packages/server
   yarn dev
   ```

2. **Run the tests:**
   ```bash
   # Basic API structure validation
   ./test-api-structure.sh
   
   # Comprehensive memory endpoint testing
   ./test-memory-endpoints.sh
   
   # List all available endpoints
   ./list-all-endpoints.sh
   ```

## 📋 Testing Scripts

### `test-api-structure.sh`
- **Purpose:** Validates basic API structure and endpoint registration
- **Use case:** Quick verification that all endpoints are properly configured
- **Output:** Shows which endpoints are working and their response structure
- **Dependencies:** None (tests endpoint availability only)

### `test-memory-endpoints.sh`
- **Purpose:** Comprehensive testing of all memory-related endpoints
- **Use case:** Full validation of memory system functionality
- **Output:** Detailed test results with proper error handling validation
- **Dependencies:** Server running on localhost:3001

### `list-all-endpoints.sh`
- **Purpose:** Documentation of all available API endpoints
- **Use case:** Reference guide with curl examples
- **Output:** Complete list of endpoints with example commands
- **Dependencies:** None

## 🔧 Configuration Requirements

### For Basic API Testing
- ✅ Server running on port 3001
- ✅ No additional dependencies

### For Full Memory Functionality
- ⚠️ **Neo4j Database**
  - Running on `localhost:7687`
  - Username: `neo4j`
  - Password: Configured in `.env` file
  - Database: `neo4j`

- ⚠️ **Pinecone Vector Database**
  - API Key configured in `.env`
  - Environment configured in `.env`
  - Index: `clear-ai-memories`

- ⚠️ **Ollama Embeddings**
  - Running on `localhost:11434`
  - Model: `nomic-embed-text` installed

## 📊 Expected Test Results

### With Neo4j/Pinecone Configured
- ✅ All memory endpoints return 200/201 status codes
- ✅ Data is properly stored and retrieved
- ✅ Search functionality works correctly

### Without Neo4j/Pinecone (Current State)
- ✅ Health endpoint: `200 OK`
- ✅ API documentation: `200 OK`
- ✅ Memory endpoints: `500` (expected - service not configured)
- ✅ Error responses: Proper JSON structure with error messages
- ✅ 404 handling: Proper error responses

## 🛠️ Troubleshooting

### Server Not Starting
```bash
# Check if port is in use
lsof -i :3001

# Kill existing processes
pkill -f "nodemon.*ts-node.*src/index.ts"

# Restart server
cd packages/server && yarn dev
```

### Neo4j Connection Issues
```bash
# Check Neo4j status
curl -u neo4j:password http://localhost:7474/

# Verify credentials in .env file
cat packages/server/.env | grep NEO4J
```

### Pinecone Issues
```bash
# Check Pinecone configuration
cat packages/server/.env | grep PINECONE
```

## 📝 API Endpoints Summary

### Memory Management
- **Episodic Memory:** Store, retrieve, search, update, delete conversation history
- **Semantic Memory:** Store, retrieve, search, update, delete knowledge/concepts
- **Context Management:** Get memory context for users and sessions
- **Statistics:** Memory usage statistics and analytics

### Chat Integration
- **Initialize:** Set up memory service for chat
- **Chat:** Memory-aware conversations
- **History:** Retrieve conversation history
- **Knowledge Storage:** Store learned concepts during chat

### Utility Functions
- **Search:** Cross-memory type searching
- **Relationships:** Memory relationship management
- **Cleanup:** User memory management

## 🎯 Testing Strategy

1. **Structure Validation:** Ensure all endpoints are registered
2. **Error Handling:** Verify proper error responses
3. **Data Validation:** Test request/response formats
4. **Integration Testing:** Full workflow testing (when dependencies available)
5. **Documentation:** Keep endpoint documentation updated

## 📚 Additional Resources

- **API Documentation:** http://localhost:3001/api-docs/
- **Health Check:** http://localhost:3001/api/health
- **Server Logs:** Check terminal output for detailed error messages
- **Environment Configuration:** `packages/server/.env`

## 🔄 Continuous Testing

Run tests after any changes to:
- API routes
- Controllers
- Memory services
- Server configuration

```bash
# Quick validation after changes
./test-api-structure.sh

# Full testing
./test-memory-endpoints.sh
```
