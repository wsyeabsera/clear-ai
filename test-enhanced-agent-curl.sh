#!/bin/bash

# Test script for Enhanced Agent functionality using curl requests
echo "🧪 Testing Enhanced Agent Service with curl requests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:3001$endpoint")
    else
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            "http://localhost:3001$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Request successful${NC}"
        echo "Response: $response" | jq . 2>/dev/null || echo "Response: $response"
    else
        echo -e "${RED}❌ Request failed${NC}"
    fi
}

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    echo "Attempt $i/30: Server not ready yet..."
    sleep 2
done

# Test 1: Health check
test_endpoint "GET" "/api/health" "" "Health Check"

# Test 2: Enhanced Agent Status
test_endpoint "GET" "/api/agent/enhanced-status" "" "Enhanced Agent Status"

# Test 3: Initialize Enhanced Agent
test_endpoint "POST" "/api/agent/enhanced-initialize" '{
    "memoryConfig": {
        "neo4j": {
            "uri": "bolt://localhost:7687",
            "username": "neo4j",
            "password": "samplepassword",
            "database": "neo4j"
        },
        "pinecone": {
            "apiKey": "",
            "environment": "clear-ai",
            "indexName": "clear-ai-memories"
        }
    },
    "langchainConfig": {
        "openaiApiKey": "",
        "openaiModel": "gpt-3.5-turbo",
        "mistralApiKey": "",
        "mistralModel": "mistral-small",
        "groqApiKey": "",
        "groqModel": "llama-3.1-8b-instant",
        "ollamaModel": "mistral:latest",
        "ollamaBaseUrl": "http://localhost:11434"
    }
}' "Initialize Enhanced Agent"

# Test 4: Execute Enhanced Agent Query (Planning & Execution)
test_endpoint "POST" "/api/agent/enhanced-execute" '{
    "query": "Create a plan to get weather information for London and then search for React repositories on GitHub",
    "options": {
        "userId": "test-user-curl",
        "sessionId": "test-session-curl",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "responseDetailLevel": "full"
    }
}' "Execute Enhanced Agent Query with Planning & Execution"

# Test 5: Execute Enhanced Agent Query (Simple)
test_endpoint "POST" "/api/agent/enhanced-execute" '{
    "query": "Hello, my name is Alice and I am a software developer",
    "options": {
        "userId": "test-user-curl",
        "sessionId": "test-session-curl",
        "includeMemoryContext": true,
        "includeReasoning": false,
        "responseDetailLevel": "standard"
    }
}' "Execute Enhanced Agent Query (Simple Conversation)"

# Test 6: Execute Enhanced Agent Query (Tool Execution)
test_endpoint "POST" "/api/agent/enhanced-execute" '{
    "query": "Get the weather in London using the weather API",
    "options": {
        "userId": "test-user-curl",
        "sessionId": "test-session-curl",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "responseDetailLevel": "full"
    }
}' "Execute Enhanced Agent Query (Tool Execution)"

echo -e "\n${GREEN}🎉 Enhanced Agent testing completed!${NC}"
echo "Check the responses above to verify that:"
echo "1. ✅ Planning system is working (executionPlan in response)"
echo "2. ✅ Execution engine is working (executionResult in response)"
echo "3. ✅ Reasoning engine is working (advancedReasoning in response)"
echo "4. ✅ Memory context is working (memoryContext in response)"
echo "5. ✅ Tool execution is working (toolResults in response)"
