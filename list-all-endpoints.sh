#!/bin/bash

# Clear-AI All Endpoints Listing Script
# Lists all available API endpoints with examples

set -e

BASE_URL="http://localhost:3001"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_endpoint() {
    echo -e "${GREEN}$1${NC} $2"
    if [ -n "$3" ]; then
        echo -e "  ${YELLOW}Example:${NC} $3"
    fi
    echo
}

main() {
    print_header "Clear-AI API Endpoints"
    
    print_header "Health & Status"
    print_endpoint "GET" "/api/health" "curl $BASE_URL/api/health"
    print_endpoint "GET" "/api-docs/" "curl $BASE_URL/api-docs/"
    
    print_header "Memory Management - Episodic"
    print_endpoint "POST" "/api/memory/episodic" "curl -X POST $BASE_URL/api/memory/episodic -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"sessionId\":\"session456\",\"content\":\"Test memory\",\"metadata\":{\"source\":\"test\"}}'"
    print_endpoint "GET" "/api/memory/episodic/:id" "curl $BASE_URL/api/memory/episodic/memory-id-123"
    print_endpoint "POST" "/api/memory/episodic/search" "curl -X POST $BASE_URL/api/memory/episodic/search -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"query\":\"machine learning\"}'"
    print_endpoint "PUT" "/api/memory/episodic/:id" "curl -X PUT $BASE_URL/api/memory/episodic/memory-id-123 -H 'Content-Type: application/json' -d '{\"content\":\"Updated memory\"}'"
    print_endpoint "DELETE" "/api/memory/episodic/:id" "curl -X DELETE $BASE_URL/api/memory/episodic/memory-id-123"
    
    print_header "Memory Management - Semantic"
    print_endpoint "POST" "/api/memory/semantic" "curl -X POST $BASE_URL/api/memory/semantic -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"concept\":\"AI\",\"description\":\"Artificial Intelligence\",\"metadata\":{\"category\":\"technology\"}}'"
    print_endpoint "GET" "/api/memory/semantic/:id" "curl $BASE_URL/api/memory/semantic/semantic-id-123"
    print_endpoint "POST" "/api/memory/semantic/search" "curl -X POST $BASE_URL/api/memory/semantic/search -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"query\":\"artificial intelligence\"}'"
    print_endpoint "PUT" "/api/memory/semantic/:id" "curl -X PUT $BASE_URL/api/memory/semantic/semantic-id-123 -H 'Content-Type: application/json' -d '{\"description\":\"Updated description\"}'"
    print_endpoint "DELETE" "/api/memory/semantic/:id" "curl -X DELETE $BASE_URL/api/memory/semantic/semantic-id-123"
    
    print_header "Memory Context & Search"
    print_endpoint "GET" "/api/memory/context/:userId/:sessionId" "curl $BASE_URL/api/memory/context/user123/session456"
    print_endpoint "POST" "/api/memory/search" "curl -X POST $BASE_URL/api/memory/search -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"query\":\"AI machine learning\",\"type\":\"both\"}'"
    print_endpoint "GET" "/api/memory/stats/:userId" "curl $BASE_URL/api/memory/stats/user123"
    print_endpoint "DELETE" "/api/memory/clear/:userId" "curl -X DELETE $BASE_URL/api/memory/clear/user123"
    print_endpoint "GET" "/api/memory/related/:memoryId" "curl $BASE_URL/api/memory/related/memory-id-123"
    
    print_header "Memory Chat Integration"
    print_endpoint "POST" "/api/memory-chat/initialize" "curl -X POST $BASE_URL/api/memory-chat/initialize -H 'Content-Type: application/json'"
    print_endpoint "POST" "/api/memory-chat/chat" "curl -X POST $BASE_URL/api/memory-chat/chat -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"sessionId\":\"session456\",\"message\":\"Hello, what did we discuss?\"}'"
    print_endpoint "GET" "/api/memory-chat/history/:userId/:sessionId" "curl $BASE_URL/api/memory-chat/history/user123/session456"
    print_endpoint "POST" "/api/memory-chat/search" "curl -X POST $BASE_URL/api/memory-chat/search -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"query\":\"machine learning\"}'"
    print_endpoint "POST" "/api/memory-chat/knowledge" "curl -X POST $BASE_URL/api/memory-chat/knowledge -H 'Content-Type: application/json' -d '{\"userId\":\"user123\",\"concept\":\"Neural Networks\",\"description\":\"AI systems inspired by biology\"}'"
    
    print_header "Other API Endpoints"
    print_endpoint "GET" "/api/users" "curl $BASE_URL/api/users"
    print_endpoint "GET" "/api/mcp" "curl $BASE_URL/api/mcp"
    print_endpoint "POST" "/api/langchain" "curl -X POST $BASE_URL/api/langchain -H 'Content-Type: application/json'"
    print_endpoint "POST" "/api/tools" "curl -X POST $BASE_URL/api/tools -H 'Content-Type: application/json'"
    print_endpoint "POST" "/api/langgraph" "curl -X POST $BASE_URL/api/langgraph -H 'Content-Type: application/json'"
    
    print_header "Testing Scripts Available"
    echo -e "${GREEN}./test-memory-endpoints.sh${NC} - Comprehensive memory system tests"
    echo -e "${GREEN}./test-api-structure.sh${NC} - Basic API structure validation"
    echo -e "${GREEN}./list-all-endpoints.sh${NC} - This endpoint listing"
    
    print_header "Configuration Requirements"
    echo -e "${YELLOW}For full memory functionality:${NC}"
    echo "  - Neo4j database running on localhost:7687"
    echo "  - Pinecone API key and environment configured"
    echo "  - Ollama running on localhost:11434 with nomic-embed-text model"
    echo ""
    echo -e "${YELLOW}Current status:${NC}"
    echo "  - API endpoints: ✅ Working"
    echo "  - Error handling: ✅ Working"
    echo "  - JSON responses: ✅ Working"
    echo "  - Memory storage: ⚠️  Requires Neo4j/Pinecone"
    echo ""
    echo -e "${YELLOW}Server URL:${NC} $BASE_URL"
    echo -e "${YELLOW}API Documentation:${NC} $BASE_URL/api-docs/"
}

main "$@"
