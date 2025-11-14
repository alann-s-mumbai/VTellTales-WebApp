#!/bin/bash

# VTellTales Project Setup Script v1.0.0
# This script sets up the development environment

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🛠️  VTellTales Project Setup v1.0.0"
echo "==================================="

# Check for required tools
echo "🔍 Checking prerequisites..."

# Check .NET
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found"
    echo "   Please install .NET 8.0 SDK: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
else
    echo "✅ .NET SDK found: $(dotnet --version)"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo "   Please install Node.js 18+: https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js found: $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    echo "   Please install npm"
    exit 1
else
    echo "✅ npm found: $(npm --version)"
fi

echo ""
echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "🎨 Setting up frontend..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "ℹ️  Frontend dependencies already installed"
fi

# Restore backend dependencies
echo "🔧 Setting up backend..."
cd "$PROJECT_ROOT/backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API"
dotnet restore
echo "✅ Backend dependencies restored"

# Return to project root
cd "$PROJECT_ROOT"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p logs
mkdir -p deployment/frontend
mkdir -p deployment/backend
echo "✅ Directories created"

# Make scripts executable
echo "🔧 Setting script permissions..."
chmod +x scripts/*.sh
echo "✅ Scripts made executable"

echo ""
echo "🎉 Setup Complete!"
echo "================="
echo ""
echo "🚀 Quick Start:"
echo "   npm run dev         # Start development environment"
echo "   npm run dev:backend # Start backend only"
echo "   npm run stop        # Stop all services"
echo ""
echo "📍 Useful Commands:"
echo "   npm run build       # Build both frontend and backend"
echo "   npm run test        # Run all tests"
echo "   npm run lint        # Lint frontend code"
echo ""
echo "📊 Logs Location: $PROJECT_ROOT/logs/"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://127.0.0.1:5001"
echo ""