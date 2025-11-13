#!/bin/bash

# VTellTales Development Environment Stop Script v1.0.0
# This script stops all development services

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🛑 Stopping VTellTales Development Environment v1.0.0..."

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Function to stop process by PID
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill $pid 2>/dev/null
            sleep 2
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo "⚡ Force stopping $service_name..."
                kill -9 $pid 2>/dev/null
            fi
            echo "✅ $service_name stopped"
        else
            echo "ℹ️  $service_name was not running"
        fi
        rm -f "$pid_file"
    else
        echo "ℹ️  No PID file found for $service_name"
    fi
}

# Stop services using PID files
stop_process "$LOGS_DIR/backend.pid" "Backend API"
stop_process "$LOGS_DIR/frontend.pid" "Frontend"

# Clean up any remaining processes on our ports
echo "🧹 Cleaning up any remaining processes..."

# Kill any processes on port 5000 (Backend)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🔧 Stopping remaining backend processes on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

# Kill any processes on port 3000 (Frontend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🎨 Stopping remaining frontend processes on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Kill any processes on port 5173 (Vite dev server)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🎨 Stopping remaining Vite processes on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "✅ VTellTales Development Environment stopped successfully!"
echo "📊 Log files preserved in $LOGS_DIR"
echo ""
echo "🚀 To restart: npm run dev"