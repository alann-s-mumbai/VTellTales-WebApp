#!/bin/bash

# VTellTales Development Environment Startup Script v1.0.0
# This script starts both frontend and backend services

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🎯 VTellTales Development Environment v1.0.0"
echo "============================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use. Stopping existing processes..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    echo "⏳ Waiting for $name to be ready..."
    
    for i in {1..30}; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        sleep 2
    done
    echo "❌ $name failed to start within 60 seconds"
    return 1
}

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 8.0 SDK"
    echo "   Download: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Download: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ All prerequisites found"

# Verify directory structure
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Create logs directory
mkdir -p "$LOGS_DIR"

# Clean up any existing processes on our ports
check_port 5000  # Backend
check_port 5173  # Frontend (Vite)
check_port 3000  # Alternative frontend port

# Start Backend API
echo ""
echo "🔧 Starting Backend API..."
cd "$BACKEND_DIR"

# Restore packages
echo "📦 Restoring .NET packages..."
dotnet restore > /dev/null 2>&1

# Set environment to Development
export ASPNETCORE_ENVIRONMENT=Development

# Start backend in background
nohup dotnet run --urls "http://0.0.0.0:5000" > "$LOGS_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Start Frontend
echo "🎨 Starting Frontend..."
cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
fi

# Start frontend in background
nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Return to project root
cd "$PROJECT_ROOT"

echo ""
echo "🚀 Services are starting..."

# Wait for services to be ready
wait_for_service "http://127.0.0.1:5001" "Backend API"
wait_for_service "http://localhost:3000" "Frontend"

echo ""
echo "🎉 VTellTales Development Environment is Ready!"
echo "=============================================="
echo ""
echo "📍 Services:"
echo "   🔧 Backend API:  http://127.0.0.1:5001"
echo "   🎨 Frontend:     http://localhost:3000"
echo "   📋 API Docs:     http://127.0.0.1:5001/swagger"
echo ""
echo "🧪 Test Endpoints:"
echo "   curl http://127.0.0.1:5001/storyapi/StoryBook/getallstorytype"
echo "   curl http://127.0.0.1:5001/storyapi/StoryBook/GetAdminAllStories"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📊 View Logs:"
echo "   Backend:  tail -f $LOGS_DIR/backend.log"
echo "   Frontend: tail -f $LOGS_DIR/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   npm run stop"
echo "   Or: $PROJECT_ROOT/scripts/stop-dev.sh"
echo ""

# Save PIDs for stop script
echo $BACKEND_PID > "$LOGS_DIR/backend.pid"
echo $FRONTEND_PID > "$LOGS_DIR/frontend.pid"

# Keep script running and show live logs
echo "📊 Live Logs (Press Ctrl+C to stop monitoring):"
echo "==============================================="
tail -f "$LOGS_DIR/backend.log" "$LOGS_DIR/frontend.log"