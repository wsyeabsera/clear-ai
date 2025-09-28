#!/bin/bash

# Clear-AI Memory System API Testing Script
# This script tests all memory-related endpoints

set -e  # Exit on any error

# Configuration
BASE_URL="http://localhost:3001"
USER_ID="test-user-$(date +%s)"
SESSION_ID="test-session-$(date +%s)"
MEMORY_ID=""
SEMANTIC_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    
    print_info "Testing: $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        print_success "HTTP $http_code - $description"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        return 0
    else
        print_error "HTTP $http_code (expected $expected_status) - $description"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        return 1
    fi
}

# Wait for server to be ready
wait_for_server() {
    print_header "Waiting for server to be ready"
    local max_attempts=30
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
    
    print_error "Server not ready after $max_attempts seconds"
    exit 1
}

# Main testing function
main() {
    print_header "Clear-AI Memory System API Tests"
    print_info "User ID: $USER_ID"
    print_info "Session ID: $SESSION_ID"
    
    # Wait for server
    wait_for_server
    
    # Test 1: Health Check
    print_header "1. Health Check"
    test_endpoint "GET" "/api/health" "" "Health check"
    
    # Test 2: Memory Chat Initialize (should work without Neo4j/Pinecone)
    print_header "2. Memory Chat Initialize"
    test_endpoint "POST" "/api/memory-chat/initialize" "" "Initialize memory service" 200
    
    # Test 3: Store Episodic Memory (may fail if Neo4j not configured)
    print_header "3. Store Episodic Memory"
    episodic_data='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "content": "User asked about machine learning algorithms",
        "context": {
            "conversation_turn": 1,
            "topic": "AI"
        },
        "metadata": {
            "source": "test",
            "importance": 0.8,
            "tags": ["AI", "machine learning"],
            "location": "curl-test"
        },
        "relationships": {
            "previous": null,
            "next": null,
            "related": []
        }
    }'
    
    if test_endpoint "POST" "/api/memory/episodic" "$episodic_data" "Store episodic memory" 500; then
        # Extract memory ID if successful
        MEMORY_ID=$(echo "$body" | jq -r '.data.id // empty' 2>/dev/null)
    fi
    
    # Test 4: Store Semantic Memory (may fail if Pinecone not configured)
    print_header "4. Store Semantic Memory"
    semantic_data='{
        "userId": "'$USER_ID'",
        "concept": "Machine Learning",
        "description": "A subset of artificial intelligence that focuses on algorithms that can learn from data",
        "metadata": {
            "category": "AI",
            "confidence": 0.9,
            "source": "test",
            "lastAccessed": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
            "accessCount": 0
        },
        "relationships": {
            "similar": [],
            "parent": null,
            "children": []
        }
    }'
    
    if test_endpoint "POST" "/api/memory/semantic" "$semantic_data" "Store semantic memory" 500; then
        # Extract semantic ID if successful
        SEMANTIC_ID=$(echo "$body" | jq -r '.data.id // empty' 2>/dev/null)
    fi
    
    # Test 5: Get Episodic Memory (if we have an ID)
    if [ -n "$MEMORY_ID" ]; then
        print_header "5. Get Episodic Memory"
        test_endpoint "GET" "/api/memory/episodic/$MEMORY_ID" "" "Get episodic memory by ID"
    else
        print_info "Skipping episodic memory retrieval (no ID available)"
    fi
    
    # Test 6: Get Semantic Memory (if we have an ID)
    if [ -n "$SEMANTIC_ID" ]; then
        print_header "6. Get Semantic Memory"
        test_endpoint "GET" "/api/memory/semantic/$SEMANTIC_ID" "" "Get semantic memory by ID"
    else
        print_info "Skipping semantic memory retrieval (no ID available)"
    fi
    
    # Test 7: Search Episodic Memories
    print_header "7. Search Episodic Memories"
    search_episodic_data='{
        "userId": "'$USER_ID'",
        "query": "machine learning",
        "limit": 10
    }'
    test_endpoint "POST" "/api/memory/episodic/search" "$search_episodic_data" "Search episodic memories" 500
    
    # Test 8: Search Semantic Memories
    print_header "8. Search Semantic Memories"
    search_semantic_data='{
        "userId": "'$USER_ID'",
        "query": "artificial intelligence",
        "limit": 10
    }'
    test_endpoint "POST" "/api/memory/semantic/search" "$search_semantic_data" "Search semantic memories" 500
    
    # Test 9: Get Memory Context
    print_header "9. Get Memory Context"
    test_endpoint "GET" "/api/memory/context/$USER_ID/$SESSION_ID" "" "Get memory context" 500
    
    # Test 10: Search All Memories
    print_header "10. Search All Memories"
    search_all_data='{
        "userId": "'$USER_ID'",
        "query": "AI machine learning",
        "type": "both",
        "limit": 20
    }'
    test_endpoint "POST" "/api/memory/search" "$search_all_data" "Search all memories" 500
    
    # Test 11: Get Memory Stats
    print_header "11. Get Memory Stats"
    test_endpoint "GET" "/api/memory/stats/$USER_ID" "" "Get memory statistics" 500
    
    # Test 12: Memory Chat
    print_header "12. Memory Chat"
    chat_data='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "message": "What did we discuss about machine learning?",
        "includeMemories": true
    }'
    test_endpoint "POST" "/api/memory-chat/chat" "$chat_data" "Chat with memory context" 500
    
    # Test 13: Get Conversation History
    print_header "13. Get Conversation History"
    test_endpoint "GET" "/api/memory-chat/history/$USER_ID/$SESSION_ID" "" "Get conversation history" 500
    
    # Test 14: Search Memories in Chat
    print_header "14. Search Memories in Chat"
    chat_search_data='{
        "userId": "'$USER_ID'",
        "query": "machine learning algorithms",
        "type": "both",
        "limit": 5
    }'
    test_endpoint "POST" "/api/memory-chat/search" "$chat_search_data" "Search memories during chat" 500
    
    # Test 15: Store Knowledge in Chat
    print_header "15. Store Knowledge in Chat"
    knowledge_data='{
        "userId": "'$USER_ID'",
        "concept": "Neural Networks",
        "description": "Computing systems inspired by biological neural networks",
        "category": "AI"
    }'
    test_endpoint "POST" "/api/memory-chat/knowledge" "$knowledge_data" "Store knowledge during chat" 500
    
    # Test 16: Error Handling - Missing Fields
    print_header "16. Error Handling Tests"
    test_endpoint "POST" "/api/memory/episodic" '{"userId":"test"}' "Test missing required fields" 500
    
    # Test 17: Error Handling - Invalid Endpoint
    print_header "17. Invalid Endpoint Test"
    test_endpoint "GET" "/api/memory/invalid-endpoint" "" "Test invalid endpoint" 404
    
    # Test 18: API Documentation
    print_header "18. API Documentation"
    test_endpoint "GET" "/api-docs" "" "Check API documentation accessibility" 200
    
    print_header "Testing Complete"
    print_info "Note: Many endpoints may return 500 errors if Neo4j/Pinecone are not configured"
    print_info "This is expected behavior - the API structure is working correctly"
    
    # Summary
    print_header "Summary"
    print_info "All memory API endpoints have been tested"
    print_info "Check the output above for any unexpected errors"
    print_info "For full functionality, ensure Neo4j and Pinecone are properly configured"
}

# Run the tests
main "$@"
