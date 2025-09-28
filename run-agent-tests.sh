#!/bin/bash

# Clear-AI Agent Test Suite Runner
# Master script to run all agent test suites

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_section() {
    echo -e "\n${PURPLE}$1${NC}"
}

# Test suite configurations
declare -A TEST_SUITES
TEST_SUITES["quick"]="Quick validation test - basic functionality"
TEST_SUITES["memory-persistence"]="Memory persistence test - verify memories are stored"
TEST_SUITES["memory-validation"]="Comprehensive memory validation - full memory system test"
TEST_SUITES["api-relationships"]="API relationships test - semantic understanding of API data"
TEST_SUITES["comprehensive"]="Full agent test suite - all features"
TEST_SUITES["stress"]="Stress test - performance under load"
TEST_SUITES["benchmark"]="Benchmark test - performance metrics"

# Run a specific test suite
run_test_suite() {
    local suite_name=$1
    local script_name=""
    local description=""
    
    case "$suite_name" in
        "quick")
            script_name="test-agent-quick.sh"
            description="Quick Agent Test"
            ;;
        "memory-persistence")
            script_name="test-memory-persistence.sh"
            description="Memory Persistence Test"
            ;;
        "memory-validation")
            script_name="test-agent-memory-validation.sh"
            description="Memory Validation Test"
            ;;
        "api-relationships")
            script_name="test-agent-api-relationships.sh"
            description="API Relationships Test"
            ;;
        "comprehensive")
            script_name="test-agent-comprehensive.sh"
            description="Comprehensive Agent Test"
            ;;
        "stress")
            script_name="test-agent-stress.sh"
            description="Stress Test"
            ;;
        "benchmark")
            script_name="test-agent-benchmark.sh"
            description="Benchmark Test"
            ;;
        *)
            print_error "Unknown test suite: $suite_name"
            return 1
            ;;
    esac
    
    print_section "Running $description"
    echo "Script: $script_name"
    echo "Description: ${TEST_SUITES[$suite_name]}"
    echo ""
    
    if [ -f "$script_name" ]; then
        if [ -x "$script_name" ]; then
            print_info "Starting $description..."
            echo "----------------------------------------"
            
            # Run the test script
            if ./"$script_name"; then
                print_success "$description completed successfully"
                return 0
            else
                print_error "$description failed"
                return 1
            fi
        else
            print_error "Script $script_name is not executable"
            echo "Run: chmod +x $script_name"
            return 1
        fi
    else
        print_error "Script $script_name not found"
        return 1
    fi
}

# Show available test suites
show_test_suites() {
    print_header "Available Test Suites"
    echo ""
    
    for suite in "${!TEST_SUITES[@]}"; do
        echo -e "${CYAN}$suite${NC}: ${TEST_SUITES[$suite]}"
    done
    
    echo ""
    echo "Usage examples:"
    echo "  $0 quick                    # Run quick test"
    echo "  $0 memory-persistence       # Test memory persistence"
    echo "  $0 api-relationships        # Test API relationship understanding"
    echo "  $0 all                      # Run all tests"
    echo "  $0 --list                   # List available tests"
}

# Run all test suites
run_all_tests() {
    print_header "Running All Agent Test Suites"
    echo "This will run all available test suites in sequence."
    echo ""
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    # Define test order (quick tests first, then comprehensive)
    local test_order=("quick" "memory-persistence" "memory-validation" "api-relationships" "comprehensive" "stress" "benchmark")
    
    for suite in "${test_order[@]}"; do
        total_tests=$((total_tests + 1))
        
        if run_test_suite "$suite"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi
        
        echo ""
        print_info "Test suite $suite completed. Continuing with next test..."
        sleep 2
    done
    
    # Final summary
    print_header "All Tests Complete"
    echo "Total test suites: $total_tests"
    echo "Passed: $passed_tests"
    echo "Failed: $failed_tests"
    
    if [ $failed_tests -eq 0 ]; then
        print_success "All test suites passed! 🎉"
        echo ""
        echo "Your Clear-AI agent system is working perfectly!"
        echo "All components are functioning correctly:"
        echo "  ✅ Agent service"
        echo "  ✅ Memory system"
        echo "  ✅ Tool execution"
        echo "  ✅ Performance"
    else
        print_error "Some test suites failed"
        echo ""
        echo "Please check the output above for details."
        echo "Common issues:"
        echo "  - Server not running (start with: npm run dev)"
        echo "  - Neo4j not configured"
        echo "  - Pinecone not configured"
        echo "  - Ollama not running"
    fi
}

# Main function
main() {
    print_header "Clear-AI Agent Test Suite Runner"
    echo "Timestamp: $(date)"
    echo ""
    
    case "${1:-}" in
        --help|-h)
            echo "Usage: $0 [test-suite-name] [options]"
            echo ""
            echo "Test Suite Names:"
            show_test_suites
            echo ""
            echo "Special Commands:"
            echo "  all, --all          Run all test suites"
            echo "  --list, -l          List available test suites"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 quick                    # Run quick validation test"
            echo "  $0 memory-persistence       # Test memory persistence"
            echo "  $0 comprehensive            # Run full test suite"
            echo "  $0 all                      # Run all tests"
            echo "  $0 stress --users 20        # Run stress test with 20 users"
            ;;
        --list|-l)
            show_test_suites
            ;;
        all|--all)
            run_all_tests
            ;;
        "")
            echo "No test suite specified. Use --help for usage information."
            show_test_suites
            ;;
        *)
            # Check if it's a valid test suite name
            if [[ -n "${TEST_SUITES[$1]:-}" ]]; then
                run_test_suite "$1"
            else
                print_error "Unknown test suite: $1"
                echo ""
                show_test_suites
                exit 1
            fi
            ;;
    esac
}

# Run main function with all arguments
main "$@"
