#!/bin/bash

# Test script for Agent Service
# This script tests the agent service endpoints

echo "🤖 Testing Agent Service"
echo "========================"

# Set the base URL
BASE_URL="http://localhost:3001/api/agent"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make HTTP requests and display results
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    fi
    
    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        success=$(echo "$response" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            echo -e "${GREEN}✅ SUCCESS${NC}"
        else
            echo -e "${RED}❌ FAILED${NC}"
        fi
        echo "Response:"
        echo "$response" | jq .
    else
        echo -e "${RED}❌ INVALID JSON RESPONSE${NC}"
        echo "Raw response: $response"
    fi
}

# Test 1: Initialize Agent Service
echo -e "\n${YELLOW}1. Initializing Agent Service${NC}"
test_endpoint "POST" "/initialize" "" "Initialize Agent Service"

# Test 2: Get Agent Status
echo -e "\n${YELLOW}2. Getting Agent Status${NC}"
test_endpoint "GET" "/status" "" "Get Agent Status"

# Test 3: Simple Conversation Query
echo -e "\n${YELLOW}3. Testing Simple Conversation${NC}"
test_endpoint "POST" "/execute" '{
    "query": "Hello, how are you?",
    "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Simple conversation query"

# Test 4: Memory-based Query
echo -e "\n${YELLOW}4. Testing Memory-based Query${NC}"
test_endpoint "POST" "/execute" '{
    "query": "What did we discuss earlier?",
    "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Memory-based query"

# Test 5: Tool Execution Query
echo -e "\n${YELLOW}5. Testing Tool Execution${NC}"
test_endpoint "POST" "/execute" '{
    "query": "Calculate 15 + 27",
    "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeMemoryContext": false,
        "includeReasoning": true
    }
}' "Tool execution query"

# Test 6: Hybrid Query (Memory + Tools)
echo -e "\n${YELLOW}6. Testing Hybrid Query${NC}"
test_endpoint "POST" "/execute" '{
    "query": "Remember that I like Python programming and then calculate 2 to the power of 8",
    "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Hybrid query (memory + tools)"

# Test 7: Knowledge Search Query
echo -e "\n${YELLOW}7. Testing Knowledge Search${NC}"
test_endpoint "POST" "/execute" '{
    "query": "What do I know about machine learning?",
    "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Knowledge search query"

# Test 8: Run Agent Test Suite
echo -e "\n${YELLOW}8. Running Agent Test Suite${NC}"
test_endpoint "POST" "/test" "" "Run comprehensive agent tests"

# Test 9: Complex Multi-turn Conversation
echo -e "\n${YELLOW}9. Testing Multi-turn Conversation${NC}"

# First turn
echo -e "\n${BLUE}Turn 1:${NC}"
test_endpoint "POST" "/execute" '{
    "query": "My name is Alice and I am a software developer",
    "options": {
        "userId": "test-user-2",
        "sessionId": "test-session-2",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "First turn - introducing self"

# Second turn
echo -e "\n${BLUE}Turn 2:${NC}"
test_endpoint "POST" "/execute" '{
    "query": "What is my profession?",
    "options": {
        "userId": "test-user-2",
        "sessionId": "test-session-2",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Second turn - asking about profession"

# Third turn with tool execution
echo -e "\n${BLUE}Turn 3:${NC}"
test_endpoint "POST" "/execute" '{
    "query": "Based on my profession, help me calculate the compound interest on $10,000 at 5% for 3 years",
    "options": {
        "userId": "test-user-2",
        "sessionId": "test-session-2",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Third turn - hybrid query with memory and tools"

echo -e "\n${GREEN}🎉 Agent Service Testing Complete!${NC}"
echo "=================================="
echo "Check the responses above to verify that:"
echo "1. Agent service initializes correctly"
echo "2. Different intent types are classified properly"
echo "3. Memory context is retrieved and used"
echo "4. Tools are executed when needed"
echo "5. Hybrid queries work with both memory and tools"
echo "6. Multi-turn conversations maintain context"
