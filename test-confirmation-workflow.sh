#!/bin/bash

# Test script for confirmation workflow
# This script tests the "Would you like me to perform this action?" feature

echo "🧪 Testing Confirmation Workflow"
echo "================================="

# Configuration
SERVER_URL="http://localhost:3001"
USER_ID="test-user-$(date +%s)"
SESSION_ID="test-session-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API calls
make_request() {
    local endpoint="$1"
    local data="$2"
    local description="$3"
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    echo "Data: $data"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "x-user-id: $USER_ID" \
        -H "x-session-id: $SESSION_ID" \
        -d "$data" \
        "$SERVER_URL$endpoint")
    
    echo "Response: $response"
    
    # Check if response contains success
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Test 1: Initial query that should trigger confirmation
echo -e "\n${YELLOW}Test 1: Query that should trigger confirmation${NC}"
echo "This should ask for confirmation before executing tools"

make_request "/api/agent/execute" '{
    "query": "Using https://jsonplaceholder.typicode.com/, get all incomplete todos for user ID 5 and mark them as completed",
    "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "API call that should trigger confirmation"

# Test 2: Confirmation response (yes)
echo -e "\n${YELLOW}Test 2: Confirmation response (yes)${NC}"
echo "This should execute the pending action"

make_request "/api/agent/execute" '{
    "query": "yes",
    "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Confirmation response"

# Test 3: Another query that should trigger confirmation
echo -e "\n${YELLOW}Test 3: Another confirmation query${NC}"

make_request "/api/agent/execute" '{
    "query": "Create a new post for user ID 1 with title \"Test Post\" and body \"This is a test\"",
    "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Another API call that should trigger confirmation"

# Test 4: Cancellation response (no)
echo -e "\n${YELLOW}Test 4: Cancellation response (no)${NC}"
echo "This should cancel the pending action"

make_request "/api/agent/execute" '{
    "query": "no",
    "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Cancellation response"

echo -e "\n${YELLOW}Test 5: Simple query that should not trigger confirmation${NC}"

make_request "/api/agent/execute" '{
    "query": "Hello, how are you?",
    "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}' "Simple greeting that should not trigger confirmation"

echo -e "\n${GREEN}Confirmation workflow test completed!${NC}"
echo "Check the responses above to verify:"
echo "1. Tool execution queries should ask for confirmation"
echo "2. 'yes' responses should execute pending actions"
echo "3. 'no' responses should cancel pending actions"
echo "4. Simple queries should not trigger confirmation"
