# Testing Framework

The Clear-AI Testing Framework is a comprehensive suite of tools designed to validate and ensure the reliability of your AI agent system. Think of it as your **quality assurance toolkit** that automatically tests every component to make sure everything works perfectly.

## 🧪 What is the Testing Framework?

The Testing Framework provides:
- **Automated Test Suites** for all system components
- **Performance Benchmarking** to measure system speed
- **Memory Validation** to ensure data persistence
- **Stress Testing** to verify system stability
- **API Relationship Testing** to validate complex interactions

## 🎯 Why Do We Need This?

### The Problem
AI systems are complex with many moving parts:
- Memory systems (Neo4j + Pinecone)
- Tool execution engines
- LLM integrations
- Intent classification
- Cross-session persistence

Without proper testing, you might not notice when something breaks!

### The Solution
Our testing framework:
- **Automatically validates** all components
- **Catches issues early** before they affect users
- **Measures performance** to ensure speed
- **Tests edge cases** that might break the system
- **Provides detailed reports** on system health

## 🚀 Quick Start

### Run All Tests
```bash
# Run the complete test suite
./run-agent-tests.sh all

# Run specific test categories
./run-agent-tests.sh quick
./run-agent-tests.sh memory-persistence
./run-agent-tests.sh comprehensive
```

### Individual Test Scripts
```bash
# Quick validation (2-3 minutes)
./test-agent-quick.sh

# Memory persistence test (5-10 minutes)
./test-memory-persistence.sh

# Comprehensive test suite (15-20 minutes)
./test-agent-comprehensive.sh

# Stress test (10-15 minutes)
./test-agent-stress.sh
```

## 📋 Test Categories

### 1. **Quick Tests** (`test-agent-quick.sh`)

**Purpose**: Fast validation of core functionality
**Duration**: 2-3 minutes
**What it tests**:
- Basic conversation
- Calculator tool execution
- Memory storage
- Memory retrieval

**Example Output**:
```
=== Clear-AI Agent Quick Test ===
✅ Basic conversation
✅ Calculator tool
✅ Memory storage
✅ Memory retrieval
✅ Core agent functionality validated
```

### 2. **Memory Persistence Tests** (`test-memory-persistence.sh`)

**Purpose**: Verify memory works across sessions
**Duration**: 5-10 minutes
**What it tests**:
- Information storage
- Memory retrieval
- Cross-session persistence
- Memory context integration

**Example Output**:
```
=== Clear-AI Memory Persistence Test ===
✅ Information stored successfully
✅ Memory storage working
✅ Memory retrieval working
✅ Cross-session memory access working
✅ All memory persistence tests passed!
```

### 3. **Memory Validation Tests** (`test-agent-memory-validation.sh`)

**Purpose**: Comprehensive memory system validation
**Duration**: 10-15 minutes
**What it tests**:
- Basic memory operations
- Memory-based conversations
- Memory search functionality
- Multi-session persistence
- Memory context integration
- Memory statistics and analytics

**Example Output**:
```
=== Clear-AI Agent Memory Validation Suite ===
🧠 BASIC MEMORY OPERATIONS
✅ Personal information stored via agent
✅ Memory-based query executed successfully

🔍 MEMORY SEARCH FUNCTIONALITY
✅ Search working for term: Python
✅ Search working for term: machine learning

🔄 MULTI-SESSION MEMORY PERSISTENCE
✅ Information stored in original session
✅ Memory accessible across sessions

🎉 ALL MEMORY TESTS PASSED!
```

### 4. **Comprehensive Tests** (`test-agent-comprehensive.sh`)

**Purpose**: Full system validation
**Duration**: 15-20 minutes
**What it tests**:
- All core functionality
- Memory integration
- Tool execution
- Intent classification
- Error handling
- Performance testing
- Model configurations

**Example Output**:
```
=== Clear-AI Agent Comprehensive Test Suite ===
✅ Basic conversation
✅ Tool execution
✅ Memory integration
✅ Intent classification
✅ Error handling
✅ Performance testing
✅ All tests passed!
```

### 5. **Stress Tests** (`test-agent-stress.sh`)

**Purpose**: System stability under load
**Duration**: 10-15 minutes
**What it tests**:
- Concurrent request handling
- Memory system under load
- Tool execution performance
- System stability

**Example Output**:
```
=== Clear-AI Agent Stress Test ===
🚀 Running 20 concurrent requests...
✅ All requests completed successfully
✅ Average response time: 1.2s
✅ Memory system stable under load
✅ Stress test passed!
```

### 6. **Benchmark Tests** (`test-agent-benchmark.sh`)

**Purpose**: Performance measurement
**Duration**: 5-10 minutes
**What it tests**:
- Response time benchmarks
- Memory retrieval speed
- Tool execution performance
- System throughput

**Example Output**:
```
=== Clear-AI Agent Benchmark Test ===
📊 Performance Metrics:
  Average response time: 1.2s
  Memory retrieval: 0.3s
  Tool execution: 0.8s
  System throughput: 50 req/min
✅ Benchmark test completed!
```

## 🛠️ Test Configuration

### Environment Setup

Before running tests, ensure your environment is configured:

```bash
# 1. Start required services
npm run dev

# 2. Verify services are running
curl http://localhost:3001/api/health

# 3. Check Neo4j connection
# (Ensure Neo4j is running on bolt://localhost:7687)

# 4. Check Pinecone connection
# (Ensure Pinecone API key is configured)

# 5. Check Ollama connection
# (Ensure Ollama is running on http://localhost:11434)
```

### Test Environment Variables

```bash
# Required environment variables
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"
export PINECONE_API_KEY="your-pinecone-key"
export PINECONE_ENVIRONMENT="your-environment"
export PINECONE_INDEX_NAME="clear-ai-memories"
export OPENAI_API_KEY="your-openai-key"
export OLLAMA_BASE_URL="http://localhost:11434"
```

## 📊 Test Results and Reporting

### Success Indicators

**✅ All Tests Passed**
```
🎉 ALL TESTS PASSED!
✅ Agent service working
✅ Memory system working
✅ Tool execution working
✅ Performance excellent
```

**⚠️ Some Tests Failed**
```
❌ Some tests failed
🔧 Check the output above for details
Common issues:
  - Server not running (start with: npm run dev)
  - Neo4j not configured
  - Pinecone not configured
  - Ollama not running
```

### Performance Metrics

**Response Times**:
- Quick tests: < 3 minutes
- Memory persistence: < 10 minutes
- Comprehensive: < 20 minutes
- Stress tests: < 15 minutes

**Success Rates**:
- Target: > 95% test pass rate
- Memory accuracy: > 90%
- Tool execution: > 98%
- Intent classification: > 90%

## 🔧 Advanced Testing

### Custom Test Scenarios

Create custom test scenarios by modifying test scripts:

```bash
# Example: Custom memory test
cat > custom-memory-test.sh << 'EOF'
#!/bin/bash
# Custom memory test for specific use case

BASE_URL="http://localhost:3001"
USER_ID="custom-test-user"
SESSION_ID="custom-test-session"

# Test specific memory functionality
test_custom_memory() {
    echo "Testing custom memory scenario..."
    
    # Your custom test logic here
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "query": "Remember that I work at Acme Corp",
            "options": {
                "userId": "'$USER_ID'",
                "sessionId": "'$SESSION_ID'",
                "includeMemoryContext": true
            }
        }' \
        "$BASE_URL/api/agent/execute")
    
    if echo "$response" | jq .success >/dev/null 2>&1; then
        echo "✅ Custom memory test passed"
    else
        echo "❌ Custom memory test failed"
    fi
}

test_custom_memory
EOF

chmod +x custom-memory-test.sh
./custom-memory-test.sh
```

### Continuous Integration

Integrate tests into your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Clear-AI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start services
      run: |
        npm run dev &
        sleep 30
    
    - name: Run quick tests
      run: ./test-agent-quick.sh
    
    - name: Run memory tests
      run: ./test-memory-persistence.sh
    
    - name: Run comprehensive tests
      run: ./test-agent-comprehensive.sh
```

### Performance Monitoring

Monitor test performance over time:

```bash
# Run tests with timing
time ./test-agent-quick.sh

# Generate performance report
./test-agent-benchmark.sh > performance-report.txt

# Compare with previous runs
diff performance-report.txt previous-performance-report.txt
```

## 🚨 Troubleshooting

### Common Issues

**1. Server Not Running**
```bash
# Solution: Start the server
npm run dev

# Verify it's running
curl http://localhost:3001/api/health
```

**2. Neo4j Connection Failed**
```bash
# Solution: Check Neo4j service
# Start Neo4j
sudo systemctl start neo4j

# Check connection
cypher-shell -u neo4j -p your-password
```

**3. Pinecone Connection Failed**
```bash
# Solution: Check Pinecone configuration
echo $PINECONE_API_KEY
echo $PINECONE_ENVIRONMENT
echo $PINECONE_INDEX_NAME
```

**4. Ollama Not Running**
```bash
# Solution: Start Ollama
ollama serve

# Check if running
curl http://localhost:11434/api/tags
```

**5. Memory Tests Failing**
```bash
# Solution: Check memory system
curl -X POST http://localhost:3001/api/memory/stats

# Reset memory if needed
curl -X DELETE http://localhost:3001/api/memory/clear
```

### Debug Mode

Run tests with debug information:

```bash
# Enable debug mode
export DEBUG=true
./test-agent-quick.sh

# Verbose output
./test-agent-comprehensive.sh 2>&1 | tee test-output.log
```

### Test Isolation

Run tests in isolation to avoid conflicts:

```bash
# Use unique test IDs
export TEST_ID="isolated-test-$(date +%s)"
export USER_ID="isolated-user-$(date +%s)"
export SESSION_ID="isolated-session-$(date +%s)"

./test-agent-quick.sh
```

## 📈 Best Practices

### 1. **Run Tests Regularly**
```bash
# Daily quick tests
./test-agent-quick.sh

# Weekly comprehensive tests
./test-agent-comprehensive.sh

# Before deployments
./run-agent-tests.sh all
```

### 2. **Monitor Performance Trends**
```bash
# Track response times
echo "$(date): $(./test-agent-benchmark.sh | grep 'Average response time')" >> performance.log

# Monitor memory usage
echo "$(date): $(./test-memory-persistence.sh | grep 'Memory system')" >> memory.log
```

### 3. **Use Appropriate Test Levels**
```bash
# Development: Quick tests
./test-agent-quick.sh

# Staging: Memory tests
./test-memory-persistence.sh

# Production: Comprehensive tests
./test-agent-comprehensive.sh
```

### 4. **Handle Test Failures Gracefully**
```bash
# Check logs for errors
tail -f logs/app.log

# Verify service status
curl http://localhost:3001/api/health

# Restart services if needed
npm run dev
```

## 🚀 Next Steps

1. **Start with Quick Tests**: Run `./test-agent-quick.sh` to validate basic functionality
2. **Add Memory Tests**: Run `./test-memory-persistence.sh` to verify memory system
3. **Run Comprehensive Tests**: Use `./test-agent-comprehensive.sh` for full validation
4. **Set up CI/CD**: Integrate tests into your deployment pipeline
5. **Monitor Performance**: Track test results over time

The Testing Framework is your safety net that ensures your AI agent system works reliably. Regular testing catches issues early and gives you confidence in your system! 🎉

## 📚 Additional Resources

- [Memory System Documentation](/docs/features/memory-system-overview)
- [API Reference](/docs/api/overview)
- [Troubleshooting Guide](/docs/features/memory-troubleshooting)
- [Performance Optimization](/docs/features/performance-optimization)
