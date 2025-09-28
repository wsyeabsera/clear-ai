#!/bin/bash

# Test Intent Classifier API Endpoints
# This script tests the intent classification functionality

BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api/intent-classifier"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to make HTTP requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_status "Testing: $description"
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    echo "---"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$endpoint")
    fi
    
    # Extract HTTP code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo "HTTP Code: $http_code"
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        print_success "Request successful"
    else
        print_error "Request failed with HTTP $http_code"
    fi
    echo ""
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. JSON responses won't be formatted."
    print_warning "Install jq with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
fi

# Check if server is running
print_status "Checking if server is running..."
if curl -s "$BASE_URL/api/health" > /dev/null; then
    print_success "Server is running"
else
    print_error "Server is not running. Please start the server first:"
    echo "  cd packages/server && npm run dev"
    exit 1
fi

echo "=========================================="
echo "Testing Intent Classifier API Endpoints"
echo "=========================================="
echo ""

# Test 1: Initialize Intent Classifier Service
print_status "=== Test 1: Initialize Intent Classifier Service ==="
make_request "POST" "$API_BASE/initialize" "" "Initialize intent classifier service"

echo ""

# Test 2: Get Available Intent Types
print_status "=== Test 2: Get Available Intent Types ==="
make_request "GET" "$API_BASE/intent-types" "" "Get available intent types and descriptions"

echo ""

# Test 3: Classify Single Query - Tool Execution
print_status "=== Test 3: Classify Tool Execution Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Calculate 5 + 3",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a mathematical calculation query"

echo ""

# Test 4: Classify Single Query - Memory Chat
print_status "=== Test 4: Classify Memory Chat Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "What did we discuss yesterday about machine learning?",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a memory-based conversation query"

echo ""

# Test 5: Classify Single Query - Hybrid
print_status "=== Test 5: Classify Hybrid Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Based on my preferences, find a good restaurant nearby",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a hybrid query (memory + tools)"

echo ""

# Test 6: Classify Single Query - Knowledge Search
print_status "=== Test 6: Classify Knowledge Search Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "What do I know about Python programming?",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a knowledge search query"

echo ""

# Test 7: Classify Single Query - General Conversation
print_status "=== Test 7: Classify General Conversation Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Hello, how are you doing today?",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a general conversation query"

echo ""

# Test 8: Batch Classification
print_status "=== Test 8: Batch Classification ==="
make_request "POST" "$API_BASE/classify-batch" '{
    "queries": [
        "Calculate 10 * 5",
        "What did we talk about last week?",
        "Make an API call to get weather data",
        "Remember that I like coffee",
        "Hello there!"
    ],
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify multiple queries in batch"

echo ""

# Test 8.5: Challenging Ambiguous Queries
print_status "=== Test 8.5: Challenging Ambiguous Queries ==="
make_request "POST" "$API_BASE/classify-batch" '{
    "queries": [
        "Can you help me with something?",
        "Remember that I like coffee and then find me a cafe",
        "What can you calculate and what do you remember?",
        "asdfghjkl",
        "Help me with everything"
    ],
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify challenging ambiguous queries"

echo ""

# Test 9: Run Comprehensive Test
print_status "=== Test 9: Run Comprehensive Test Suite ==="
make_request "POST" "$API_BASE/test" "" "Run comprehensive test with sample queries"

echo ""

# Test 10: Test with User Context
print_status "=== Test 10: Test with User Context ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "What tools can I use?",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true,
        "userContext": {
            "userId": "test-user-123",
            "sessionId": "test-session-456"
        }
    }
}' "Classify query with user context"

echo ""

# Test 11: Test API Call Intent
print_status "=== Test 11: Test API Call Intent ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Make an HTTP GET request to https://jsonplaceholder.typicode.com/users/1",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify an API call request"

echo ""

# Test 12: Test File Operations Intent
print_status "=== Test 12: Test File Operations Intent ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Read the contents of /path/to/file.txt",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a file operation request"

echo ""

# Test 13: Test Ambiguous Query
print_status "=== Test 13: Test Ambiguous Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Can you help me with something?",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify an ambiguous query that should be unknown"

echo ""

# Test 14: Test Complex Hybrid Query
print_status "=== Test 14: Test Complex Hybrid Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "Remember that I like coffee and then find me a cafe nearby",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify a complex hybrid query (memory + tool execution)"

echo ""

# Test 15: Test Gibberish/Unknown Query
print_status "=== Test 15: Test Gibberish/Unknown Query ==="
make_request "POST" "$API_BASE/classify" '{
    "query": "asdfghjkl qwerty",
    "options": {
        "model": "openai",
        "temperature": 0.1,
        "includeAvailableTools": true
    }
}' "Classify gibberish that should be unknown"

echo ""

print_status "=========================================="
print_success "Intent Classifier API Testing Complete!"
print_status "=========================================="

echo ""
print_status "Summary of endpoints tested:"
echo "  ✓ POST /api/intent-classifier/initialize"
echo "  ✓ GET  /api/intent-classifier/intent-types"
echo "  ✓ POST /api/intent-classifier/classify"
echo "  ✓ POST /api/intent-classifier/classify-batch"
echo "  ✓ POST /api/intent-classifier/test"

echo ""
print_status "Intent types tested:"
echo "  ✓ tool_execution (mathematical calculations, API calls, file operations)"
echo "  ✓ memory_chat (conversation with memory context)"
echo "  ✓ hybrid (tools + memory context)"
echo "  ✓ knowledge_search (searching stored knowledge)"
echo "  ✓ conversation (general chat)"
echo "  ✓ unknown (ambiguous, unclear, or gibberish queries)"

echo ""
print_status "Features tested:"
echo "  ✓ Single query classification"
echo "  ✓ Batch query classification"
echo "  ✓ User context integration"
echo "  ✓ Tool availability detection"
echo "  ✓ Comprehensive test suite"
echo "  ✓ Different query complexity levels"
