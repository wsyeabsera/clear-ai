#!/bin/bash

# Clear-AI Agent API Relationships Test
# Tests agent's ability to understand and remember semantic relationships from API calls
# Uses JSONPlaceholder API to test relational data understanding

set -e

BASE_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="api-rel-test-$(date +%s)"
SESSION_ID="api-rel-session-$(date +%s)"
TEST_ID="api-relationships-$(date +%s)"

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

# Enhanced test function for API relationship testing with detailed observability
test_api_relationship() {
    local query=$1
    local description=$2
    local expected_keywords=("$3")
    local debug_mode=${4:-false}
    
    TESTS_RUN=$((TESTS_RUN + 1))
    local test_start_time=$(date +%s.%N)
    
    print_info "Testing: $description"
    echo "  Query: $query"
    echo "  Expected keywords: ${expected_keywords[*]}"

    # Prepare request data
    local request_data='{
        "query": "'"$query"'",
        "options": {
            "userId": "'$USER_ID'",
            "sessionId": "'$SESSION_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true,
            "testId": "'$TEST_ID'"
        }
    }'
    
    if [ "$debug_mode" = "true" ]; then
        echo -e "${CYAN}🔍 DEBUG: Request data:${NC}"
        echo "$request_data" | jq . 2>/dev/null || echo "$request_data"
        echo ""
    fi
    
    # Make API call with timing
    local api_start_time=$(date +%s.%N)
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$request_data" \
        "$BASE_URL/api/agent/execute" 2>/dev/null)
    local api_end_time=$(date +%s.%N)
    local api_duration=$(echo "$api_end_time - $api_start_time" | bc -l 2>/dev/null || echo "N/A")
    
    echo "  ⏱️  API call duration: ${api_duration}s"
    
    # Validate JSON response
    if echo "$response" | jq . >/dev/null 2>&1; then
        local success=$(echo "$response" | jq -r '.success // false')
        local response_text=$(echo "$response" | jq -r '.data.response // .response // ""')
        local reasoning=$(echo "$response" | jq -r '.data.reasoning // .reasoning // ""')
        local memory_context=$(echo "$response" | jq -r '.data.memoryContext // .memoryContext // ""')
        local tools_used=$(echo "$response" | jq -r '.data.toolResults // .toolsUsed // []')
        local error_message=$(echo "$response" | jq -r '.data.error // .error // ""')
        local tool_results=$(echo "$response" | jq -r '.data.toolResults // []')
        
        if [ "$debug_mode" = "true" ]; then
            echo -e "${CYAN}🔍 DEBUG: Full response:${NC}"
            echo "$response" | jq . 2>/dev/null || echo "$response"
            echo ""
        fi
        
        if [ "$success" = "true" ]; then
            print_success "API relationship query executed successfully"
            
            # Display response details
            echo -e "${BLUE}📝 Response Analysis:${NC}"
            echo "  Response length: ${#response_text} characters"
            echo "  Reasoning length: ${#reasoning} characters"
            echo "  Memory context length: ${#memory_context} characters"
            
            # Extract tool names from tool results
            local tool_names=$(echo "$tool_results" | jq -r '.[].toolName // empty' 2>/dev/null | tr '\n' ' ' || echo "None")
            echo "  Tools used: $tool_names"
            
            # Show first 200 characters of response
            if [ ${#response_text} -gt 0 ]; then
                echo -e "${BLUE}📄 Response preview:${NC}"
                echo "  $(echo "$response_text" | head -c 200)$([ ${#response_text} -gt 200 ] && echo "...")"
            fi
            
            # Show reasoning if available
            if [ ${#reasoning} -gt 0 ]; then
                echo -e "${BLUE}🧠 Reasoning preview:${NC}"
                echo "  $(echo "$reasoning" | head -c 200)$([ ${#reasoning} -gt 200 ] && echo "...")"
            fi
            
            # Detailed keyword analysis
            echo -e "${BLUE}🔍 Keyword Analysis:${NC}"
            local keyword_found=false
            local found_keywords=()
            local missing_keywords=()
            
            for keyword in "${expected_keywords[@]}"; do
                if [[ "$response_text" == *"$keyword"* ]] || [[ "$reasoning" == *"$keyword"* ]]; then
                    keyword_found=true
                    found_keywords+=("$keyword")
                    echo "  ✅ Found keyword: '$keyword'"
                else
                    missing_keywords+=("$keyword")
                    echo "  ❌ Missing keyword: '$keyword'"
                fi
            done
            
            # Check for API-related terms
            echo -e "${BLUE}🔗 API Relationship Analysis:${NC}"
            local api_terms=("api" "relationship" "related" "data" "resource" "endpoint" "json" "http")
            local api_terms_found=0
            
            for term in "${api_terms[@]}"; do
                if [[ "$response_text" == *"$term"* ]] || [[ "$reasoning" == *"$term"* ]]; then
                    api_terms_found=$((api_terms_found + 1))
                    echo "  ✅ Found API term: '$term'"
                fi
            done
            
            # Overall assessment
            local test_end_time=$(date +%s.%N)
            local total_duration=$(echo "$test_end_time - $test_start_time" | bc -l 2>/dev/null || echo "N/A")
            
            echo -e "${BLUE}📊 Test Assessment:${NC}"
            echo "  Total test duration: ${total_duration}s"
            echo "  Keywords found: ${#found_keywords[@]}/${#expected_keywords[@]}"
            echo "  API terms found: $api_terms_found/${#api_terms[@]}"
            
            if [ "$keyword_found" = true ]; then
                print_success "Response contains expected relational concepts"
                echo "  Found keywords: ${found_keywords[*]}"
            else
                print_warning "Response may not contain expected relational concepts"
                echo "  Missing keywords: ${missing_keywords[*]}"
            fi
            
            if [ $api_terms_found -ge 3 ]; then
                print_success "Reasoning shows strong understanding of API relationships"
            elif [ $api_terms_found -ge 1 ]; then
                print_info "Reasoning shows some understanding of API relationships"
            else
                print_warning "Reasoning may not explicitly mention API relationships"
            fi
            
            # Memory context analysis
            if [ ${#memory_context} -gt 0 ]; then
                echo -e "${BLUE}🧠 Memory Context Analysis:${NC}"
                echo "  Memory context length: ${#memory_context} characters"
                if [[ "$memory_context" == *"api"* ]] || [[ "$memory_context" == *"relationship"* ]]; then
                    print_success "Memory context contains API relationship information"
                else
                    print_info "Memory context may not contain explicit API relationship data"
                fi
            fi
            
            return 0
        else
            print_error "API relationship query failed"
            echo -e "${RED}❌ Error Details:${NC}"
            echo "  Success: $success"
            echo "  Error message: $error_message"
            echo "  Response: $response_text"
            echo "  Full response: $response"
            return 1
        fi
    else
        print_error "Invalid JSON response from API relationship query"
        echo -e "${RED}❌ Raw response:${NC}"
        echo "$response"
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

# Test 1: Basic API Data Retrieval and Memory Storage
test_basic_api_data_retrieval() {
    print_section "📡 BASIC API DATA RETRIEVAL"
    
    print_info "Testing basic API data retrieval and memory storage..."
    
    # Test fetching user data
    test_api_relationship "Fetch information about user ID 1 from the JSONPlaceholder API" \
        "Fetch user data from API" \
        "user" "name" "email" "$DEBUG_MODE"
    
    sleep 2  # Allow memory processing
    
    # Test fetching posts data
    test_api_relationship "Get the first 3 posts from the JSONPlaceholder API" \
        "Fetch posts data from API" \
        "post" "title" "body" "$DEBUG_MODE"
    
    sleep 2
    
    # Test fetching comments data
    test_api_relationship "Retrieve comments for post ID 1 from the JSONPlaceholder API" \
        "Fetch comments data from API" \
        "comment" "postId" "email" "$DEBUG_MODE"
}

# Test 2: Understanding API Relationships
test_api_relationships_understanding() {
    print_section "🔗 API RELATIONSHIPS UNDERSTANDING"
    
    print_info "Testing understanding of API relationships..."
    
    # Test understanding user-posts relationship
    test_api_relationship "Show me all posts written by user ID 1 from the JSONPlaceholder API" \
        "Understand user-posts relationship" \
        "relationship" "user" "posts" "author" "$DEBUG_MODE"
    
    sleep 2
    
    # Test understanding posts-comments relationship
    test_api_relationship "Get all comments for posts written by user ID 1 from the JSONPlaceholder API" \
        "Understand posts-comments relationship" \
        "comments" "posts" "relationship" "nested" "$DEBUG_MODE"
    
    sleep 2
    
    # Test understanding albums-photos relationship
    test_api_relationship "Fetch all photos from album ID 1 using the JSONPlaceholder API" \
        "Understand albums-photos relationship" \
        "album" "photos" "relationship" "collection" "$DEBUG_MODE"
}

# Test 3: Complex Relational Queries
test_complex_relational_queries() {
    print_section "🧩 COMPLEX RELATIONAL QUERIES"
    
    print_info "Testing complex relational queries..."
    
    # Test multi-step relationship traversal
    test_api_relationship "Find all users who have commented on posts written by user ID 1 using the JSONPlaceholder API" \
        "Multi-step relationship traversal" \
        "traversal" "chain" "relationship" "users" "comments" "posts" "$DEBUG_MODE"
    
    sleep 3  # Allow more processing time for complex queries
    
    # Test cross-resource analysis
    test_api_relationship "Analyze the relationship between users, their posts, and the comments on those posts using JSONPlaceholder API data" \
        "Cross-resource relationship analysis" \
        "analysis" "cross-resource" "relationship" "pattern" "$DEBUG_MODE"
    
    sleep 3
    
    # Test data aggregation understanding
    test_api_relationship "Count how many posts each user has written using the JSONPlaceholder API" \
        "Data aggregation understanding" \
        "count" "aggregation" "statistics" "per user" "$DEBUG_MODE"
}

# Test 4: Memory-Based API Relationship Queries
test_memory_based_api_queries() {
    print_section "🧠 MEMORY-BASED API RELATIONSHIPS"
    
    print_info "Testing memory-based API relationship queries..."
    
    # Test recalling previously fetched data
    test_api_relationship "What do you remember about the user data we fetched earlier?" \
        "Recall previously fetched user data" \
        "remember" "previous" "fetched" "user" "$DEBUG_MODE"
    
    sleep 2
    
    # Test relationship-based memory queries
    test_api_relationship "Based on the API data we've retrieved, what relationships exist between users and their content?" \
        "Relationship-based memory query" \
        "relationships" "users" "content" "based on" "retrieved" "$DEBUG_MODE"
    
    sleep 2
    
    # Test semantic understanding of API structure
    test_api_relationship "What is the overall structure and relationships in the JSONPlaceholder API data we've explored?" \
        "Semantic understanding of API structure" \
        "structure" "overall" "relationships" "explored" "API" "$DEBUG_MODE"
}

# Test 5: API Data Pattern Recognition
test_api_data_pattern_recognition() {
    print_section "🔍 API DATA PATTERN RECOGNITION"
    
    print_info "Testing API data pattern recognition..."
    
    # Test identifying data patterns
    test_api_relationship "What patterns do you notice in the JSONPlaceholder API data structure?" \
        "Identify data patterns" \
        "patterns" "structure" "notice" "data" "$DEBUG_MODE"
    
    sleep 2
    
    # Test understanding data types and formats
    test_api_relationship "What types of data and relationships are available in the JSONPlaceholder API?" \
        "Understand data types and relationships" \
        "types" "data" "relationships" "available" "$DEBUG_MODE"
    
    sleep 2
    
    # Test semantic grouping of related data
    test_api_relationship "Group the JSONPlaceholder API resources by their semantic relationships" \
        "Semantic grouping of API resources" \
        "group" "semantic" "resources" "relationships" "$DEBUG_MODE"
}

# Test 6: Cross-API Relationship Analysis
test_cross_api_relationship_analysis() {
    print_section "🔄 CROSS-API RELATIONSHIP ANALYSIS"
    
    print_info "Testing cross-API relationship analysis..."
    
    # Test understanding of data flow relationships
    test_api_relationship "Explain how data flows between different resources in the JSONPlaceholder API" \
        "Understand data flow relationships" \
        "data flow" "resources" "between" "different" "$DEBUG_MODE"
    
    sleep 3
    
    # Test hierarchical relationship understanding
    test_api_relationship "What is the hierarchical structure of the JSONPlaceholder API resources?" \
        "Understand hierarchical relationships" \
        "hierarchical" "structure" "resources" "levels" "$DEBUG_MODE"
    
    sleep 3
    
    # Test many-to-many relationship understanding
    test_api_relationship "Identify many-to-many relationships in the JSONPlaceholder API data" \
        "Understand many-to-many relationships" \
        "many-to-many" "relationships" "identify" "complex" "$DEBUG_MODE"
}

# Test 7: Memory Persistence of API Relationships
test_memory_persistence_api_relationships() {
    print_section "💾 MEMORY PERSISTENCE OF API RELATIONSHIPS"
    
    print_info "Testing memory persistence of API relationships..."
    
    # Store specific relationship information
    test_api_relationship "Remember that in the JSONPlaceholder API, users can have multiple posts, and posts can have multiple comments" \
        "Store relationship information in memory" \
        "remember" "relationship" "users" "posts" "comments" "$DEBUG_MODE"
    
    sleep 2
    
    # Test retrieval of stored relationship information
    test_api_relationship "What relationships did we discover in the JSONPlaceholder API?" \
        "Retrieve stored relationship information" \
        "relationships" "discovered" "JSONPlaceholder" "remember" "$DEBUG_MODE"
    
    sleep 2
    
    # Test application of stored relationship knowledge
    test_api_relationship "Using what you know about the JSONPlaceholder API relationships, find all content related to user ID 2" \
        "Apply stored relationship knowledge" \
        "using" "know" "relationships" "related" "user" "$DEBUG_MODE"
}

# Generate comprehensive API relationship test report
generate_api_relationship_report() {
    print_header "📊 API RELATIONSHIP TEST REPORT"
    
    echo -e "${CYAN}Test Summary:${NC}"
    echo "  Test ID: $TEST_ID"
    echo "  User ID: $USER_ID"
    echo "  Session ID: $SESSION_ID"
    echo "  Total Tests: $TESTS_RUN"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL API RELATIONSHIP TESTS PASSED!${NC}"
        echo -e "${GREEN}Agent successfully understands and remembers API relationships!${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some API relationship tests failed${NC}"
        echo -e "${YELLOW}Check the output above for details${NC}"
    fi
    
    local success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
    echo -e "\n${BLUE}API Relationship Test Success Rate: ${success_rate}%${NC}"
    
    print_header "API Relationship Understanding Assessment"
    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🌟 Excellent API relationship understanding!${NC}"
        echo -e "${GREEN}✅ Basic API data retrieval working${NC}"
        echo -e "${GREEN}✅ Relationship understanding working${NC}"
        echo -e "${GREEN}✅ Complex queries working${NC}"
        echo -e "${GREEN}✅ Memory-based queries working${NC}"
        echo -e "${GREEN}✅ Pattern recognition working${NC}"
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}👍 Good API relationship understanding${NC}"
        echo -e "${YELLOW}⚠️  Some advanced features may need attention${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}⚠️  API relationship understanding needs improvement${NC}"
        echo -e "${YELLOW}🔧 Check API calling tools and memory configuration${NC}"
    else
        echo -e "${RED}❌ API relationship understanding requires attention${NC}"
        echo -e "${RED}🔧 Verify API calling tools and memory system${NC}"
    fi
    
    print_header "API Relationship Capabilities Tested"
    echo "✅ Basic API data retrieval and storage"
    echo "✅ Understanding of user-posts-comments relationships"
    echo "✅ Complex relational query processing"
    echo "✅ Memory-based relationship queries"
    echo "✅ Pattern recognition in API data"
    echo "✅ Cross-resource relationship analysis"
    echo "✅ Memory persistence of relationship knowledge"
    
    print_header "JSONPlaceholder API Resources Used"
    echo "📡 Users API - User profile data"
    echo "📡 Posts API - User-generated content"
    echo "📡 Comments API - User interactions"
    echo "📡 Albums API - Content organization"
    echo "📡 Photos API - Media content"
    echo "📡 Todos API - Task management"
    
    print_header "Next Steps"
    if [ $success_rate -lt 80 ]; then
        echo "1. Check API calling tools configuration"
        echo "2. Verify memory system is storing relationship data"
        echo "3. Ensure embedding model is working for semantic understanding"
        echo "4. Review agent reasoning capabilities"
        echo "5. Test with different API endpoints"
    else
        echo "1. API relationship understanding is working well"
        echo "2. Consider testing with more complex APIs"
        echo "3. Test relationship reasoning with larger datasets"
        echo "4. Validate relationship graph construction"
        echo "5. Test cross-domain relationship understanding"
    fi
}

# Global debug mode flag
DEBUG_MODE=false

# Main testing function
main() {
    print_header "Clear-AI Agent API Relationships Test Suite"
    echo "Timestamp: $(date)"
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    echo "Server: $BASE_URL"
    echo "API Source: https://jsonplaceholder.typicode.com/"
    echo "Debug Mode: $DEBUG_MODE"
    
    # Wait for server
    wait_for_server
    
    print_info "This test suite validates the agent's ability to:"
    echo "  • Retrieve data from external APIs"
    echo "  • Understand relationships between API resources"
    echo "  • Store semantic knowledge of API structures"
    echo "  • Apply relationship knowledge in queries"
    echo "  • Recognize patterns in API data"
    echo "  • Persist relationship understanding in memory"
    
    if [ "$DEBUG_MODE" = "true" ]; then
        print_info "🔍 DEBUG MODE ENABLED - Verbose output will be shown"
        echo "  • Full request/response data will be displayed"
        echo "  • Detailed analysis of each test step"
        echo "  • Enhanced error reporting with context"
    fi
    
    # Run all API relationship tests
    test_basic_api_data_retrieval
    test_api_relationships_understanding
    test_complex_relational_queries
    test_memory_based_api_queries
    test_api_data_pattern_recognition
    test_cross_api_relationship_analysis
    test_memory_persistence_api_relationships
    
    # Generate final report
    generate_api_relationship_report
    
    print_header "API Relationship Testing Complete"
    echo "This test suite validates that the agent can understand and remember"
    echo "semantic relationships from external API data using JSONPlaceholder."
    echo "Check the detailed output above for any relationship understanding issues."
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --debug, -d    Enable debug mode with verbose output"
        echo "  --basic        Run only basic API data retrieval tests"
        echo "  --relationships Run only relationship understanding tests"
        echo "  --memory       Run only memory-based relationship tests"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all API relationship tests"
        echo "  $0 --debug           # Run all tests with debug output"
        echo "  $0 --basic --debug   # Run basic API tests with debug output"
        echo "  $0 --relationships   # Run relationship tests only"
        ;;
    --debug|-d)
        DEBUG_MODE=true
        main
        ;;
    --basic)
        print_header "Running Basic API Data Retrieval Tests Only"
        wait_for_server
        test_basic_api_data_retrieval
        generate_api_relationship_report
        ;;
    --basic-debug)
        DEBUG_MODE=true
        print_header "Running Basic API Data Retrieval Tests Only (Debug Mode)"
        wait_for_server
        test_basic_api_data_retrieval
        generate_api_relationship_report
        ;;
    --relationships)
        print_header "Running API Relationship Understanding Tests Only"
        wait_for_server
        test_api_relationships_understanding
        test_complex_relational_queries
        generate_api_relationship_report
        ;;
    --relationships-debug)
        DEBUG_MODE=true
        print_header "Running API Relationship Understanding Tests Only (Debug Mode)"
        wait_for_server
        test_api_relationships_understanding
        test_complex_relational_queries
        generate_api_relationship_report
        ;;
    --memory)
        print_header "Running Memory-Based API Relationship Tests Only"
        wait_for_server
        test_memory_based_api_queries
        test_memory_persistence_api_relationships
        generate_api_relationship_report
        ;;
    --memory-debug)
        DEBUG_MODE=true
        print_header "Running Memory-Based API Relationship Tests Only (Debug Mode)"
        wait_for_server
        test_memory_based_api_queries
        test_memory_persistence_api_relationships
        generate_api_relationship_report
        ;;
    *)
        main
        ;;
esac
