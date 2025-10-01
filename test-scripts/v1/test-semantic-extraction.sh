#!/bin/bash

# Test script for Semantic Extraction System
# This script tests the LLM-based semantic extraction functionality
# that reduces redundancy between Pinecone and Neo4j memory storage.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
USER_ID="test-user-$TIMESTAMP"
SESSION_ID="test-session-$TIMESTAMP"

echo -e "${BLUE}🧠 Testing Semantic Extraction System${NC}\n"

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$SERVER_URL$endpoint"
    else
        curl -s -X $method \
            -H "Content-Type: application/json" \
            "$SERVER_URL$endpoint"
    fi
}

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}1. Checking if server is running...${NC}"
    
    if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running${NC}\n"
        return 0
    else
        echo -e "${RED}❌ Server is not running. Please start the server first.${NC}"
        echo "Run: npm run dev or yarn dev"
        exit 1
    fi
}

# Function to initialize memory service
initialize_memory_service() {
    echo -e "${YELLOW}2. Initializing memory service...${NC}"
    
    local response=$(make_request "POST" "/api/memory-chat/initialize")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Memory service initialized${NC}\n"
    else
        echo -e "${RED}❌ Failed to initialize memory service${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Function to create sample episodic memories
create_sample_memories() {
    echo -e "${YELLOW}3. Creating sample episodic memories...${NC}"
    
    # Memory 1: AI/ML discussion
    local memory1='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "content": "User asked about machine learning algorithms and neural networks for image recognition",
        "context": {
            "topic": "AI",
            "conversation_turn": 1
        },
        "metadata": {
            "source": "chat",
            "importance": 0.9,
            "tags": ["AI", "machine learning", "neural networks", "image recognition"],
            "location": "web_interface"
        },
        "relationships": {
            "previous": null,
            "next": null,
            "related": []
        }
    }'
    
    local response1=$(make_request "POST" "/api/memory/episodic" "$memory1")
    if echo "$response1" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Stored: AI/ML discussion"
    else
        echo -e "   ${RED}❌${NC} Failed to store AI/ML memory"
    fi
    
    # Memory 2: Programming preferences
    local memory2='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "content": "User mentioned they prefer Python over JavaScript for data science and machine learning projects",
        "context": {
            "topic": "Programming",
            "conversation_turn": 2
        },
        "metadata": {
            "source": "chat",
            "importance": 0.8,
            "tags": ["programming", "python", "javascript", "data science"],
            "location": "web_interface"
        },
        "relationships": {
            "previous": null,
            "next": null,
            "related": []
        }
    }'
    
    local response2=$(make_request "POST" "/api/memory/episodic" "$memory2")
    if echo "$response2" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Stored: Programming preferences"
    else
        echo -e "   ${RED}❌${NC} Failed to store programming memory"
    fi
    
    # Memory 3: Technology discussion
    local memory3='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'",
        "content": "User discussed the benefits of vector databases like Pinecone for AI applications and semantic search",
        "context": {
            "topic": "Technology",
            "conversation_turn": 3
        },
        "metadata": {
            "source": "chat",
            "importance": 0.7,
            "tags": ["vector databases", "AI", "technology", "semantic search"],
            "location": "web_interface"
        },
        "relationships": {
            "previous": null,
            "next": null,
            "related": []
        }
    }'
    
    local response3=$(make_request "POST" "/api/memory/episodic" "$memory3")
    if echo "$response3" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Stored: Technology discussion"
    else
        echo -e "   ${RED}❌${NC} Failed to store technology memory"
    fi
    
    echo ""
}

# Function to test semantic extraction
test_semantic_extraction() {
    echo -e "${YELLOW}4. Testing semantic extraction...${NC}"
    
    local extraction_data='{
        "userId": "'$USER_ID'",
        "sessionId": "'$SESSION_ID'"
    }'
    
    local extraction_response=$(make_request "POST" "/api/memory-chat/extract-semantic" "$extraction_data")
    
    if echo "$extraction_response" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Semantic extraction completed"
        
        local concepts=$(echo "$extraction_response" | jq -r '.data.extractedConcepts' 2>/dev/null || echo "0")
        local relationships=$(echo "$extraction_response" | jq -r '.data.extractedRelationships' 2>/dev/null || echo "0")
        local processing_time=$(echo "$extraction_response" | jq -r '.data.processingTime' 2>/dev/null || echo "0")
        
        echo -e "   ${BLUE}📊${NC} Results:"
        echo -e "      - Extracted concepts: $concepts"
        echo -e "      - Extracted relationships: $relationships"
        echo -e "      - Processing time: ${processing_time}ms"
    else
        echo -e "   ${RED}❌${NC} Semantic extraction failed"
        echo "Response: $extraction_response"
    fi
    
    echo ""
}

# Function to test memory search
test_memory_search() {
    echo -e "${YELLOW}5. Testing memory search...${NC}"
    
    # Search for episodic memories
    local search_query='{
        "userId": "'$USER_ID'",
        "query": "machine learning",
        "type": "episodic",
        "limit": 5
    }'
    
    local response=$(make_request "POST" "/api/memory-chat/search" "$search_query")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Memory search working"
        
        # Extract and display results
        local result_count=$(echo "$response" | jq -r '.data.episodic.memories | length' 2>/dev/null || echo "0")
        echo -e "   ${BLUE}📊${NC} Found $result_count episodic memories"
        
        if [ "$result_count" -gt 0 ]; then
            echo -e "   ${BLUE}📝${NC} Sample results:"
            echo "$response" | jq -r '.data.episodic.memories[0:2][] | "      - " + .content' 2>/dev/null || echo "      (Unable to parse results)"
        fi
    else
        echo -e "   ${RED}❌${NC} Memory search failed"
        echo "Response: $response"
    fi
    
    echo ""
}

# Function to test semantic memory search
test_semantic_search() {
    echo -e "${YELLOW}6. Testing semantic memory search...${NC}"
    
    # Search for semantic memories
    local search_query='{
        "userId": "'$USER_ID'",
        "query": "artificial intelligence",
        "type": "semantic",
        "limit": 5
    }'
    
    local response=$(make_request "POST" "/api/memory-chat/search" "$search_query")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Semantic search working"
        
        # Extract and display results
        local result_count=$(echo "$response" | jq -r '.data.semantic.memories | length' 2>/dev/null || echo "0")
        echo -e "   ${BLUE}📊${NC} Found $result_count semantic memories"
        
        if [ "$result_count" -gt 0 ]; then
            echo -e "   ${BLUE}📝${NC} Sample concepts:"
            echo "$response" | jq -r '.data.semantic.memories[0:2][] | "      - " + .concept + ": " + .description' 2>/dev/null || echo "      (Unable to parse results)"
        else
            echo -e "   ${YELLOW}⚠️${NC} No semantic memories found (this is expected if extraction hasn't run)"
        fi
    else
        echo -e "   ${RED}❌${NC} Semantic search failed"
        echo "Response: $response"
    fi
    
    echo ""
}

# Function to get memory statistics
get_memory_stats() {
    echo -e "${YELLOW}7. Getting memory statistics...${NC}"
    
    local response=$(make_request "GET" "/api/memory/stats/$USER_ID")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅${NC} Memory statistics retrieved"
        
        # Display stats
        local episodic_count=$(echo "$response" | jq -r '.data.episodic.count' 2>/dev/null || echo "0")
        local semantic_count=$(echo "$response" | jq -r '.data.semantic.count' 2>/dev/null || echo "0")
        
        echo -e "   ${BLUE}📊${NC} Episodic memories: $episodic_count"
        echo -e "   ${BLUE}📊${NC} Semantic memories: $semantic_count"
        
        if [ "$semantic_count" -gt 0 ]; then
            local categories=$(echo "$response" | jq -r '.data.semantic.categories | join(", ")' 2>/dev/null || echo "Unknown")
            echo -e "   ${BLUE}📊${NC} Categories: $categories"
        fi
    else
        echo -e "   ${RED}❌${NC} Failed to get memory statistics"
        echo "Response: $response"
    fi
    
    echo ""
}

# Function to display summary
display_summary() {
    echo -e "${BLUE}🎉 Test Summary${NC}"
    echo -e "${BLUE}===============${NC}"
    echo ""
    echo -e "${GREEN}✅${NC} The semantic extraction system is designed to:"
    echo "   • Process episodic memories from Neo4j using LLM"
    echo "   • Extract only essential semantic concepts and relationships"
    echo "   • Store distilled information in Pinecone"
    echo "   • Eliminate redundancy between storage systems"
    echo ""
    echo -e "${YELLOW}📝${NC} Next steps:"
    echo "   1. Implement semantic extraction endpoint in server"
    echo "   2. Configure LLM service (OpenAI, Anthropic, etc.)"
    echo "   3. Set up Pinecone for semantic memory storage"
    echo "   4. Test the full extraction workflow"
    echo ""
    echo -e "${BLUE}🔧${NC} Configuration needed:"
    echo "   • SEMANTIC_EXTRACTION_ENABLED=true"
    echo "   • LLM API keys (OPENAI_API_KEY, etc.)"
    echo "   • PINECONE_API_KEY for vector storage"
    echo ""
}

# Main execution
main() {
    check_server
    initialize_memory_service
    create_sample_memories
    test_semantic_extraction
    test_memory_search
    test_semantic_search
    get_memory_stats
    display_summary
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is required but not installed.${NC}"
    echo "Please install jq: brew install jq (on macOS) or apt-get install jq (on Ubuntu)"
    exit 1
fi

# Run the main function
main
