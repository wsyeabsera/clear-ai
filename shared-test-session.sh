#!/bin/bash

# Shared Test Session Configuration
# Provides consistent test IDs and session management across all test scripts

# Shared session file
SHARED_SESSION_FILE="./test-session.json"

# Create or load shared test session
load_or_create_shared_session() {
    if [ -f "$SHARED_SESSION_FILE" ]; then
        # Load existing session
        TEST_ID=$(cat "$SHARED_SESSION_FILE" | jq -r '.testId // empty')
        USER_ID=$(cat "$SHARED_SESSION_FILE" | jq -r '.userId // empty')
        BASE_SESSION_ID=$(cat "$SHARED_SESSION_FILE" | jq -r '.sessionId // empty')
        
        if [ -z "$TEST_ID" ] || [ "$TEST_ID" = "null" ]; then
            create_shared_session
        else
            echo "📋 Using existing shared test session:"
            echo "   Test ID: $TEST_ID"
            echo "   User ID: $USER_ID"
            echo "   Base Session ID: $BASE_SESSION_ID"
        fi
    else
        create_shared_session
    fi
}

# Create new shared test session
create_shared_session() {
    local timestamp=$(date +%s)
    TEST_ID="shared-test-$timestamp"
    USER_ID="shared-user-$timestamp"
    BASE_SESSION_ID="shared-session-$timestamp"
    
    cat > "$SHARED_SESSION_FILE" << EOF
{
    "testId": "$TEST_ID",
    "userId": "$USER_ID",
    "sessionId": "$BASE_SESSION_ID",
    "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "timestamp": "$timestamp"
}
EOF
    
    echo "🆕 Created new shared test session:"
    echo "   Test ID: $TEST_ID"
    echo "   User ID: $USER_ID"
    echo "   Session ID: $BASE_SESSION_ID"
}

# Get current session ID with optional suffix
get_session_id() {
    local suffix=${1:-}
    if [ -n "$suffix" ]; then
        echo "${BASE_SESSION_ID}-${suffix}"
    else
        echo "$BASE_SESSION_ID"
    fi
}

# Create new session for same user (for persistence testing)
create_persistence_session() {
    local suffix=${1:-"persistence"}
    local persistence_session_id=$(get_session_id "$suffix")
    
    # Output info to stderr so it doesn't interfere with stdout capture
    echo "🔄 Created persistence session for same user:" >&2
    echo "   User ID: $USER_ID (same as original)" >&2
    echo "   New Session ID: $persistence_session_id" >&2
    
    echo "$persistence_session_id"
}

# Clean up shared session
cleanup_shared_session() {
    if [ -f "$SHARED_SESSION_FILE" ]; then
        rm -f "$SHARED_SESSION_FILE"
        echo "🧹 Cleaned up shared test session"
    fi
}

# Show current session info
show_session_info() {
    if [ -f "$SHARED_SESSION_FILE" ]; then
        echo "📋 Current shared test session:"
        cat "$SHARED_SESSION_FILE" | jq .
    else
        echo "❌ No shared test session found"
    fi
}

# Export session variables for use in other scripts
export_session_vars() {
    export TEST_ID
    export USER_ID
    export BASE_SESSION_ID
}

# Initialize session (call this at the start of test scripts)
init_shared_session() {
    load_or_create_shared_session
    export_session_vars
}

# Helper function to create test-specific session ID
get_test_session_id() {
    local test_name=$1
    echo "${BASE_SESSION_ID}-${test_name}"
}
