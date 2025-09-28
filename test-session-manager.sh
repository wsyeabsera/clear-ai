#!/bin/bash

# Clear-AI Test Session Manager
# Manages test sessions and IDs for cross-session memory testing

set -e

# Configuration
TEST_SESSIONS_DIR="./test-sessions"
TEST_SESSION_FILE="$TEST_SESSIONS_DIR/current-session.json"
TEST_RESULTS_FILE="$TEST_SESSIONS_DIR/test-results.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Initialize test session directory
init_test_sessions() {
    if [ ! -d "$TEST_SESSIONS_DIR" ]; then
        mkdir -p "$TEST_SESSIONS_DIR"
        print_info "Created test sessions directory: $TEST_SESSIONS_DIR"
    fi
}

# Create or update test session
create_test_session() {
    local test_name=$1
    local description=$2
    
    init_test_sessions
    
    local timestamp=$(date +%s)
    local session_id="session-$timestamp"
    local user_id="user-$timestamp"
    local test_id="$test_name-$timestamp"
    
    # Create session data
    cat > "$TEST_SESSION_FILE" << EOF
{
    "testId": "$test_id",
    "userId": "$user_id",
    "sessionId": "$session_id",
    "testName": "$test_name",
    "description": "$description",
    "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "timestamp": "$timestamp"
}
EOF
    
    print_success "Created test session: $test_name"
    print_info "Test ID: $test_id"
    print_info "User ID: $user_id"
    print_info "Session ID: $session_id"
    
    echo "$test_id"
}

# Get current test session
get_test_session() {
    if [ -f "$TEST_SESSION_FILE" ]; then
        cat "$TEST_SESSION_FILE"
    else
        print_error "No active test session found"
        return 1
    fi
}

# Get specific session field
get_session_field() {
    local field=$1
    if [ -f "$TEST_SESSION_FILE" ]; then
        cat "$TEST_SESSION_FILE" | jq -r ".$field // empty"
    else
        print_error "No active test session found"
        return 1
    fi
}

# Create new session for same user (for persistence testing)
create_persistence_session() {
    local test_name=$1
    local description=$2
    
    local existing_user_id=$(get_session_field "userId")
    if [ -z "$existing_user_id" ] || [ "$existing_user_id" = "null" ]; then
        print_error "No existing user ID found for persistence testing"
        return 1
    fi
    
    local timestamp=$(date +%s)
    local session_id="persistence-session-$timestamp"
    local test_id="$test_name-persistence-$timestamp"
    
    # Create new session with same user ID
    cat > "$TEST_SESSION_FILE" << EOF
{
    "testId": "$test_id",
    "userId": "$existing_user_id",
    "sessionId": "$session_id",
    "testName": "$test_name",
    "description": "$description",
    "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "timestamp": "$timestamp",
    "isPersistenceTest": true,
    "originalUser": true
}
EOF
    
    print_success "Created persistence test session: $test_name"
    print_info "Test ID: $test_id"
    print_info "User ID: $existing_user_id (same as original)"
    print_info "Session ID: $session_id"
    
    echo "$test_id"
}

# Record test result
record_test_result() {
    local test_name=$1
    local result=$2
    local details=$3
    
    init_test_sessions
    
    local timestamp=$(date +%s)
    local result_entry=$(cat << EOF
{
    "testName": "$test_name",
    "result": "$result",
    "details": "$details",
    "timestamp": "$timestamp",
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)
    
    # Initialize results file if it doesn't exist
    if [ ! -f "$TEST_RESULTS_FILE" ]; then
        echo '[]' > "$TEST_RESULTS_FILE"
    fi
    
    # Add result to array
    local temp_file=$(mktemp)
    cat "$TEST_RESULTS_FILE" | jq ". + [$result_entry]" > "$temp_file"
    mv "$temp_file" "$TEST_RESULTS_FILE"
    
    print_info "Recorded test result: $test_name - $result"
}

# Get test results
get_test_results() {
    if [ -f "$TEST_RESULTS_FILE" ]; then
        cat "$TEST_RESULTS_FILE"
    else
        echo "[]"
    fi
}

# Clean up test sessions
cleanup_test_sessions() {
    if [ -d "$TEST_SESSIONS_DIR" ]; then
        rm -rf "$TEST_SESSIONS_DIR"
        print_success "Cleaned up test sessions"
    fi
}

# Show current session info
show_session_info() {
    if [ -f "$TEST_SESSION_FILE" ]; then
        print_info "Current test session:"
        cat "$TEST_SESSION_FILE" | jq .
    else
        print_error "No active test session found"
        echo "Create a session with: $0 create <test-name> <description>"
    fi
}

# Show test results summary
show_test_summary() {
    print_info "Test Results Summary:"
    if [ -f "$TEST_RESULTS_FILE" ]; then
        local total_tests=$(cat "$TEST_RESULTS_FILE" | jq 'length')
        local passed_tests=$(cat "$TEST_RESULTS_FILE" | jq '[.[] | select(.result == "PASSED")] | length')
        local failed_tests=$(cat "$TEST_RESULTS_FILE" | jq '[.[] | select(.result == "FAILED")] | length')
        
        echo "  Total Tests: $total_tests"
        echo "  Passed: $passed_tests"
        echo "  Failed: $failed_tests"
        
        if [ "$total_tests" -gt 0 ]; then
            local success_rate=$(( (passed_tests * 100) / total_tests ))
            echo "  Success Rate: ${success_rate}%"
        fi
        
        echo ""
        echo "Recent test results:"
        cat "$TEST_RESULTS_FILE" | jq -r '.[-5:] | .[] | "  \(.testName): \(.result) (\(.date))"'
    else
        echo "  No test results found"
    fi
}

# Main function
main() {
    case "${1:-}" in
        create)
            if [ $# -lt 3 ]; then
                print_error "Usage: $0 create <test-name> <description>"
                exit 1
            fi
            create_test_session "$2" "$3"
            ;;
        create-persistence)
            if [ $# -lt 3 ]; then
                print_error "Usage: $0 create-persistence <test-name> <description>"
                exit 1
            fi
            create_persistence_session "$2" "$3"
            ;;
        get)
            get_test_session
            ;;
        get-field)
            if [ $# -lt 2 ]; then
                print_error "Usage: $0 get-field <field-name>"
                exit 1
            fi
            get_session_field "$2"
            ;;
        record)
            if [ $# -lt 3 ]; then
                print_error "Usage: $0 record <test-name> <result> [details]"
                exit 1
            fi
            record_test_result "$2" "$3" "${4:-}"
            ;;
        results)
            get_test_results
            ;;
        summary)
            show_test_summary
            ;;
        info)
            show_session_info
            ;;
        cleanup)
            cleanup_test_sessions
            ;;
        --help|-h)
            echo "Clear-AI Test Session Manager"
            echo ""
            echo "Usage: $0 <command> [args...]"
            echo ""
            echo "Commands:"
            echo "  create <name> <description>     Create new test session"
            echo "  create-persistence <name> <desc> Create persistence test session (same user)"
            echo "  get                            Get current session JSON"
            echo "  get-field <field>              Get specific session field"
            echo "  record <name> <result> [details] Record test result"
            echo "  results                        Get all test results"
            echo "  summary                        Show test results summary"
            echo "  info                           Show current session info"
            echo "  cleanup                        Clean up all test sessions"
            echo "  --help, -h                     Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 create memory-test \"Memory validation test\""
            echo "  $0 get-field testId"
            echo "  $0 record memory-test PASSED \"All memory tests passed\""
            echo "  $0 summary"
            ;;
        *)
            print_error "Unknown command: ${1:-}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

main "$@"
