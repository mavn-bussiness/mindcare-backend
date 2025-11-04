#!/bin/bash
# Production start script for MindCare Backend

echo "🚀 Starting MindCare Backend Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create a .env file from .env.example"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "✅ Starting server..."
echo ""
NODE_ENV=production node server.js
