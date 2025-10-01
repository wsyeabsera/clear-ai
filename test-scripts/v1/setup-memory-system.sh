#!/bin/bash

# Memory System Setup Script
# This script helps you set up the memory system with Neo4j and Pinecone

echo "🧠 Setting up Clear-AI Memory System"
echo "====================================="

# Check if Ollama is installed
echo "📋 Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
    
    # Check if nomic-embed-text model is available
    if ollama list | grep -q "nomic-embed-text"; then
        echo "✅ nomic-embed-text model is available"
    else
        echo "📥 Pulling nomic-embed-text model..."
        ollama pull nomic-embed-text
    fi
else
    echo "❌ Ollama is not installed"
    echo "💡 Please install Ollama first:"
    echo "   curl -fsSL https://ollama.ai/install.sh | sh"
    echo "   ollama serve"
    echo "   ollama pull nomic-embed-text"
    exit 1
fi

# Check if Ollama is running
echo "🔍 Checking if Ollama is running..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama is not running"
    echo "💡 Please start Ollama with: ollama serve"
    exit 1
fi

# Check if Neo4j is running
echo "🔍 Checking Neo4j connection..."
if curl -s http://localhost:7474 > /dev/null 2>&1; then
    echo "✅ Neo4j is running"
else
    echo "⚠️  Neo4j is not running"
    echo "💡 Please install and start Neo4j Desktop:"
    echo "   1. Download from https://neo4j.com/download/"
    echo "   2. Install Neo4j Desktop"
    echo "   3. Create a new project and database"
    echo "   4. Start the database"
    echo "   5. Note your password for the .env file"
fi

# Check if environment file exists
echo "📝 Checking environment configuration..."
if [ -f "packages/server/.env" ]; then
    echo "✅ Environment file exists"
else
    echo "📋 Creating environment file..."
    cp packages/server/env.memory.example packages/server/.env
    echo "⚠️  Please update packages/server/.env with your Neo4j and Pinecone credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build shared package
echo "🔨 Building shared package..."
yarn build:shared

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update packages/server/.env with your credentials:"
echo "   - NEO4J_PASSWORD=your_neo4j_password"
echo "   - PINECONE_API_KEY=your_pinecone_api_key"
echo "   - PINECONE_ENVIRONMENT=your_pinecone_environment"
echo ""
echo "2. Start the server:"
echo "   cd packages/server && yarn dev"
echo ""
echo "3. Test the system:"
echo "   node test-ollama-embeddings.js"
echo "   node test-memory-system.js"
echo ""
echo "4. View API documentation:"
echo "   http://localhost:3001/api-docs"
echo ""
echo "🔗 Useful links:"
echo "   - Neo4j Desktop: https://neo4j.com/download/"
echo "   - Pinecone Console: https://app.pinecone.io/"
echo "   - Ollama Models: https://ollama.ai/library"
