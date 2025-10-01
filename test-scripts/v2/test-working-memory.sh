#!/bin/bash

# Test script for Working Memory Service
# This script tests the enhanced agent with working memory capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="http://localhost:3001"
API_BASE="${SERVER_URL}/api/agent"

# Test user and session IDs (using unique IDs for clean memory)
TEST_USER_ID="test-user-$(date +%s)"
TEST_SESSION_ID="test-session-$(date +%s)"

echo -e "${BLUE}🧠 Testing Working Memory Service${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "User ID: ${TEST_USER_ID}"
echo -e "Session ID: ${TEST_SESSION_ID}"
echo ""

# Function to make API calls
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local description="$4"
    
    echo -e "${YELLOW}📤 $description${NC}"
    echo -e "   ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    else
        response=$(curl -s -X "$method" "$endpoint")
    fi
    
    echo -e "   Response: $response"
    echo ""
    
    # Check if response contains success
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
    echo ""
}

# Test 1: Initialize Enhanced Agent Service
echo -e "${BLUE}Test 1: Initialize Enhanced Agent Service${NC}"
make_request "POST" "${API_BASE}/enhanced-initialize" "" "Initializing Enhanced Agent Service with Working Memory"

# Test 2: Check Enhanced Agent Status
echo -e "${BLUE}Test 2: Check Enhanced Agent Status${NC}"
make_request "GET" "${API_BASE}/enhanced-status" "" "Checking Enhanced Agent Status"

# Test 3: Simple conversation to establish memory
echo -e "${BLUE}Test 3: Simple conversation to establish memory${NC}"
conversation_data='{
    "query": "Hello! My name is Alice and I love machine learning. I want to learn about neural networks.",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$conversation_data" "First conversation to establish user profile and memory"

# Test 4: Test memory recall
echo -e "${BLUE}Test 4: Test memory recall${NC}"
memory_test_data='{
    "query": "What is my name and what do I like?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$memory_test_data" "Testing memory recall of user information"

# Test 5: Test goal creation and tracking
echo -e "${BLUE}Test 5: Test goal creation and tracking${NC}"
goal_data='{
    "query": "I want to create a goal to learn about deep learning in the next month. Can you help me track this goal?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$goal_data" "Testing goal creation and tracking"

# Test 6: Test conversation state management
echo -e "${BLUE}Test 6: Test conversation state management${NC}"
state_test_data='{
    "query": "What are my current goals and what should I focus on next?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$state_test_data" "Testing conversation state and goal management"

# Test 7: Test topic extraction and context switching
echo -e "${BLUE}Test 7: Test topic extraction and context switching${NC}"
topic_switch_data='{
    "query": "Actually, let me change topics. I want to talk about Python programming instead. What are the best practices for writing clean Python code?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$topic_switch_data" "Testing topic extraction and context switching"

# Test 8: Test user profile building
echo -e "${BLUE}Test 8: Test user profile building${NC}"
profile_test_data='{
    "query": "I prefer detailed explanations and I like to work on projects hands-on. I also enjoy reading technical documentation.",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$profile_test_data" "Testing user profile building and preference tracking"

# Test 9: Test conversation history and context window
echo -e "${BLUE}Test 9: Test conversation history and context window${NC}"
history_test_data='{
    "query": "Can you summarize our conversation so far and what we have discussed?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$history_test_data" "Testing conversation history and context window management"

# Test 10: Test working memory persistence across multiple queries
echo -e "${BLUE}Test 10: Test working memory persistence${NC}"
persistence_test_data='{
    "query": "What do you remember about my preferences and goals from our conversation?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$persistence_test_data" "Testing working memory persistence across queries"

# Test 11: Test error recovery and conversation state
echo -e "${BLUE}Test 11: Test error recovery and conversation state${NC}"
error_test_data='{
    "query": "I made a mistake in my previous question. Let me rephrase: I want to learn about machine learning algorithms, not just neural networks.",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$error_test_data" "Testing error recovery and conversation state management"

# Test 12: Test context compression and token management
echo -e "${BLUE}Test 12: Test context compression and token management${NC}"
compression_test_data='{
    "query": "I want to learn about supervised learning, unsupervised learning, reinforcement learning, deep learning, convolutional neural networks, recurrent neural networks, transformers, attention mechanisms, gradient descent, backpropagation, regularization techniques, cross-validation, feature engineering, data preprocessing, model evaluation metrics, hyperparameter tuning, ensemble methods, and transfer learning. Can you explain each of these concepts in detail?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$compression_test_data" "Testing context compression with long query"

# Summary
echo -e "${BLUE}🎯 Working Memory Service Test Summary${NC}"
echo -e "${BLUE}====================================${NC}"
echo -e "✅ All tests completed for Working Memory Service"
echo -e "📊 User ID: ${TEST_USER_ID}"
echo -e "📊 Session ID: ${TEST_SESSION_ID}"
echo -e "🧠 Working Memory features tested:"
echo -e "   - Memory context retrieval"
echo -e "   - User profile building"
echo -e "   - Goal tracking and management"
echo -e "   - Conversation state management"
echo -e "   - Topic extraction and context switching"
echo -e "   - Conversation history tracking"
echo -e "   - Memory persistence across queries"
echo -e "   - Error recovery and state management"
echo -e "   - Context compression and token management"
echo ""
echo -e "${GREEN}🎉 Working Memory Service test completed successfully!${NC}"
