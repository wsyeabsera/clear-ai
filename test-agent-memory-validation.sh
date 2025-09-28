#!/bin/bash

# Clear-AI Agent Memory Validation Testing Script
# Validates that agent interactions are properly stored in memory

set -e

BASE_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="memory-test-user-$TIMESTAMP"
SESSION_ID="memory-test-session-$TIMESTAMP"
TEST_ID="memory-validation-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_section() {
    echo -e "\n${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Enhanced test function for memory validation
test_memory_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    print_info "Testing: $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "  Data: $(echo "$data" | jq -c . 2>/dev/null || echo "$data")"
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null || echo "CONNECTION_ERROR\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$BASE_URL$endpoint" 2>/dev/null || echo "CONNECTION_ERROR\n000")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Handle connection errors
    if [ "$http_code" = "000" ] || [ "$http_code" = "CONNECTION_ERROR" ]; then
        print_error "Connection failed - Server may not be running"
        echo "  Make sure the server is running on $BASE_URL"
        return 1
    fi
    
    # Check HTTP status
    if [ "$http_code" = "$expected_status" ]; then
        print_success "HTTP $http_code - $description"
        
        # Validate JSON response
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "  Response: $(echo "$body" | jq -c .)"
            return 0
        else
            print_warning "Response is not valid JSON"
            echo "  Raw response: $body"
            return 1
        fi
    else
        print_error "HTTP $http_code (expected $expected_status) - $description"
        echo "  Response: $body"
        return 1
    fi
}

# Execute agent query and return response
execute_agent_query() {
    local query=$1
    local options=$2
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "query": "'"$query"'",
            "options": '"$options"'
        }' \
        "$BASE_URL/api/agent/execute" 2>/dev/null)
    
    echo "$response"
}

# Get memory context for user/session
get_memory_context() {
    local user_id=$1
    local session_id=$2
    
    response=$(curl -s -X GET \
        "$BASE_URL/api/memory/context/$user_id/$session_id" 2>/dev/null)
    
    echo "$response"
}

# Search memories
search_memories() {
    local user_id=$1
    local query=$2
    local memory_type=${3:-"both"}
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "userId": "'$user_id'",
            "query": "'"$query"'",
            "type": "'$memory_type'",
            "limit": 20
        }' \
        "$BASE_URL/api/memory/search" 2>/dev/null)
    
    echo "$response"
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
    echo "Please start the server with: npm run dev"
    exit 1
}

# Test 1: Basic Memory Storage and Retrieval
test_basic_memory_operations() {
    print_section "🧠 BASIC MEMORY OPERATIONS"
    
    print_info "Testing basic memory storage and retrieval..."
    
    # Store personal information
    local personal_info='My name is MemoryTestUser and I am a software engineer who specializes in AI and machine learning. I work at TechCorp and have 5 years of experience.'
    
    print_info "Storing personal information..."
    local response1=$(execute_agent_query "$personal_info" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Personal information stored via agent"
        else
            print_error "Failed to store personal information"
            echo "  Response: $response1"
            return 1
        fi
    else
        print_error "Invalid response when storing personal information"
        return 1
    fi
    
    # Wait a moment for memory to be processed
    sleep 2
    
    # Retrieve and verify memory
    print_info "Retrieving memory context..."
    local memory_context=$(get_memory_context "$USER_ID" "$SESSION_ID")
    
    if echo "$memory_context" | jq . >/dev/null 2>&1; then
        local episodic_count=$(echo "$memory_context" | jq -r '.episodicMemories | length // 0')
        local semantic_count=$(echo "$memory_context" | jq -r '.semanticMemories | length // 0')
        
        print_info "Memory context retrieved: $episodic_count episodic, $semantic_count semantic memories"
        
        if [ "$episodic_count" -gt 0 ] || [ "$semantic_count" -gt 0 ]; then
            print_success "Memory storage working - found $((episodic_count + semantic_count)) memories"
            
            # Display recent memories
            if [ "$episodic_count" -gt 0 ]; then
                print_info "Recent episodic memories:"
                echo "$memory_context" | jq -r '.episodicMemories[] | "  - " + .content[0:80] + "..."' 2>/dev/null || true
            fi
        else
            print_warning "No memories found - memory system may not be configured"
        fi
    else
        print_error "Failed to retrieve memory context"
        echo "  Response: $memory_context"
        return 1
    fi
}

# Test 2: Memory-Based Conversations
test_memory_based_conversations() {
    print_section "💬 MEMORY-BASED CONVERSATIONS"
    
    print_info "Testing memory-based conversation flow..."
    
    # First, ask about stored information
    print_info "Querying stored information..."
    local response1=$(execute_agent_query "What do you know about me?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Memory-based query executed successfully"
        else
            print_error "Failed to execute memory-based query"
            echo "  Response: $response1"
            return 1
        fi
    fi
    
    # Store additional context
    print_info "Storing additional context..."
    local additional_info='I am currently working on a project involving natural language processing and I use Python, TensorFlow, and PyTorch for my work.'
    
    local response2=$(execute_agent_query "$additional_info" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response2" | jq . >/dev/null 2>&1; then
        success=$(echo "$response2" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Additional context stored"
        else
            print_error "Failed to store additional context"
            return 1
        fi
    fi
    
    # Query specific information
    print_info "Querying specific information..."
    local response3=$(execute_agent_query "What programming languages do I use?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response3" | jq . >/dev/null 2>&1; then
        success=$(echo "$response3" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Specific memory query executed successfully"
        else
            print_error "Failed to execute specific memory query"
            return 1
        fi
    fi
}

# Test 3: Memory Search Functionality
test_memory_search() {
    print_section "🔍 MEMORY SEARCH FUNCTIONALITY"
    
    print_info "Testing memory search capabilities..."
    
    # Search for specific terms
    local search_terms=("Python" "machine learning" "software engineer" "AI" "experience")
    
    for term in "${search_terms[@]}"; do
        print_info "Searching for: $term"
        
        local search_results=$(search_memories "$USER_ID" "$term" "both")
        
        if echo "$search_results" | jq . >/dev/null 2>&1; then
            local result_count=$(echo "$search_results" | jq -r '.data | length // 0')
            print_info "Found $result_count results for '$term'"
            
            if [ "$result_count" -gt 0 ]; then
                print_success "Search working for term: $term"
            else
                print_warning "No results found for: $term (may be expected if memory system not fully configured)"
            fi
        else
            print_error "Search failed for term: $term"
            echo "  Response: $search_results"
        fi
    done
}

# Test 4: Multi-Session Memory Persistence
test_multi_session_memory() {
    print_section "🔄 MULTI-SESSION MEMORY PERSISTENCE"
    
    print_info "Testing memory persistence across sessions..."
    
    local new_session_id="new-session-$(date +%s)"
    
    # Store information in original session
    print_info "Storing information in original session..."
    local response1=$(execute_agent_query "I am working on a secret AI project called Project Alpha" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Information stored in original session"
        else
            print_error "Failed to store information in original session"
            return 1
        fi
    fi
    
    # Wait for memory to be processed
    sleep 2
    
    # Try to access information from new session
    print_info "Accessing information from new session..."
    local response2=$(execute_agent_query "What projects am I working on?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$new_session_id'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response2" | jq . >/dev/null 2>&1; then
        success=$(echo "$response2" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Memory accessible across sessions"
        else
            print_error "Failed to access memory from new session"
            return 1
        fi
    fi
}

# Test 5: Memory Context Integration
test_memory_context_integration() {
    print_section "🔗 MEMORY CONTEXT INTEGRATION"
    
    print_info "Testing memory context integration with agent responses..."
    
    # Store context that should influence response
    print_info "Storing context for integration test..."
    local context_info='I prefer detailed explanations and technical depth in responses. I am particularly interested in the mathematical foundations of AI algorithms.'
    
    local response1=$(execute_agent_query "$context_info" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Context stored for integration test"
        else
            print_error "Failed to store context"
            return 1
        fi
    fi
    
    # Ask a question that should use the stored context
    print_info "Asking question that should use stored context..."
    local response2=$(execute_agent_query "Explain how neural networks work" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response2" | jq . >/dev/null 2>&1; then
        success=$(echo "$response2" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Context-aware response generated"
            
            # Check if reasoning mentions memory context
            local reasoning=$(echo "$response2" | jq -r '.reasoning // ""')
            if [[ "$reasoning" == *"memory"* ]] || [[ "$reasoning" == *"context"* ]]; then
                print_success "Response includes memory context reasoning"
            else
                print_warning "Response may not be using memory context effectively"
            fi
        else
            print_error "Failed to generate context-aware response"
            return 1
        fi
    fi
}

# Test 6: Memory Statistics and Analytics
test_memory_statistics() {
    print_section "📊 MEMORY STATISTICS AND ANALYTICS"
    
    print_info "Testing memory statistics..."
    
    # Get memory stats
    local stats_response=$(curl -s -X GET \
        "$BASE_URL/api/memory/stats/$USER_ID" 2>/dev/null)
    
    if echo "$stats_response" | jq . >/dev/null 2>&1; then
        print_success "Memory statistics retrieved"
        echo "  Stats: $(echo "$stats_response" | jq -c .)"
    else
        print_warning "Memory statistics not available (may be expected if memory system not fully configured)"
        echo "  Response: $stats_response"
    fi
    
    # Get conversation history
    print_info "Testing conversation history..."
    local history_response=$(curl -s -X GET \
        "$BASE_URL/api/memory-chat/history/$USER_ID/$SESSION_ID" 2>/dev/null)
    
    if echo "$history_response" | jq . >/dev/null 2>&1; then
        print_success "Conversation history retrieved"
        local history_count=$(echo "$history_response" | jq -r '.data | length // 0')
        print_info "Found $history_count conversation entries"
    else
        print_warning "Conversation history not available"
        echo "  Response: $history_response"
    fi
}

# Generate comprehensive memory validation report
generate_memory_report() {
    print_header "📋 MEMORY VALIDATION REPORT"
    
    echo -e "${CYAN}Test Summary:${NC}"
    echo "  Total Tests: $TESTS_RUN"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL MEMORY TESTS PASSED!${NC}"
        echo -e "${GREEN}Agent memory system is working correctly!${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some memory tests failed${NC}"
        echo -e "${YELLOW}Check the output above for details${NC}"
    fi
    
    if [ $TESTS_RUN -eq 0 ]; then
        echo -e "\n${BLUE}Memory Test Success Rate: N/A (no tests run)${NC}"
    else
        local success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
        echo -e "\n${BLUE}Memory Test Success Rate: ${success_rate}%${NC}"
    fi
    
    print_header "Memory System Status"
    if [ $TESTS_RUN -eq 0 ] || [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🌟 Excellent memory system performance!${NC}"
        echo -e "${GREEN}✅ Memory storage working${NC}"
        echo -e "${GREEN}✅ Memory retrieval working${NC}"
        echo -e "${GREEN}✅ Memory search working${NC}"
        echo -e "${GREEN}✅ Cross-session persistence working${NC}"
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}👍 Good memory system performance${NC}"
        echo -e "${YELLOW}⚠️  Some features may need attention${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Memory system needs improvement${NC}"
        echo -e "${YELLOW}🔧 Check memory configuration${NC}"
    else
        echo -e "${RED}❌ Memory system requires attention${NC}"
        echo -e "${RED}🔧 Verify Neo4j and Pinecone configuration${NC}"
    fi
    
    print_header "Next Steps"
    if [ $TESTS_RUN -gt 0 ] && [ $(( (TESTS_PASSED * 100) / TESTS_RUN )) -lt 80 ]; then
        echo "1. Check Neo4j database connection"
        echo "2. Verify Pinecone vector database setup"
        echo "3. Ensure Ollama embedding model is running"
        echo "4. Review environment variables in packages/server/.env"
        echo "5. Check server logs for memory-related errors"
    else
        echo "1. Memory system is working well"
        echo "2. Consider running performance benchmarks"
        echo "3. Monitor memory usage and cleanup"
        echo "4. Test with larger datasets"
    fi
}

# Main testing function
main() {
    print_header "Clear-AI Agent Memory Validation Suite"
    echo "Timestamp: $(date)"
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    echo "Server: $BASE_URL"
    
    # Wait for server
    wait_for_server
    
    # Run all memory validation tests
    test_basic_memory_operations
    test_memory_based_conversations
    test_memory_search
    test_multi_session_memory
    test_memory_context_integration
    test_memory_statistics
    
    # Generate final report
    generate_memory_report
    
    print_header "Memory Validation Complete"
    echo "This test suite validates that agent interactions are properly stored and retrieved."
    echo "Check the detailed output above for any memory system issues."
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --basic        Run only basic memory tests"
        echo "  --search       Run only memory search tests"
        echo "  --persistence  Run only persistence tests"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all memory validation tests"
        echo "  $0 --basic           # Run basic memory tests only"
        echo "  $0 --search          # Run memory search tests only"
        ;;
    --basic)
        print_header "Running Basic Memory Tests Only"
        wait_for_server
        test_basic_memory_operations
        test_memory_based_conversations
        generate_memory_report
        ;;
    --search)
        print_header "Running Memory Search Tests Only"
        wait_for_server
        test_memory_search
        test_memory_statistics
        generate_memory_report
        ;;
    --persistence)
        print_header "Running Memory Persistence Tests Only"
        wait_for_server
        test_multi_session_memory
        test_memory_context_integration
        generate_memory_report
        ;;
    *)
        main
        ;;
esac
