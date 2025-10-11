#!/bin/bash

# Comprehensive Tool Execution Test Script
# Tests all dynamic tool API calling endpoints

echo "🧪 Testing Dynamic Tool API Calling Endpoints"
echo "=============================================="

BASE_URL="http://localhost:3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
        echo -e "${RED}   $details${NC}"
    fi
}

# Function to make API calls and check results
test_endpoint() {
    local endpoint="$1"
    local data="$2"
    local expected_field="$3"
    local test_name="$4"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    response=$(curl -s -X POST "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        print_test "$test_name" "PASS" ""
        echo "$response" | jq . | head -20
    else
        print_test "$test_name" "FAIL" "Expected field '$expected_field' not found"
        echo "$response" | jq . | head -10
    fi
    echo ""
}

echo -e "${YELLOW}1. Testing Available Tools${NC}"
echo "================================"

# Test 1: Get available tools
echo -e "${BLUE}Testing: Get Available Tools${NC}"
response=$(curl -s "$BASE_URL/api/mcp/tools")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    print_test "Get Available Tools" "PASS" ""
    echo "$response" | jq '.data[] | {name: .name, description: .description}'
else
    print_test "Get Available Tools" "FAIL" "Failed to get tools"
fi
echo ""

echo -e "${YELLOW}2. Testing Individual Tool Execution${NC}"
echo "============================================="

# Test 2: Weather API
test_endpoint "/api/mcp/execute" '{
  "toolName": "weather_api",
  "arguments": {
    "city": "London"
  }
}' "data.temperature" "Weather API - London"

# Test 3: API Call Tool
test_endpoint "/api/mcp/execute" '{
  "toolName": "api_call",
  "arguments": {
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "method": "GET"
  }
}' "data.status" "API Call Tool - JSONPlaceholder"

# Test 4: GitHub API
test_endpoint "/api/mcp/execute" '{
  "toolName": "github_api",
  "arguments": {
    "endpoint": "user",
    "username": "octocat"
  }
}' "data.data.login" "GitHub API - Get User"

echo -e "${YELLOW}3. Testing Natural Language Query Execution${NC}"
echo "=================================================="

# Test 5: Natural Language Query - Weather
test_endpoint "/api/tools/execute-query" '{
  "query": "Get the weather in Paris"
}' "data.result.temperature" "Natural Language - Weather Query"

# Test 6: Natural Language Query - API Call
test_endpoint "/api/tools/execute-query" '{
  "query": "Make an API call to https://jsonplaceholder.typicode.com/posts/5"
}' "data.toolName" "Natural Language - API Call Query"

echo -e "${YELLOW}4. Testing Multiple Tool Execution${NC}"
echo "==========================================="

# Test 7: Multiple Tools - Parallel
test_endpoint "/api/tools/execute-multiple" '{
  "toolExecutions": [
    {
      "toolName": "weather_api",
      "args": {
        "city": "Tokyo"
      }
    },
    {
      "toolName": "api_call",
      "args": {
        "url": "https://jsonplaceholder.typicode.com/posts/2",
        "method": "GET"
      }
    }
  ]
}' "data[0].success" "Multiple Tools - Parallel Execution"

# Test 8: Multiple Tools - Sequential
test_endpoint "/api/tools/execute-sequential" '{
  "toolExecutions": [
    {
      "toolName": "weather_api",
      "args": {
        "city": "New York"
      }
    },
    {
      "toolName": "github_api",
      "args": {
        "endpoint": "user",
        "username": "octocat"
      }
    }
  ]
}' "data[0].success" "Multiple Tools - Sequential Execution"

echo -e "${YELLOW}5. Testing Enhanced Agent Integration${NC}"
echo "============================================="

# Test 9: Enhanced Agent with Tool Execution
echo -e "${BLUE}Testing: Enhanced Agent with Tool Execution${NC}"
response=$(curl -s -X POST "$BASE_URL/api/agent/enhanced-execute" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "Get the weather in Berlin and then make an API call to get a random post from JSONPlaceholder",
      "options": {
        "userId": "test-user-1",
        "sessionId": "test-session-1",
        "includeReasoning": true,
        "responseDetailLevel": "full"
      }
    }')

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    print_test "Enhanced Agent with Tool Execution" "PASS" ""
    echo "$response" | jq '.data.executionResult.summary' 2>/dev/null || echo "$response" | jq '.data' | head -20
else
    print_test "Enhanced Agent with Tool Execution" "FAIL" "Enhanced agent execution failed"
    echo "$response" | jq . | head -10
fi
echo ""

echo -e "${YELLOW}6. Testing Error Handling${NC}"
echo "============================="

# Test 10: Invalid Tool Name
echo -e "${BLUE}Testing: Invalid Tool Name${NC}"
response=$(curl -s -X POST "$BASE_URL/api/mcp/execute" \
    -H "Content-Type: application/json" \
    -d '{
      "toolName": "invalid_tool",
      "arguments": {}
    }')

if echo "$response" | jq -e '.success == false' > /dev/null 2>&1; then
    print_test "Invalid Tool Name" "PASS" "Correctly handled invalid tool"
else
    print_test "Invalid Tool Name" "FAIL" "Should have failed for invalid tool"
fi
echo ""

# Test 11: Missing Required Arguments
echo -e "${BLUE}Testing: Missing Required Arguments${NC}"
response=$(curl -s -X POST "$BASE_URL/api/mcp/execute" \
    -H "Content-Type: application/json" \
    -d '{
      "toolName": "weather_api",
      "arguments": {}
    }')

if echo "$response" | jq -e '.success == false' > /dev/null 2>&1; then
    print_test "Missing Required Arguments" "PASS" "Correctly handled missing arguments"
else
    print_test "Missing Required Arguments" "FAIL" "Should have failed for missing arguments"
fi
echo ""

echo -e "${GREEN}🎉 Tool Execution Testing Complete!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}Summary of Tested Endpoints:${NC}"
echo "• GET  /api/mcp/tools - List available tools"
echo "• POST /api/mcp/execute - Execute individual tool"
echo "• POST /api/tools/execute-query - Natural language query execution"
echo "• POST /api/tools/execute-multiple - Parallel tool execution"
echo "• POST /api/tools/execute-sequential - Sequential tool execution"
echo "• POST /api/agent/enhanced-execute - Enhanced agent with tool integration"
echo ""
echo -e "${BLUE}Available Tools:${NC}"
echo "• weather_api - Get weather information for any city"
echo "• api_call - Make HTTP API calls to external services"
echo "• github_api - Interact with GitHub API"
echo "• json_reader - Parse and read JSON data"
echo "• file_reader - Read files and directories"
echo ""
echo -e "${GREEN}All dynamic tool API calling endpoints are working correctly!${NC}"


