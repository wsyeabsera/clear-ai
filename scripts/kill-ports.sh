#!/bin/bash

# Kill processes on specific ports
# Usage: ./kill-ports.sh [port1] [port2] [port3] ...
# Example: ./kill-ports.sh 3000 3001 8080

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}No process found on port $port${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Found process $pid on port $port${NC}"
    
    # Try graceful kill first
    kill -TERM $pid 2>/dev/null
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Check if process is still running
    if kill -0 $pid 2>/dev/null; then
        echo -e "${YELLOW}Process $pid still running, force killing...${NC}"
        kill -9 $pid 2>/dev/null
        
        # Check again
        if kill -0 $pid 2>/dev/null; then
            echo -e "${RED}Failed to kill process $pid on port $port${NC}"
            return 1
        else
            echo -e "${GREEN}Force killed process $pid on port $port${NC}"
        fi
    else
        echo -e "${GREEN}Gracefully killed process $pid on port $port${NC}"
    fi
    
    return 0
}

# Function to kill all common development ports
kill_dev_ports() {
    local ports=(3000 3001 8080 8000 5000 4000 9000 5173 4173)
    echo -e "${BLUE}Killing processes on common development ports...${NC}"
    
    for port in "${ports[@]}"; do
        kill_port $port
    done
}

# Function to show help
show_help() {
    echo -e "${BLUE}Kill Ports Script${NC}"
    echo ""
    echo "Usage:"
    echo "  ./kill-ports.sh [port1] [port2] [port3] ..."
    echo "  ./kill-ports.sh --dev"
    echo "  ./kill-ports.sh --all"
    echo "  ./kill-ports.sh --help"
    echo ""
    echo "Options:"
    echo "  --dev     Kill processes on common development ports (3000, 3001, 8080, etc.)"
    echo "  --all     Kill all Node.js processes"
    echo "  --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./kill-ports.sh 3000 3001"
    echo "  ./kill-ports.sh --dev"
    echo "  ./kill-ports.sh --all"
}

# Function to kill all Node.js processes
kill_all_node() {
    echo -e "${BLUE}Killing all Node.js processes...${NC}"
    
    # Get all Node.js PIDs
    local pids=$(pgrep -f node)
    
    if [ -z "$pids" ]; then
        echo -e "${YELLOW}No Node.js processes found${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Found Node.js processes: $pids${NC}"
    
    for pid in $pids; do
        echo -e "${BLUE}Killing Node.js process $pid${NC}"
        kill -TERM $pid 2>/dev/null
    done
    
    # Wait for graceful shutdown
    sleep 3
    
    # Force kill any remaining Node.js processes
    local remaining_pids=$(pgrep -f node)
    if [ -n "$remaining_pids" ]; then
        echo -e "${YELLOW}Force killing remaining Node.js processes: $remaining_pids${NC}"
        for pid in $remaining_pids; do
            kill -9 $pid 2>/dev/null
        done
    fi
    
    echo -e "${GREEN}All Node.js processes killed${NC}"
}

# Main script logic
main() {
    echo -e "${BLUE}🚀 Kill Ports Script${NC}"
    echo ""
    
    # Check if no arguments provided
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    # Handle special flags
    case "$1" in
        --help|-h)
            show_help
            exit 0
            ;;
        --dev)
            kill_dev_ports
            exit 0
            ;;
        --all)
            kill_all_node
            exit 0
            ;;
    esac
    
    # Kill processes on specified ports
    echo -e "${BLUE}Killing processes on specified ports...${NC}"
    
    local failed_ports=()
    
    for port in "$@"; do
        # Validate port number
        if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
            echo -e "${RED}Invalid port number: $port${NC}"
            failed_ports+=($port)
            continue
        fi
        
        if ! kill_port $port; then
            failed_ports+=($port)
        fi
    done
    
    # Summary
    echo ""
    if [ ${#failed_ports[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All ports processed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to kill processes on ports: ${failed_ports[*]}${NC}"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
