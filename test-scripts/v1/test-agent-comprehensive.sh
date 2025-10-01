#!/bin/bash

# Clear-AI Agent Comprehensive Testing Suite
# This script thoroughly tests the agent service with various scenarios

set -e

# Configuration
BASE_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="test-user-$TIMESTAMP"
SESSION_ID="test-session-$TIMESTAMP"
TEST_ID="comprehensive-$(date +%s)"

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

# Enhanced test function with better error handling
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    local should_validate_json=${6:-true}
    
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
        
        # Validate JSON if required
        if [ "$should_validate_json" = "true" ]; then
            if echo "$body" | jq . >/dev/null 2>&1; then
                echo "  Response: $(echo "$body" | jq -c .)"
            else
                print_warning "Response is not valid JSON"
                echo "  Raw response: $body"
            fi
        fi
        return 0
    else
        print_error "HTTP $http_code (expected $expected_status) - $description"
        echo "  Response: $body"
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
    echo "Please start the server with: npm run dev"
    exit 1
}

# Test agent initialization
test_agent_initialization() {
    print_section "🤖 AGENT INITIALIZATION"
    
    test_endpoint "POST" "/api/agent/initialize" "" "Initialize Agent Service"
    test_endpoint "GET" "/api/agent/status" "" "Get Agent Status"
}

# Test basic conversation
test_basic_conversation() {
    print_section "💬 BASIC CONVERSATION"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Hello, how are you?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true,
            "model": "ollama",
            "temperature": 0.7
        }
    }' "Simple greeting"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "What is 2 + 2?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true
        }
    }' "Simple math question"
}

# Test memory functionality
test_memory_functionality() {
    print_section "🧠 MEMORY FUNCTIONALITY"
    
    # Store information in memory
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "My name is Alice and I am a software developer who loves Python and machine learning",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' "Store personal information"
    
    # Test memory retrieval
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "What do you know about me?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' "Retrieve stored information"
    
    # Test memory with specific context
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "What programming languages do I like?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' "Query specific memory"
}

# Test tool execution
test_tool_execution() {
    print_section "🔧 TOOL EXECUTION"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Calculate 15 * 27",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true
        }
    }' "Calculator tool"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "What is the absolute value of -42?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true
        }
    }' "Absolute value tool"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Say hello to John",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true
        }
    }' "Hello world tool"
}

# Test hybrid queries (memory + tools)
test_hybrid_queries() {
    print_section "🔀 HYBRID QUERIES (Memory + Tools)"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Remember that I like Python programming, then calculate 2 to the power of 8",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' "Memory storage + calculation"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Based on what you know about me, help me calculate compound interest on $10,000 at 5% for 3 years",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' "Context-aware calculation"
}

# Test multi-turn conversations
test_multi_turn_conversation() {
    print_section "🔄 MULTI-TURN CONVERSATION"
    
    local turn1_data='{
        "query": "I am working on a machine learning project",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }'
    
    local turn2_data='{
        "query": "What project was I working on?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }'
    
    local turn3_data='{
        "query": "Can you help me calculate the accuracy if I have 950 correct predictions out of 1000 total?",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }'
    
    test_endpoint "POST" "/api/agent/execute" "$turn1_data" "Turn 1: Project introduction"
    test_endpoint "POST" "/api/agent/execute" "$turn2_data" "Turn 2: Memory recall"
    test_endpoint "POST" "/api/agent/execute" "$turn3_data" "Turn 3: Context-aware calculation"
}

# Test different models and configurations
test_model_configurations() {
    print_section "⚙️ MODEL CONFIGURATIONS"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Explain quantum computing in simple terms",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true,
            "model": "ollama",
            "temperature": 0.3
        }
    }' "Low temperature response"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "Tell me a creative story about a robot",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": true,
            "model": "ollama",
            "temperature": 0.9
        }
    }' "High temperature response"
}

# Test error handling
test_error_handling() {
    print_section "⚠️ ERROR HANDLING"
    
    test_endpoint "POST" "/api/agent/execute" '{
        "query": "",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'"
        }
    }' "Empty query" 400
    
    test_endpoint "POST" "/api/agent/execute" '{
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'"
        }
    }' "Missing query field" 400
    
    test_endpoint "GET" "/api/agent/nonexistent" "" "Non-existent endpoint" 404
}

# Test performance and load
test_performance() {
    print_section "🚀 PERFORMANCE TESTING"
    
    print_info "Running 5 concurrent requests..."
    local start_time=$(date +%s)
    
    # Run multiple requests in parallel
    for i in {1..5}; do
        (
            test_endpoint "POST" "/api/agent/execute" '{
                "query": "What is '$(($i * 7))' + '$(($i * 3))'?",
                "options": {
                    "userId": "'$USER_ID'",
                    "sessionId": "'$SESSION_ID'",
                    "includeMemoryContext": false,
                    "includeReasoning": false
                }
            }' "Performance test $i"
        ) &
    done
    
    # Wait for all background jobs to complete
    wait
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    print_info "Performance test completed in ${duration} seconds"
}

# Run agent test suite
test_agent_suite() {
    print_section "🧪 AGENT TEST SUITE"
    
    test_endpoint "POST" "/api/agent/test" "" "Run comprehensive agent tests"
}

# Generate test report
generate_report() {
    print_header "📊 TEST REPORT"
    
    echo -e "${CYAN}Test Summary:${NC}"
    echo "  Total Tests: $TESTS_RUN"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}The agent service is working perfectly!${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some tests failed${NC}"
        echo -e "${YELLOW}Check the output above for details${NC}"
    fi
    
    local success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
    echo -e "\n${BLUE}Success Rate: ${success_rate}%${NC}"
    
    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🌟 Excellent performance!${NC}"
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}👍 Good performance${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Needs improvement${NC}"
    else
        echo -e "${RED}❌ Requires attention${NC}"
    fi
}

# Main testing function
main() {
    print_header "Clear-AI Agent Comprehensive Testing Suite"
    echo "Timestamp: $(date)"
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    echo "Server: $BASE_URL"
    
    # Wait for server
    wait_for_server
    
    # Run all test suites
    test_agent_initialization
    test_basic_conversation
    test_memory_functionality
    test_tool_execution
    test_hybrid_queries
    test_multi_turn_conversation
    test_model_configurations
    test_error_handling
    test_performance
    test_agent_suite
    
    # Generate final report
    generate_report
    
    print_header "Testing Complete"
    echo "Check the detailed output above for any issues."
    echo "For debugging, check the server logs and ensure all services are running."
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --quick        Run only basic tests"
        echo "  --memory       Run only memory tests"
        echo "  --tools        Run only tool tests"
        echo "  --performance  Run only performance tests"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all tests"
        echo "  $0 --quick           # Run basic tests only"
        echo "  $0 --memory          # Run memory tests only"
        ;;
    --quick)
        print_header "Running Quick Tests Only"
        wait_for_server
        test_agent_initialization
        test_basic_conversation
        generate_report
        ;;
    --memory)
        print_header "Running Memory Tests Only"
        wait_for_server
        test_memory_functionality
        test_multi_turn_conversation
        generate_report
        ;;
    --tools)
        print_header "Running Tool Tests Only"
        wait_for_server
        test_tool_execution
        test_hybrid_queries
        generate_report
        ;;
    --performance)
        print_header "Running Performance Tests Only"
        wait_for_server
        test_performance
        generate_report
        ;;
    *)
        main
        ;;
esac
