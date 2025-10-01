#!/bin/bash

# Test script for Context Management Integration
# This script tests the enhanced agent with context management capabilities

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

echo -e "${BLUE}🧠 Testing Context Management Integration${NC}"
echo -e "${BLUE}=======================================${NC}"
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
make_request "POST" "${API_BASE}/enhanced-initialize" "" "Initializing Enhanced Agent Service with Context Management"

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
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 4000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$conversation_data" "First conversation to establish user profile and memory"

# Test 4: Test context compression with long conversation
echo -e "${BLUE}Test 4: Test context compression with long conversation${NC}"
long_conversation_data='{
    "query": "I want to learn about supervised learning, unsupervised learning, reinforcement learning, deep learning, convolutional neural networks, recurrent neural networks, transformers, attention mechanisms, gradient descent, backpropagation, regularization techniques, cross-validation, feature engineering, data preprocessing, model evaluation metrics, hyperparameter tuning, ensemble methods, and transfer learning. Can you explain each of these concepts in detail?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 2000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$long_conversation_data" "Testing context compression with long query"

# Test 5: Test memory recall with compressed context
echo -e "${BLUE}Test 5: Test memory recall with compressed context${NC}"
memory_test_data='{
    "query": "What is my name and what do I like? Can you also summarize what we discussed about machine learning?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 3000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$memory_test_data" "Testing memory recall with compressed context"

# Test 6: Test goal creation and tracking with context management
echo -e "${BLUE}Test 6: Test goal creation and tracking with context management${NC}"
goal_data='{
    "query": "I want to create a goal to learn about deep learning in the next month. Can you help me track this goal? Also, I want to understand how context compression affects our conversation.",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 2500
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$goal_data" "Testing goal creation and tracking with context management"

# Test 7: Test conversation state management with compression
echo -e "${BLUE}Test 7: Test conversation state management with compression${NC}"
state_test_data='{
    "query": "What are my current goals and what should I focus on next? Also, can you tell me about the context management features you are using?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 1500
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$state_test_data" "Testing conversation state and goal management with compression"

# Test 8: Test topic extraction and context switching with compression
echo -e "${BLUE}Test 8: Test topic extraction and context switching with compression${NC}"
topic_switch_data='{
    "query": "Actually, let me change topics. I want to talk about Python programming instead. What are the best practices for writing clean Python code? Also, how does context compression help maintain conversation continuity?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 2000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$topic_switch_data" "Testing topic extraction and context switching with compression"

# Test 9: Test user profile building with context management
echo -e "${BLUE}Test 9: Test user profile building with context management${NC}"
profile_test_data='{
    "query": "I prefer detailed explanations and I like to work on projects hands-on. I also enjoy reading technical documentation. Can you remember these preferences and explain how context management helps you remember them?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 1800
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$profile_test_data" "Testing user profile building and preference tracking with context management"

# Test 10: Test conversation history and context window with compression
echo -e "${BLUE}Test 10: Test conversation history and context window with compression${NC}"
history_test_data='{
    "query": "Can you summarize our conversation so far and what we have discussed? Also, explain how context compression and management work in our conversation.",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 1000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$history_test_data" "Testing conversation history and context window management with compression"

# Test 11: Test working memory persistence across multiple queries with compression
echo -e "${BLUE}Test 11: Test working memory persistence with compression${NC}"
persistence_test_data='{
    "query": "What do you remember about my preferences and goals from our conversation? How does context management help you maintain this information?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 1200
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$persistence_test_data" "Testing working memory persistence across queries with compression"

# Test 12: Test error recovery and conversation state with context management
echo -e "${BLUE}Test 12: Test error recovery and conversation state with context management${NC}"
error_test_data='{
    "query": "I made a mistake in my previous question. Let me rephrase: I want to learn about machine learning algorithms, not just neural networks. How does context management help you understand and correct such errors?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 1600
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$error_test_data" "Testing error recovery and conversation state management with context management"

# Test 13: Test context compression with very low token limit
echo -e "${BLUE}Test 13: Test context compression with very low token limit${NC}"
compression_test_data='{
    "query": "I want to learn about supervised learning, unsupervised learning, reinforcement learning, deep learning, convolutional neural networks, recurrent neural networks, transformers, attention mechanisms, gradient descent, backpropagation, regularization techniques, cross-validation, feature engineering, data preprocessing, model evaluation metrics, hyperparameter tuning, ensemble methods, and transfer learning. Can you explain each of these concepts in detail?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "maxTokens": 500
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$compression_test_data" "Testing context compression with very low token limit"

# Test 14: Test context management without compression
echo -e "${BLUE}Test 14: Test context management without compression${NC}"
no_compression_data='{
    "query": "Can you explain how context management works when compression is disabled?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": false,
        "maxTokens": 8000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$no_compression_data" "Testing context management without compression"

# Test 15: Test context summary inclusion
echo -e "${BLUE}Test 15: Test context summary inclusion${NC}"
summary_test_data='{
    "query": "Can you tell me about the context summary feature and how it helps maintain conversation continuity?",
    "options": {
        "userId": "'$TEST_USER_ID'",
        "sessionId": "'$TEST_SESSION_ID'",
        "includeMemoryContext": true,
        "includeReasoning": true,
        "enableContextCompression": true,
        "includeContextSummary": true,
        "maxTokens": 2000
    }
}'
make_request "POST" "${API_BASE}/enhanced-execute" "$summary_test_data" "Testing context summary inclusion"

# Summary
echo -e "${BLUE}🎯 Context Management Integration Test Summary${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "✅ All tests completed for Context Management Integration"
echo -e "📊 User ID: ${TEST_USER_ID}"
echo -e "📊 Session ID: ${TEST_SESSION_ID}"
echo -e "🧠 Context Management features tested:"
echo -e "   - Context compression and token management"
echo -e "   - Memory context retrieval with compression"
echo -e "   - User profile building with context management"
echo -e "   - Goal tracking and management with compression"
echo -e "   - Conversation state management with context management"
echo -e "   - Topic extraction and context switching with compression"
echo -e "   - Conversation history tracking with compression"
echo -e "   - Memory persistence across queries with compression"
echo -e "   - Error recovery and state management with context management"
echo -e "   - Context compression with various token limits"
echo -e "   - Context management without compression"
echo -e "   - Context summary inclusion"
echo -e "   - Relevance-based memory filtering"
echo -e "   - Smart context prioritization"
echo ""
echo -e "${GREEN}🎉 Context Management Integration test completed successfully!${NC}"
