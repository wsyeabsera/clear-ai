#!/bin/bash

# Clear-AI Agent Benchmarking Script
# Measures agent performance metrics

set -e

BASE_URL="http://localhost:3001"
TEST_ID="benchmark-$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_metric() {
    echo -e "${PURPLE}$1${NC}"
}

# Benchmark function
benchmark_request() {
    local description=$1
    local data=$2
    local iterations=${3:-5}
    
    print_info "Benchmarking: $description ($iterations iterations)"
    
    local total_time=0
    local success_count=0
    local min_time=999999
    local max_time=0
    
    for i in $(seq 1 $iterations); do
        local start_time=$(date +%s.%N)
        
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL/api/agent/execute" 2>/dev/null)
        
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc)
        
        # Update metrics
        total_time=$(echo "$total_time + $duration" | bc)
        
        if [ $(echo "$duration < $min_time" | bc) -eq 1 ]; then
            min_time=$duration
        fi
        
        if [ $(echo "$duration > $max_time" | bc) -eq 1 ]; then
            max_time=$duration
        fi
        
        # Check success
        if echo "$response" | jq . >/dev/null 2>&1; then
            success=$(echo "$response" | jq -r '.success // false')
            if [ "$success" = "true" ]; then
                success_count=$((success_count + 1))
            fi
        fi
        
        echo -n "."
        sleep 0.1
    done
    
    echo ""
    
    # Calculate metrics
    local avg_time=$(echo "scale=3; $total_time / $iterations" | bc)
    local success_rate=$(( (success_count * 100) / iterations ))
    
    print_metric "Average Response Time: ${avg_time}s"
    print_metric "Min Response Time: ${min_time}s"
    print_metric "Max Response Time: ${max_time}s"
    print_metric "Success Rate: ${success_rate}%"
    print_metric "Requests per Second: $(echo "scale=2; 1 / $avg_time" | bc)"
    
    echo ""
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

# Check if bc is available
check_dependencies() {
    if ! command -v bc &> /dev/null; then
        print_error "bc calculator not found. Please install bc for accurate timing calculations."
        echo "On macOS: brew install bc"
        echo "On Ubuntu: sudo apt-get install bc"
        exit 1
    fi
}

main() {
    print_header "Clear-AI Agent Benchmarking Suite"
    echo "Timestamp: $(date)"
    echo "Test ID: $TEST_ID"
    echo "Server: $BASE_URL"
    
    check_dependencies
    wait_for_server
    
    local user_id="benchmark-user-$(date +%s)"
    local session_id="benchmark-session-$(date +%s)"
    
    # Test 1: Simple conversation (baseline)
    print_header "Baseline Performance"
    benchmark_request "Simple conversation" '{
        "query": "Hello, how are you?",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false
        }
    }' 10
    
    # Test 2: Tool execution
    print_header "Tool Execution Performance"
    benchmark_request "Calculator tool" '{
        "query": "What is 15 * 27?",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false
        }
    }' 10
    
    # Test 3: Memory operations
    print_header "Memory Operations Performance"
    benchmark_request "Memory storage" '{
        "query": "My name is BenchmarkUser and I like testing",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": false
        }
    }' 5
    
    benchmark_request "Memory retrieval" '{
        "query": "What do you know about me?",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": false
        }
    }' 5
    
    # Test 4: Complex queries
    print_header "Complex Query Performance"
    benchmark_request "Hybrid query (memory + tools)" '{
        "query": "Remember that I like Python, then calculate 2^10",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": true,
            "includeReasoning": true
        }
    }' 5
    
    # Test 5: Different models
    print_header "Model Performance Comparison"
    benchmark_request "Ollama model (default)" '{
        "query": "Explain quantum computing briefly",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false,
            "model": "ollama",
            "temperature": 0.7
        }
    }' 5
    
    benchmark_request "Low temperature response" '{
        "query": "What is the capital of France?",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false,
            "model": "ollama",
            "temperature": 0.1
        }
    }' 5
    
    benchmark_request "High temperature response" '{
        "query": "Tell me a creative story",
        "options": {
            "userId": "'$user_id'",
            "sessionId": "'$session_id'",
            "testId": "'$TEST_ID'",
            "includeMemoryContext": false,
            "includeReasoning": false,
            "model": "ollama",
            "temperature": 0.9
        }
    }' 5
    
    print_header "Benchmarking Complete"
    print_info "Performance metrics have been collected and displayed above."
    print_info "Use these metrics to optimize agent performance and identify bottlenecks."
    
    print_header "Performance Recommendations"
    echo "• Response times < 2s: Excellent"
    echo "• Response times 2-5s: Good"
    echo "• Response times 5-10s: Acceptable"
    echo "• Response times > 10s: Needs optimization"
    echo ""
    echo "• Success rate > 95%: Excellent"
    echo "• Success rate 90-95%: Good"
    echo "• Success rate 80-90%: Acceptable"
    echo "• Success rate < 80%: Needs investigation"
}

# Handle arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --quick        Run quick benchmark (fewer iterations)"
        echo "  --detailed     Run detailed benchmark (more iterations)"
        echo ""
        echo "Examples:"
        echo "  $0                # Standard benchmark"
        echo "  $0 --quick       # Quick benchmark"
        echo "  $0 --detailed    # Detailed benchmark"
        ;;
    --quick)
        print_header "Running Quick Benchmark"
        check_dependencies
        wait_for_server
        
        user_id="quick-benchmark-$(date +%s)"
        session_id="quick-session-$(date +%s)"
        
        benchmark_request "Quick test" '{
            "query": "Hello",
            "options": {
                "userId": "'$user_id'",
                "sessionId": "'$session_id'",
                "includeMemoryContext": false,
                "includeReasoning": false
            }
        }' 3
        ;;
    --detailed)
        print_header "Running Detailed Benchmark"
        check_dependencies
        wait_for_server
        
        user_id="detailed-benchmark-$(date +%s)"
        session_id="detailed-session-$(date +%s)"
        
        benchmark_request "Detailed test" '{
            "query": "Perform a complex calculation and explain the result",
            "options": {
                "userId": "'$user_id'",
                "sessionId": "'$session_id'",
                "includeMemoryContext": true,
                "includeReasoning": true
            }
        }' 20
        ;;
    *)
        main
        ;;
esac
