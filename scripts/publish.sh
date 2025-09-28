#!/bin/bash

# Clear AI Package Publishing Script
# This script publishes the core packages to npm (excluding client)

set -e

echo "🚀 Publishing Clear AI packages to npm..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if user is logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    print_error "You are not logged in to npm. Please run 'npm login' first."
    exit 1
fi

print_success "Logged in to npm as $(npm whoami)"

# Build all packages first
print_status "Building all packages..."
yarn build:packages

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the errors before publishing."
    exit 1
fi

print_success "All packages built successfully"

# Publish packages in dependency order
packages=("shared" "mcp-basic" "server" "core")

for package in "${packages[@]}"; do
    if [ "$package" = "core" ]; then
        print_status "Publishing clear-ai-core..."
        cd .
        package_name="clear-ai-core"
    else
        print_status "Publishing clear-ai-$package..."
        cd "packages/$package"
        package_name="clear-ai-$package"
    fi
    
    # Check if package already exists
    if npm view "$package_name" version > /dev/null 2>&1; then
        current_version=$(npm view "$package_name" version)
        package_version=$(node -p "require('./package.json').version")
        
        if [ "$current_version" = "$package_version" ]; then
            print_warning "$package_name@$package_version already exists. Skipping..."
            if [ "$package" != "core" ]; then
                cd ../..
            fi
            continue
        fi
    fi
    
    # Publish the package
    npm publish --access public
    
    if [ $? -eq 0 ]; then
        print_success "$package_name published successfully"
    else
        print_error "Failed to publish $package_name"
        exit 1
    fi
    
    if [ "$package" != "core" ]; then
        cd ../..
    fi
done

print_success "🎉 All packages published successfully!"
print_status "Published packages:"
for package in "${packages[@]}"; do
    if [ "$package" = "core" ]; then
        echo "  - clear-ai-core"
    else
        echo "  - clear-ai-$package"
    fi
done

print_status "You can now install these packages with:"
echo "  npm install clear-ai-core"
echo "  # Or install individual packages:"
echo "  npm install clear-ai-shared clear-ai-mcp-basic clear-ai-server"
