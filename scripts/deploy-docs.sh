#!/bin/bash

# Deploy Clear AI Documentation
# This script builds and deploys the Docusaurus documentation

set -e

echo "🚀 Deploying Clear AI Documentation..."

# Navigate to docs directory
cd docs

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the documentation
echo "🔨 Building documentation..."
npm run build

echo "✅ Documentation built successfully!"
echo ""
echo "📚 Your documentation is ready to deploy:"
echo "   📁 Build directory: docs/build"
echo ""
echo "🌐 Deployment options:"
echo "   1. Vercel: https://vercel.com (recommended)"
echo "   2. Netlify: https://netlify.com"
echo "   3. GitHub Pages: Push to main branch"
echo "   4. Surge: npx surge build/"
echo ""
echo "🔗 Documentation will be available at:"
echo "   https://wsyeabsera.github.io/clear-ai/"
echo ""
echo "📖 NPM package links:"
echo "   npm docs clear-ai"
echo "   npm home clear-ai"
