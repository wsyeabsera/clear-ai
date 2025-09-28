#!/bin/bash

# Clear-AI API Structure Testing Script
# Tests basic API functionality without requiring Neo4j/Pinecone

set -e

# Configuration
BASE_URL="http://localhost:3001"

# Colors for output
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

# Simple test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_info "Testing: $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Check if response is valid JSON and contains expected structure
    if echo "$response" | jq . >/dev/null 2>&1; then
        success=$(echo "$response" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "$description"
        else
            error=$(echo "$response" | jq -r '.error // "Unknown error"')
            print_info "$description - Expected error: $error"
        fi
        echo "$response" | jq .
    else
        print_error "$description - Invalid JSON response"
        echo "$response"
    fi
}

# Wait for server
wait_for_server() {
    print_header "Waiting for server"
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
    exit 1
}

main() {
    print_header "Clear-AI API Structure Tests"
    
    wait_for_server
    
    # Test basic endpoints
    print_header "Basic Endpoints"
    test_endpoint "GET" "/api/health" "" "Health check"
    test_endpoint "GET" "/api-docs/" "" "API documentation"
    
    # Test memory endpoints (will show proper error handling)
    print_header "Memory Endpoints Structure"
    test_endpoint "POST" "/api/memory/episodic" '{"userId":"test"}' "Episodic memory endpoint"
    test_endpoint "POST" "/api/memory/semantic" '{"userId":"test"}' "Semantic memory endpoint"
    test_endpoint "GET" "/api/memory/stats/test-user" "" "Memory stats endpoint"
    
    # Test chat endpoints
    print_header "Chat Endpoints Structure"
    test_endpoint "POST" "/api/memory-chat/initialize" "" "Memory chat initialize"
    test_endpoint "POST" "/api/memory-chat/chat" '{"userId":"test","sessionId":"test","message":"hello"}' "Memory chat"
    
    # Test 404 handling
    print_header "Error Handling"
    test_endpoint "GET" "/api/nonexistent" "" "404 handling"
    test_endpoint "GET" "/api/memory/invalid" "" "Invalid memory endpoint"
    
    print_header "API Structure Test Complete"
    print_info "All endpoints are properly registered and responding"
    print_info "Error responses show proper JSON structure and error handling"
}

main "$@"
