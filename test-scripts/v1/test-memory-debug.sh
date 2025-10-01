#!/bin/bash

# Clear-AI Memory Debug Test
# Debug memory storage and retrieval issues

set -e

BASE_URL="http://localhost:3001"

# Source shared session configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared-test-session.sh"

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

print_debug() {
    echo -e "${BLUE}🔍 $1${NC}"
}

# Execute agent query
execute_query() {
    local query=$1
    local options=$2
    
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "query": "'"$query"'",
            "options": '"$options"'
        }' \
        "$BASE_URL/api/agent/execute" 2>/dev/null
}

# Get memory context
get_memory_context() {
    curl -s -X GET \
        "$BASE_URL/api/memory/context/$1/$2" 2>/dev/null
}

# Search memories
search_memories() {
    local user_id=$1
    local query=$2
    
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "userId": "'$user_id'",
            "query": "'"$query"'",
            "type": "both",
            "limit": 20
        }' \
        "$BASE_URL/api/memory/search" 2>/dev/null
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
    exit 1
}

main() {
    print_header "Clear-AI Memory Debug Test"
    
    # Initialize shared session
    init_shared_session
    
    # Use test-specific session ID
    SESSION_ID=$(get_test_session_id "memory-debug")
    
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    
    wait_for_server
    
    # Step 1: Initialize memory service
    print_header "Step 1: Initialize Memory Service"
    print_info "Initializing memory service..."
    
    local init_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        "$BASE_URL/api/memory-chat/initialize" 2>/dev/null)
    
    if echo "$init_response" | jq . >/dev/null 2>&1; then
        local success=$(echo "$init_response" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Memory service initialized"
            echo "Response: $(echo "$init_response" | jq -c .)"
        else
            print_error "Memory service initialization failed"
            echo "Response: $init_response"
            exit 1
        fi
    else
        print_error "Invalid response from memory service initialization"
        echo "Response: $init_response"
        exit 1
    fi
    
    # Step 2: Store information via agent
    print_header "Step 2: Store Information via Agent"
    
    local test_info="My name is DebugTest and I am a software engineer specializing in AI and machine learning. I work at TechCorp and have 8 years of experience in Python, JavaScript, and TypeScript."
    
    print_info "Storing test information via agent..."
    local response1=$(execute_query "$test_info" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        local success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Information stored via agent"
            print_debug "Agent response: $(echo "$response1" | jq -r '.data.response // "No response"')"
            
            # Check if agent response mentions memory
            local response_text=$(echo "$response1" | jq -r '.data.response // ""')
            if [[ "$response_text" == *"remember"* ]] || [[ "$response_text" == *"stored"* ]]; then
                print_success "Agent response indicates memory storage"
            else
                print_info "Agent response may not explicitly mention memory storage"
            fi
        else
            print_error "Failed to store information via agent"
            echo "Response: $response1"
            exit 1
        fi
    else
        print_error "Invalid response when storing information"
        echo "Response: $response1"
        exit 1
    fi
    
    # Step 3: Wait and check memory context
    print_header "Step 3: Check Memory Context"
    
    print_info "Waiting for memory to be processed..."
    sleep 5
    
    print_info "Retrieving memory context..."
    local memory_context=$(get_memory_context "$USER_ID" "$SESSION_ID")
    
    print_debug "Raw memory context response:"
    echo "$memory_context" | jq . 2>/dev/null || echo "$memory_context"
    
    if echo "$memory_context" | jq . >/dev/null 2>&1; then
        local success=$(echo "$memory_context" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            local episodic_count=$(echo "$memory_context" | jq -r '.data.episodicMemories | length // 0')
            local semantic_count=$(echo "$memory_context" | jq -r '.data.semanticMemories | length // 0')
            
            print_info "Memory context retrieved successfully"
            print_info "Episodic memories: $episodic_count"
            print_info "Semantic memories: $semantic_count"
            
            if [ "$episodic_count" -gt 0 ] || [ "$semantic_count" -gt 0 ]; then
                print_success "Memory storage working - found $((episodic_count + semantic_count)) memories"
                
                # Show sample memories
                if [ "$episodic_count" -gt 0 ]; then
                    print_info "Sample episodic memories:"
                    echo "$memory_context" | jq -r '.data.episodicMemories[] | "  - " + .content[0:100] + "..."' 2>/dev/null || true
                fi
                
                if [ "$semantic_count" -gt 0 ]; then
                    print_info "Sample semantic memories:"
                    echo "$memory_context" | jq -r '.data.semanticMemories[] | "  - " + .concept + ": " + .description[0:80] + "..."' 2>/dev/null || true
                fi
            else
                print_error "No memories found in context"
                
                # Try alternative approach - search memories
                print_info "Trying memory search as alternative..."
                local search_results=$(search_memories "$USER_ID" "DebugTest")
                
                if echo "$search_results" | jq . >/dev/null 2>&1; then
                    local search_success=$(echo "$search_results" | jq -r '.success // false')
                    if [ "$search_success" = "true" ]; then
                        local episodic_search=$(echo "$search_results" | jq -r '.data.episodic.memories | length // 0')
                        local semantic_search=$(echo "$search_results" | jq -r '.data.semantic.memories | length // 0')
                        
                        print_info "Memory search found: $episodic_search episodic, $semantic_search semantic"
                        
                        if [ "$episodic_search" -gt 0 ] || [ "$semantic_search" -gt 0 ]; then
                            print_success "Memories found via search - storage is working!"
                        else
                            print_error "No memories found via search either"
                        fi
                    else
                        print_error "Memory search failed"
                    fi
                fi
            fi
        else
            print_error "Memory context retrieval failed"
            local error_msg=$(echo "$memory_context" | jq -r '.message // "Unknown error"')
            echo "Error: $error_msg"
        fi
    else
        print_error "Invalid response from memory context retrieval"
        echo "Raw response: $memory_context"
    fi
    
    # Step 4: Test memory retrieval via agent
    print_header "Step 4: Test Memory Retrieval via Agent"
    
    print_info "Testing memory retrieval via agent..."
    local response2=$(execute_query "What do you know about me?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response2" | jq . >/dev/null 2>&1; then
        local success=$(echo "$response2" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Memory retrieval query executed successfully"
            
            local response_text=$(echo "$response2" | jq -r '.data.response // ""')
            print_debug "Agent response to memory query:"
            echo "$response_text"
            
            # Check if response contains stored information
            if [[ "$response_text" == *"DebugTest"* ]] || [[ "$response_text" == *"software engineer"* ]] || [[ "$response_text" == *"TechCorp"* ]]; then
                print_success "Agent successfully retrieved stored information"
            else
                print_info "Agent response may not contain stored information"
            fi
            
            # Check reasoning for memory context usage
            local reasoning=$(echo "$response2" | jq -r '.data.reasoning // ""')
            if [[ "$reasoning" == *"memory"* ]] || [[ "$reasoning" == *"context"* ]]; then
                print_success "Agent reasoning mentions memory context usage"
            else
                print_info "Agent reasoning may not mention memory context"
            fi
        else
            print_error "Memory retrieval query failed"
            echo "Response: $response2"
        fi
    else
        print_error "Invalid response from memory retrieval query"
        echo "Response: $response2"
    fi
    
    print_header "Memory Debug Test Complete"
    echo "This test helps identify where the memory system might have issues."
    echo "Check the output above for specific error messages and responses."
}

main "$@"
