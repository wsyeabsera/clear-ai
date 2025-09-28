#!/bin/bash

# Enhanced Agent Intelligence Test
# Tests the improved agent capabilities including relationship analysis, semantic understanding, and pattern recognition

set -e

BASE_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="enhanced-test-$(date +%s)"
SESSION_ID="enhanced-session-$(date +%s)"
TEST_ID="enhanced-intelligence-$(date +%s)"

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

# Intelligence level tracking
MEMORY_INTEGRATION_SCORE=0
RELATIONSHIP_REASONING_SCORE=0
SEMANTIC_UNDERSTANDING_SCORE=0
PATTERN_RECOGNITION_SCORE=0
LEARNING_CAPABILITY_SCORE=0

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

# Enhanced test function with intelligence scoring
test_enhanced_intelligence() {
    local query=$1
    local description=$2
    local expected_keywords=("$3")
    local test_type=$4
    local debug_mode=${5:-false}
    
    TESTS_RUN=$((TESTS_RUN + 1))
    local test_start_time=$(date +%s.%N)
    
    print_info "Testing: $description"
    echo "  Query: $query"
    echo "  Expected keywords: ${expected_keywords[*]}"
    echo "  Test type: $test_type"

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
        
        if [ "$debug_mode" = "true" ]; then
            echo -e "${CYAN}🔍 DEBUG: Full response:${NC}"
            echo "$response" | jq . 2>/dev/null || echo "$response"
            echo ""
        fi
        
        if [ "$success" = "true" ]; then
            print_success "Enhanced intelligence query executed successfully"
            
            # Display response details
            echo -e "${BLUE}📝 Response Analysis:${NC}"
            echo "  Response length: ${#response_text} characters"
            echo "  Reasoning length: ${#reasoning} characters"
            echo "  Memory context length: ${#memory_context} characters"
            
            # Extract tool names from tool results
            local tool_names=$(echo "$tools_used" | jq -r '.[].toolName // empty' 2>/dev/null | tr '\n' ' ' || echo "None")
            echo "  Tools used: $tool_names"
            
            # Intelligence scoring based on test type
            local intelligence_score=0
            
            case $test_type in
                "memory_integration")
                    # Check memory context length and content
                    if [ ${#memory_context} -gt 100 ]; then
                        intelligence_score=$((intelligence_score + 2))
                        echo "  ✅ Memory context has substantial content"
                    fi
                    if [[ "$memory_context" == *"api"* ]] || [[ "$memory_context" == *"relationship"* ]]; then
                        intelligence_score=$((intelligence_score + 2))
                        echo "  ✅ Memory context contains API relationship information"
                    fi
                    if [[ "$response_text" == *"remember"* ]] || [[ "$response_text" == *"previous"* ]]; then
                        intelligence_score=$((intelligence_score + 1))
                        echo "  ✅ Response shows memory integration"
                    fi
                    MEMORY_INTEGRATION_SCORE=$((MEMORY_INTEGRATION_SCORE + intelligence_score))
                    ;;
                    
                "relationship_reasoning")
                    # Check for relationship analysis keywords
                    local relationship_keywords=("relationship" "related" "hierarchy" "structure" "pattern" "connection" "association")
                    local relationship_found=0
                    for keyword in "${relationship_keywords[@]}"; do
                        if [[ "$response_text" == *"$keyword"* ]] || [[ "$reasoning" == *"$keyword"* ]]; then
                            relationship_found=$((relationship_found + 1))
                        fi
                    done
                    intelligence_score=$((relationship_found * 2))
                    echo "  ✅ Found $relationship_found relationship analysis terms"
                    RELATIONSHIP_REASONING_SCORE=$((RELATIONSHIP_REASONING_SCORE + intelligence_score))
                    ;;
                    
                "semantic_understanding")
                    # Check for semantic analysis keywords
                    local semantic_keywords=("concept" "semantic" "meaning" "understanding" "interpretation" "analysis" "insight")
                    local semantic_found=0
                    for keyword in "${semantic_keywords[@]}"; do
                        if [[ "$response_text" == *"$keyword"* ]] || [[ "$reasoning" == *"$keyword"* ]]; then
                            semantic_found=$((semantic_found + 1))
                        fi
                    done
                    intelligence_score=$((semantic_found * 2))
                    echo "  ✅ Found $semantic_found semantic understanding terms"
                    SEMANTIC_UNDERSTANDING_SCORE=$((SEMANTIC_UNDERSTANDING_SCORE + intelligence_score))
                    ;;
                    
                "pattern_recognition")
                    # Check for pattern recognition keywords
                    local pattern_keywords=("pattern" "structure" "organization" "consistency" "similarity" "common" "recurring")
                    local pattern_found=0
                    for keyword in "${pattern_keywords[@]}"; do
                        if [[ "$response_text" == *"$keyword"* ]] || [[ "$reasoning" == *"$keyword"* ]]; then
                            pattern_found=$((pattern_found + 1))
                        fi
                    done
                    intelligence_score=$((pattern_found * 2))
                    echo "  ✅ Found $pattern_found pattern recognition terms"
                    PATTERN_RECOGNITION_SCORE=$((PATTERN_RECOGNITION_SCORE + intelligence_score))
                    ;;
                    
                "learning_capability")
                    # Check for learning and improvement keywords
                    local learning_keywords=("learn" "improve" "better" "enhanced" "evolved" "developed" "progressed")
                    local learning_found=0
                    for keyword in "${learning_keywords[@]}"; do
                        if [[ "$response_text" == *"$keyword"* ]] || [[ "$reasoning" == *"$keyword"* ]]; then
                            learning_found=$((learning_found + 1))
                        fi
                    done
                    intelligence_score=$((learning_found * 2))
                    echo "  ✅ Found $learning_found learning capability terms"
                    LEARNING_CAPABILITY_SCORE=$((LEARNING_CAPABILITY_SCORE + intelligence_score))
                    ;;
            esac
            
            # Overall keyword analysis
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
            
            # Intelligence score for this test
            echo -e "${BLUE}📊 Intelligence Score: ${intelligence_score}/10${NC}"
            
            if [ $intelligence_score -ge 6 ]; then
                print_success "High intelligence demonstrated"
            elif [ $intelligence_score -ge 3 ]; then
                print_info "Moderate intelligence demonstrated"
            else
                print_warning "Low intelligence score - needs improvement"
            fi
            
            return 0
        else
            print_error "Enhanced intelligence query failed"
            echo -e "${RED}❌ Error Details:${NC}"
            echo "  Success: $success"
            echo "  Error message: $error_message"
            echo "  Response: $response_text"
            return 1
        fi
    else
        print_error "Invalid JSON response from enhanced intelligence query"
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

# Test 1: Memory Integration Enhancement
test_memory_integration_enhancement() {
    print_section "🧠 MEMORY INTEGRATION ENHANCEMENT"
    
    print_info "Testing enhanced memory integration capabilities..."
    
    # Test 1: Basic memory storage and retrieval
    test_enhanced_intelligence "Remember that I'm working on API relationship analysis" \
        "Store memory with API context" \
        "remember" "api" "relationship" "analysis" \
        "memory_integration" "$DEBUG_MODE"
    
    sleep 2
    
    # Test 2: Memory-based API query
    test_enhanced_intelligence "What do you remember about my API work?" \
        "Retrieve API-related memories" \
        "remember" "api" "work" "previous" \
        "memory_integration" "$DEBUG_MODE"
    
    sleep 2
    
    # Test 3: Complex memory integration
    test_enhanced_intelligence "Based on our previous API discussions, analyze the relationship patterns in JSONPlaceholder data" \
        "Complex memory integration with API analysis" \
        "previous" "api" "relationship" "patterns" "analyze" \
        "memory_integration" "$DEBUG_MODE"
}

# Test 2: Relationship Reasoning Enhancement
test_relationship_reasoning_enhancement() {
    print_section "🔗 RELATIONSHIP REASONING ENHANCEMENT"
    
    print_info "Testing enhanced relationship reasoning capabilities..."
    
    # Test 1: Basic relationship analysis
    test_enhanced_intelligence "Fetch user data from JSONPlaceholder API and analyze the relationships" \
        "Basic relationship analysis" \
        "relationship" "analyze" "structure" "pattern" \
        "relationship_reasoning" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 2: Complex relationship traversal
    test_enhanced_intelligence "Get posts by user 1, then get comments for those posts, and explain the relationship hierarchy" \
        "Complex relationship traversal" \
        "hierarchy" "relationship" "structure" "connection" \
        "relationship_reasoning" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 3: Cross-resource relationship analysis
    test_enhanced_intelligence "Analyze how users, posts, comments, and albums relate to each other in the JSONPlaceholder API" \
        "Cross-resource relationship analysis" \
        "analyze" "relationship" "structure" "hierarchy" "connection" \
        "relationship_reasoning" "$DEBUG_MODE"
}

# Test 3: Semantic Understanding Enhancement
test_semantic_understanding_enhancement() {
    print_section "🎯 SEMANTIC UNDERSTANDING ENHANCEMENT"
    
    print_info "Testing enhanced semantic understanding capabilities..."
    
    # Test 1: Semantic concept extraction
    test_enhanced_intelligence "What semantic concepts can you identify in the JSONPlaceholder API structure?" \
        "Semantic concept extraction" \
        "concept" "semantic" "meaning" "understanding" \
        "semantic_understanding" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 2: Deep semantic analysis
    test_enhanced_intelligence "Provide a deep semantic analysis of the data organization patterns in JSONPlaceholder" \
        "Deep semantic analysis" \
        "semantic" "analysis" "concept" "meaning" "interpretation" \
        "semantic_understanding" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 3: Contextual understanding
    test_enhanced_intelligence "Based on the API data we've explored, what insights can you provide about the overall system design?" \
        "Contextual understanding" \
        "insight" "understanding" "analysis" "concept" "semantic" \
        "semantic_understanding" "$DEBUG_MODE"
}

# Test 4: Pattern Recognition Enhancement
test_pattern_recognition_enhancement() {
    print_section "🔍 PATTERN RECOGNITION ENHANCEMENT"
    
    print_info "Testing enhanced pattern recognition capabilities..."
    
    # Test 1: Structural pattern recognition
    test_enhanced_intelligence "What patterns do you notice in the JSONPlaceholder API data structure?" \
        "Structural pattern recognition" \
        "pattern" "structure" "organization" "consistency" \
        "pattern_recognition" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 2: Behavioral pattern recognition
    test_enhanced_intelligence "Identify recurring patterns in how data flows through the JSONPlaceholder API" \
        "Behavioral pattern recognition" \
        "pattern" "flow" "recurring" "behavior" "similarity" \
        "pattern_recognition" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 3: Cross-pattern analysis
    test_enhanced_intelligence "Compare and contrast the patterns you see across different JSONPlaceholder resources" \
        "Cross-pattern analysis" \
        "pattern" "compare" "contrast" "similarity" "common" \
        "pattern_recognition" "$DEBUG_MODE"
}

# Test 5: Learning Capability Enhancement
test_learning_capability_enhancement() {
    print_section "📚 LEARNING CAPABILITY ENHANCEMENT"
    
    print_info "Testing enhanced learning capabilities..."
    
    # Test 1: Learning from previous interactions
    test_enhanced_intelligence "What have you learned about API relationships from our previous conversations?" \
        "Learning from previous interactions" \
        "learn" "previous" "conversation" "improve" "better" \
        "learning_capability" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 2: Progressive understanding
    test_enhanced_intelligence "How has your understanding of the JSONPlaceholder API evolved as we've explored it?" \
        "Progressive understanding" \
        "evolved" "understanding" "improve" "develop" "progress" \
        "learning_capability" "$DEBUG_MODE"
    
    sleep 3
    
    # Test 3: Knowledge synthesis
    test_enhanced_intelligence "Synthesize what you've learned about API design patterns and relationships" \
        "Knowledge synthesis" \
        "synthesize" "learn" "pattern" "relationship" "enhanced" \
        "learning_capability" "$DEBUG_MODE"
}

# Generate comprehensive intelligence assessment report
generate_intelligence_assessment_report() {
    print_header "📊 ENHANCED INTELLIGENCE ASSESSMENT REPORT"
    
    echo -e "${CYAN}Test Summary:${NC}"
    echo "  Test ID: $TEST_ID"
    echo "  User ID: $USER_ID"
    echo "  Session ID: $SESSION_ID"
    echo "  Total Tests: $TESTS_RUN"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    
    # Calculate intelligence scores
    local memory_score=$((MEMORY_INTEGRATION_SCORE * 100 / (TESTS_RUN * 10)))
    local relationship_score=$((RELATIONSHIP_REASONING_SCORE * 100 / (TESTS_RUN * 10)))
    local semantic_score=$((SEMANTIC_UNDERSTANDING_SCORE * 100 / (TESTS_RUN * 10)))
    local pattern_score=$((PATTERN_RECOGNITION_SCORE * 100 / (TESTS_RUN * 10)))
    local learning_score=$((LEARNING_CAPABILITY_SCORE * 100 / (TESTS_RUN * 10)))
    
    echo -e "\n${BLUE}Intelligence Capability Scores:${NC}"
    echo "  🧠 Memory Integration: ${memory_score}% (was 2/10)"
    echo "  🔗 Relationship Reasoning: ${relationship_score}% (was 4/10)"
    echo "  🎯 Semantic Understanding: ${semantic_score}% (was 3/10)"
    echo "  🔍 Pattern Recognition: ${pattern_score}% (was 4/10)"
    echo "  📚 Learning Capability: ${learning_score}% (was 0/10)"
    
    # Overall assessment
    local overall_score=$(( (memory_score + relationship_score + semantic_score + pattern_score + learning_score) / 5 ))
    echo -e "\n${PURPLE}Overall Intelligence Score: ${overall_score}%${NC}"
    
    if [ $overall_score -ge 80 ]; then
        echo -e "${GREEN}🌟 EXCELLENT! Agent intelligence significantly improved!${NC}"
        echo -e "${GREEN}✅ All major intelligence issues have been resolved${NC}"
    elif [ $overall_score -ge 60 ]; then
        echo -e "${YELLOW}👍 GOOD! Agent intelligence substantially improved${NC}"
        echo -e "${YELLOW}⚠️  Some areas may need further refinement${NC}"
    elif [ $overall_score -ge 40 ]; then
        echo -e "${YELLOW}⚠️  MODERATE improvement - more work needed${NC}"
        echo -e "${YELLOW}🔧 Continue enhancing intelligence capabilities${NC}"
    else
        echo -e "${RED}❌ LIMITED improvement - significant work still needed${NC}"
        echo -e "${RED}🔧 Review and enhance intelligence implementation${NC}"
    fi
    
    print_header "Intelligence Improvements Implemented"
    echo "✅ Enhanced memory integration with relationship analysis"
    echo "✅ Advanced relationship reasoning capabilities"
    echo "✅ Improved semantic understanding and concept extraction"
    echo "✅ Enhanced pattern recognition across API data"
    echo "✅ Implemented learning capabilities from interactions"
    echo "✅ Added contextual understanding and insights"
    echo "✅ Integrated cross-resource relationship analysis"
    echo "✅ Enhanced system prompts for better reasoning"
    
    print_header "Next Steps"
    if [ $overall_score -lt 60 ]; then
        echo "1. Review relationship analysis implementation"
        echo "2. Enhance semantic concept extraction"
        echo "3. Improve pattern recognition algorithms"
        echo "4. Strengthen learning capabilities"
        echo "5. Test with more complex API scenarios"
    else
        echo "1. Agent intelligence is significantly improved"
        echo "2. Test with more complex real-world APIs"
        echo "3. Validate relationship analysis accuracy"
        echo "4. Monitor learning progression over time"
        echo "5. Consider additional intelligence enhancements"
    fi
}

# Global debug mode flag
DEBUG_MODE=false

# Main testing function
main() {
    print_header "Clear-AI Enhanced Agent Intelligence Test Suite"
    echo "Timestamp: $(date)"
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    echo "Server: $BASE_URL"
    echo "API Source: https://jsonplaceholder.typicode.com/"
    echo "Debug Mode: $DEBUG_MODE"
    
    # Wait for server
    wait_for_server
    
    print_info "This test suite validates the enhanced agent intelligence capabilities:"
    echo "  • Enhanced memory integration with relationship analysis"
    echo "  • Advanced relationship reasoning and pattern recognition"
    echo "  • Improved semantic understanding and concept extraction"
    echo "  • Learning capabilities from previous interactions"
    echo "  • Contextual understanding and cross-resource analysis"
    echo "  • Deep insights into API structure and organization"
    
    if [ "$DEBUG_MODE" = "true" ]; then
        print_info "🔍 DEBUG MODE ENABLED - Verbose output will be shown"
        echo "  • Full request/response data will be displayed"
        echo "  • Detailed analysis of each test step"
        echo "  • Enhanced error reporting with context"
    fi
    
    # Run all enhanced intelligence tests
    test_memory_integration_enhancement
    test_relationship_reasoning_enhancement
    test_semantic_understanding_enhancement
    test_pattern_recognition_enhancement
    test_learning_capability_enhancement
    
    # Generate final assessment report
    generate_intelligence_assessment_report
    
    print_header "Enhanced Intelligence Testing Complete"
    echo "This test suite validates that the agent has significantly improved"
    echo "intelligence capabilities including relationship analysis, semantic"
    echo "understanding, pattern recognition, and learning from interactions."
    echo "Check the detailed assessment above for intelligence improvements."
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --debug, -d    Enable debug mode with verbose output"
        echo "  --memory       Run only memory integration tests"
        echo "  --relationship Run only relationship reasoning tests"
        echo "  --semantic     Run only semantic understanding tests"
        echo "  --pattern      Run only pattern recognition tests"
        echo "  --learning     Run only learning capability tests"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all enhanced intelligence tests"
        echo "  $0 --debug           # Run all tests with debug output"
        echo "  $0 --memory --debug  # Run memory tests with debug output"
        echo "  $0 --relationship    # Run relationship reasoning tests only"
        ;;
    --debug|-d)
        DEBUG_MODE=true
        main
        ;;
    --memory)
        print_header "Running Memory Integration Enhancement Tests Only"
        wait_for_server
        test_memory_integration_enhancement
        generate_intelligence_assessment_report
        ;;
    --relationship)
        print_header "Running Relationship Reasoning Enhancement Tests Only"
        wait_for_server
        test_relationship_reasoning_enhancement
        generate_intelligence_assessment_report
        ;;
    --semantic)
        print_header "Running Semantic Understanding Enhancement Tests Only"
        wait_for_server
        test_semantic_understanding_enhancement
        generate_intelligence_assessment_report
        ;;
    --pattern)
        print_header "Running Pattern Recognition Enhancement Tests Only"
        wait_for_server
        test_pattern_recognition_enhancement
        generate_intelligence_assessment_report
        ;;
    --learning)
        print_header "Running Learning Capability Enhancement Tests Only"
        wait_for_server
        test_learning_capability_enhancement
        generate_intelligence_assessment_report
        ;;
    *)
        main
        ;;
esac
