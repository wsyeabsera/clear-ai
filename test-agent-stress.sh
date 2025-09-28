#!/bin/bash

# Clear-AI Agent Stress Testing Script
# Tests agent performance under load

set -e

BASE_URL="http://localhost:3001"
CONCURRENT_USERS=10
REQUESTS_PER_USER=5
TEST_ID="stress-test-$(date +%s)"

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

# Stress test function
stress_test_user() {
    local user_id=$1
    local session_id=$2
    local user_num=$3
    
    local success_count=0
    local total_count=$REQUESTS_PER_USER
    
    print_info "Starting stress test for User $user_num"
    
    for i in $(seq 1 $REQUESTS_PER_USER); do
        local query="User $user_num, request $i: What is $((user_num * i)) + $((i * 7))?"
        
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{
                "query": "'"$query"'",
                "options": {
                    "userId": "'$user_id'",
                    "sessionId": "'$session_id'",
                    "testId": "'$TEST_ID'",
                    "includeMemoryContext": false,
                    "includeReasoning": false
                }
            }' \
            "$BASE_URL/api/agent/execute" 2>/dev/null)
        
        if echo "$response" | jq . >/dev/null 2>&1; then
            success=$(echo "$response" | jq -r '.success // false')
            if [ "$success" = "true" ]; then
                success_count=$((success_count + 1))
            fi
        fi
        
        # Small delay between requests
        sleep 0.1
    done
    
    echo "User $user_num: $success_count/$total_count requests successful"
    echo $success_count
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
    print_header "Clear-AI Agent Stress Test"
    echo "Test ID: $TEST_ID"
    echo "Concurrent Users: $CONCURRENT_USERS"
    echo "Requests per User: $REQUESTS_PER_USER"
    echo "Total Requests: $((CONCURRENT_USERS * REQUESTS_PER_USER))"
    
    wait_for_server
    
    print_header "Starting Stress Test"
    local start_time=$(date +%s)
    local total_success=0
    local total_requests=$((CONCURRENT_USERS * REQUESTS_PER_USER))
    
    # Create temporary file for results
    local results_file=$(mktemp)
    
    # Run concurrent users
    for i in $(seq 1 $CONCURRENT_USERS); do
        local user_id="stress-user-$i"
        local session_id="stress-session-$i"
        
        # Run stress test for this user in background
        stress_test_user "$user_id" "$session_id" "$i" >> "$results_file" &
    done
    
    # Wait for all background jobs to complete
    wait
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Calculate results
    while read -r line; do
        if [[ $line =~ ^[0-9]+$ ]]; then
            total_success=$((total_success + line))
        fi
    done < "$results_file"
    
    # Clean up
    rm -f "$results_file"
    
    print_header "Stress Test Results"
    echo "Duration: ${duration} seconds"
    echo "Total Requests: $total_requests"
    echo "Successful Requests: $total_success"
    echo "Failed Requests: $((total_requests - total_success))"
    
    local success_rate=$(( (total_success * 100) / total_requests ))
    echo "Success Rate: ${success_rate}%"
    
    local requests_per_second=$(( total_requests / duration ))
    echo "Requests per Second: $requests_per_second"
    
    # Performance assessment
    if [ $success_rate -ge 95 ]; then
        print_success "Excellent performance under stress!"
    elif [ $success_rate -ge 90 ]; then
        print_success "Good performance under stress"
    elif [ $success_rate -ge 80 ]; then
        print_info "Acceptable performance under stress"
    else
        print_error "Performance issues detected under stress"
    fi
    
    if [ $requests_per_second -ge 10 ]; then
        print_success "High throughput achieved"
    elif [ $requests_per_second -ge 5 ]; then
        print_info "Moderate throughput"
    else
        print_error "Low throughput detected"
    fi
    
    print_header "Stress Test Complete"
}

# Handle arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h           Show this help message"
        echo "  --users N            Number of concurrent users (default: 10)"
        echo "  --requests N         Requests per user (default: 5)"
        echo ""
        echo "Examples:"
        echo "  $0                           # Default stress test"
        echo "  $0 --users 20 --requests 3  # 20 users, 3 requests each"
        ;;
    --users)
        CONCURRENT_USERS=${2:-10}
        shift 2
        ;;
    --requests)
        REQUESTS_PER_USER=${2:-5}
        shift 2
        ;;
esac

main "$@"
