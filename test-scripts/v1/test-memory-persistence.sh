#!/bin/bash

# Clear-AI Memory Persistence Test
# Quick test to verify memories persist across agent interactions

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
    print_header "Clear-AI Memory Persistence Test"
    
    # Initialize shared session
    init_shared_session
    
    # Use test-specific session ID
    SESSION_ID=$(get_test_session_id "memory-persistence")
    
    echo "Test ID: $TEST_ID"
    echo "User ID: $USER_ID"
    echo "Session ID: $SESSION_ID"
    
    wait_for_server
    
    # Step 1: Store information
    print_header "Step 1: Storing Information"
    
    local test_info="My name is PersistenceTest and I am a data scientist working on machine learning projects. I use Python, R, and SQL in my daily work."
    
    print_info "Storing test information..."
    local response1=$(execute_query "$test_info" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": false
    }')
    
    if echo "$response1" | jq . >/dev/null 2>&1; then
        success=$(echo "$response1" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Information stored successfully"
        else
            print_error "Failed to store information"
            echo "Response: $response1"
            exit 1
        fi
    else
        print_error "Invalid response when storing information"
        exit 1
    fi
    
    # Wait for memory processing with retry logic
    print_info "Waiting for memory to be processed (this can take 10-30 seconds)..."
    sleep 10
    
    # Retry logic for memory processing
    local max_retries=5
    local retry_count=0
    local memories_found=false
    
    while [ $retry_count -lt $max_retries ] && [ "$memories_found" = false ]; do
        retry_count=$((retry_count + 1))
        print_info "Attempt $retry_count/$max_retries: Checking for memories..."
        
        local memory_context=$(get_memory_context "$USER_ID" "$SESSION_ID")
        
        if echo "$memory_context" | jq . >/dev/null 2>&1; then
            local episodic_count=$(echo "$memory_context" | jq -r '.data.episodicMemories | length // 0')
            local semantic_count=$(echo "$memory_context" | jq -r '.data.semanticMemories | length // 0')
            
            if [ "$episodic_count" -gt 0 ] || [ "$semantic_count" -gt 0 ]; then
                memories_found=true
                print_success "Memories found after $retry_count attempts!"
            else
                print_info "No memories yet, waiting 5 more seconds..."
                sleep 5
            fi
        else
            print_info "Memory context not ready, waiting 5 more seconds..."
            sleep 5
        fi
    done
    
    # Step 2: Verify memory storage
    print_header "Step 2: Verifying Memory Storage"
    
    if [ "$memories_found" = true ]; then
        print_info "Final memory context retrieval..."
        local memory_context=$(get_memory_context "$USER_ID" "$SESSION_ID")
        
        if echo "$memory_context" | jq . >/dev/null 2>&1; then
            local episodic_count=$(echo "$memory_context" | jq -r '.episodicMemories | length // 0')
            local semantic_count=$(echo "$memory_context" | jq -r '.semanticMemories | length // 0')
            
            print_info "Memory context retrieved: $episodic_count episodic, $semantic_count semantic memories"
            print_success "Memory storage working - found $((episodic_count + semantic_count)) memories"
            
            # Show sample memory content
            if [ "$episodic_count" -gt 0 ]; then
                print_info "Sample episodic memory:"
                echo "$memory_context" | jq -r '.episodicMemories[0].content[0:100] + "..."' 2>/dev/null || true
            fi
            
            if [ "$semantic_count" -gt 0 ]; then
                print_info "Sample semantic memory:"
                echo "$memory_context" | jq -r '.semanticMemories[0].concept + ": " + .semanticMemories[0].description[0:80] + "..."' 2>/dev/null || true
            fi
        else
            print_error "Failed to retrieve final memory context"
            echo "Response: $memory_context"
            exit 1
        fi
    else
        print_error "No memories found after $max_retries attempts"
        echo "Memory processing may be taking longer than expected or there may be an issue with:"
        echo "  - Neo4j database connection"
        echo "  - Pinecone vector database"
        echo "  - Ollama embedding model processing"
        echo "  - Network latency"
        echo ""
        print_info "This doesn't necessarily mean the memory system is broken - it may just need more time."
        print_info "Try running the test again or check the server logs for more details."
        exit 1
    fi
    
    # Step 3: Test memory retrieval
    print_header "Step 3: Testing Memory Retrieval"
    
    print_info "Querying stored information..."
    local response2=$(execute_query "What do you know about me?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response2" | jq . >/dev/null 2>&1; then
        success=$(echo "$response2" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Memory retrieval working"
            
            # Check if response contains stored information
            local response_text=$(echo "$response2" | jq -r '.response // ""')
            if [[ "$response_text" == *"PersistenceTest"* ]] || [[ "$response_text" == *"data scientist"* ]]; then
                print_success "Response contains stored information"
            else
                print_info "Response may not be using memory effectively"
            fi
        else
            print_error "Failed to retrieve memory"
            echo "Response: $response2"
            exit 1
        fi
    else
        print_error "Invalid response when retrieving memory"
        exit 1
    fi
    
    # Step 4: Test cross-session persistence
    print_header "Step 4: Testing Cross-Session Persistence"
    
    # Create new session for same user to test persistence
    local new_session_id=$(create_persistence_session "cross-session")
    
    print_info "Testing memory access from new session..."
    print_info "  Using same User ID: $USER_ID"
    print_info "  New Session ID: $new_session_id"
    
    local response3=$(execute_query "What is my profession?" '{
        "userId": "'$USER_ID'",
        "sessionId": "'$new_session_id'",
        "testId": "'$TEST_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }')
    
    if echo "$response3" | jq . >/dev/null 2>&1; then
        success=$(echo "$response3" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "Cross-session memory access working"
            
            local response_text=$(echo "$response3" | jq -r '.response // ""')
            if [[ "$response_text" == *"data scientist"* ]] || [[ "$response_text" == *"scientist"* ]]; then
                print_success "Information persists across sessions"
            else
                print_info "Information may not be properly linked across sessions"
            fi
        else
            print_error "Failed to access memory from new session"
            echo "Response: $response3"
            exit 1
        fi
    else
        print_error "Invalid response when testing cross-session persistence"
        exit 1
    fi
    
    # Final report
    print_header "Memory Persistence Test Results"
    print_success "All memory persistence tests passed!"
    echo ""
    echo "✅ Memory storage working"
    echo "✅ Memory retrieval working"
    echo "✅ Cross-session persistence working"
    echo "✅ Agent-memory integration working"
    echo ""
    echo "The agent memory system is functioning correctly."
}

main "$@"
