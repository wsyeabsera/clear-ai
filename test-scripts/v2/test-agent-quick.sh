#!/bin/bash

# Clear-AI Agent Quick Testing Script
# Fast validation of core agent functionality

set -e

BASE_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="quick-test-$TIMESTAMP"
SESSION_ID="quick-session-$TIMESTAMP"
TEST_ID="quick-$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Quick test function
quick_test() {
    local description=$1
    local data=$2
    
    print_info "Testing: $description"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL/api/agent/enhanced-execute" 2>/dev/null)
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        success=$(echo "$response" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "$description"
            return 0
        else
            print_error "$description - Failed"
            echo "  Response: $response"
            return 1
        fi
    else
        print_error "$description - Invalid response"
        echo "  Raw response: $response"
        return 1
    fi
}

# Wait for server
wait_for_server() {
    print_header "Checking server status"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
            print_success "Server is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "Server not ready"
    echo "Please start the server with: npm run dev"
    exit 1
}

main() {
    print_header "Clear-AI Agent Quick Test"
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    
    wait_for_server
    
    # Core functionality tests
    print_header "Core Functionality Tests"
    
    quick_test "Basic conversation" '{
        "query": "Hello, how are you?",
        "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false
        }
    }'
    
    quick_test "API call tool" '{
        "query": "Make an API call to https://httpbin.org/get to test connectivity",
        "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false
        }
    }'
    
    quick_test "File reader tool" '{
        "query": "Read the package.json file to see the project dependencies",
        "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false
        }
    }'
    
    quick_test "Memory storage" '{
        "query": "My name is TestUser and I like Python",
        "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": false
        }
    }'
    
    quick_test "Memory retrieval" '{
        "query": "What do you know about me?",
        "options": {
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": false
        }
    }'
    
    print_header "Quick Test Complete"
    echo "✅ Core agent functionality validated"
}

main "$@"
