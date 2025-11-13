#!/bin/bash

# VTellTales Backend Startup Script v1.0.0
# This script starts the .NET Core backend API

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API"

echo "🚀 Starting VTellTales Backend API v1.0.0..."

# Navigate to the backend directory
cd "$BACKEND_DIR"

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET is not installed. Please install .NET 8.0 SDK"
    echo "   Download: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "VTellTales_WA.API.csproj" ]; then
    echo "❌ Error: Cannot find VTellTales_WA.API.csproj"
    echo "   Current directory: $(pwd)"
    echo "   Expected: $BACKEND_DIR"
    exit 1
fi

# Restore packages if needed
echo "📦 Restoring packages..."
dotnet restore

# Check for appsettings files
if [ ! -f "appsettings.json" ]; then
    echo "⚠️  Warning: appsettings.json not found"
fi

echo ""
echo "🌟 Backend API starting on http://localhost:5000"
echo "📋 API Documentation: http://localhost:5000/swagger"
echo "🔗 Test endpoint: http://localhost:5000/storyapi/StoryBook/getallstorytype"
echo "📁 Working directory: $(pwd)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Set environment to Development for local testing
export ASPNETCORE_ENVIRONMENT=LocalDev

# Start the backend API
dotnet run --urls "http://0.0.0.0:5000"