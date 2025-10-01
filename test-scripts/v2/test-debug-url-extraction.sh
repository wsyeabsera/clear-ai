#!/bin/bash

# Test script to debug URL extraction specifically
# This will help us see exactly what URL is being generated

set -e

API_BASE="http://localhost:3001"
USER_ID="test-user-debug-url"
SESSION_ID="session-$(date +%s)"

echo "🔍 Debugging URL Extraction"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test URL extraction
test_url_extraction() {
    local query="$1"
    
    echo -e "${BLUE}Testing: $query${NC}"
    echo ""
    
    # Create the request payload
    local payload=$(cat <<EOF
{
  "query": "$query",
  "options": {
    "userId": "$USER_ID",
    "sessionId": "$SESSION_ID",
    "includeMemoryContext": false,
    "includeReasoning": true,
    "responseDetailLevel": "full",
    "excludeVectors": true,
    "maxMemoryResults": 0,
    "model": "openai",
    "temperature": 0.1
  }
}
EOF
)
    
    # Make the request and capture response
    local response=$(curl -s -X POST "$API_BASE/api/agent/execute" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    # Check if request was successful
    local success=$(echo "$response" | jq -r '.success // false')
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ Request successful${NC}"
        
        # Extract tool results
        local tool_results=$(echo "$response" | jq -r '.data.toolResults[]?')
        if [ "$tool_results" != "" ]; then
            echo "Tool Results:"
            echo "$tool_results" | jq -r '.'
        else
            echo "No tool results found"
        fi
        
        # Show reasoning
        local reasoning=$(echo "$response" | jq -r '.data.intent.reasoning // "No reasoning"')
        echo "Reasoning: $reasoning"
        
    else
        echo -e "${RED}❌ Request failed${NC}"
        echo "Error: $(echo "$response" | jq -r '.message // .error // "Unknown error"')"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Test the problematic query
echo -e "${YELLOW}Testing the problematic query:${NC}"
test_url_extraction "okay get me the list of posts made by user id 2"

# Test a working query for comparison
echo -e "${YELLOW}Testing a working query for comparison:${NC}"
test_url_extraction "now get posts for user 2 from jsonplaceholder.typicode.com"

# Test with explicit URL
echo -e "${YELLOW}Testing with explicit URL:${NC}"
test_url_extraction "Make an API call to https://jsonplaceholder.typicode.com/posts?userId=2"

echo -e "${YELLOW}🎯 URL Extraction Debug Summary${NC}"
echo "====================================="
echo ""
echo "This test helps us understand:"
echo "1. What URL is being generated for the problematic query"
echo "2. Why the URL validation is failing"
echo "3. How the LLM is interpreting the query"
echo ""
echo -e "${GREEN}✅ Debug test completed!${NC}"
