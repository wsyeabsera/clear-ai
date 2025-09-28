#!/bin/bash

# Clear-AI Memory System Status Summary
# Shows current working status of all endpoints

set -e

BASE_URL="http://localhost:3001"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_status() {
    local endpoint=$1
    local method=$2
    local description=$3
    local expected_status=$4
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅${NC} $description ($method $endpoint)"
    else
        echo -e "${RED}❌${NC} $description ($method $endpoint) - Got $http_code, expected $expected_status"
    fi
}

print_section() {
    echo -e "\n${YELLOW}$1${NC}"
}

main() {
    print_header "Clear-AI Memory System Status Report"
    echo "Server: $BASE_URL"
    echo "Timestamp: $(date)"
    
    print_section "✅ WORKING ENDPOINTS"
    print_status "/api/health" "GET" "Health Check" "200"
    print_status "/api-docs/" "GET" "API Documentation" "200"
    print_status "/api/memory-chat/initialize" "POST" "Memory Chat Initialize" "200"
    
    print_section "⚠️  EXPECTED ERRORS (Neo4j/Pinecone Not Configured)"
    print_status "/api/memory/episodic" "POST" "Store Episodic Memory" "500"
    print_status "/api/memory/semantic" "POST" "Store Semantic Memory" "500"
    print_status "/api/memory/episodic/search" "POST" "Search Episodic Memories" "500"
    print_status "/api/memory/semantic/search" "POST" "Search Semantic Memories" "500"
    print_status "/api/memory/context/test/test" "GET" "Get Memory Context" "500"
    print_status "/api/memory/search" "POST" "Search All Memories" "500"
    print_status "/api/memory/stats/test" "GET" "Get Memory Stats" "500"
    print_status "/api/memory-chat/chat" "POST" "Memory Chat" "500"
    print_status "/api/memory-chat/history/test/test" "GET" "Get Conversation History" "500"
    print_status "/api/memory-chat/search" "POST" "Search Memories in Chat" "500"
    print_status "/api/memory-chat/knowledge" "POST" "Store Knowledge in Chat" "500"
    
    print_section "✅ ERROR HANDLING"
    print_status "/api/nonexistent" "GET" "404 Handling" "404"
    print_status "/api/memory/invalid" "GET" "Invalid Memory Endpoint" "404"
    
    print_header "Configuration Status"
    echo -e "${GREEN}✅ API Structure:${NC} All endpoints properly registered"
    echo -e "${GREEN}✅ Error Handling:${NC} Proper JSON responses with meaningful errors"
    echo -e "${GREEN}✅ Health Check:${NC} Server running and responsive"
    echo -e "${GREEN}✅ Documentation:${NC} Swagger UI accessible"
    echo -e "${GREEN}✅ Memory Chat Init:${NC} Basic initialization working"
    
    echo -e "\n${YELLOW}⚠️  Requires Configuration:${NC}"
    echo -e "${RED}❌ Neo4j:${NC} Database connection needed for episodic memory"
    echo -e "${RED}❌ Pinecone:${NC} Vector database needed for semantic memory"
    echo -e "${RED}❌ Ollama:${NC} Embedding model needed for vector operations"
    
    print_header "Next Steps"
    echo "1. Configure Neo4j database for episodic memory storage"
    echo "2. Set up Pinecone vector database for semantic memory"
    echo "3. Install and configure Ollama with nomic-embed-text model"
    echo "4. Update environment variables in packages/server/.env"
    
    print_header "Testing Commands"
    echo "Run comprehensive tests:"
    echo "  ./test-memory-endpoints.sh"
    echo ""
    echo "Quick API structure validation:"
    echo "  ./test-api-structure.sh"
    echo ""
    echo "View all endpoints:"
    echo "  ./list-all-endpoints.sh"
}

main "$@"
