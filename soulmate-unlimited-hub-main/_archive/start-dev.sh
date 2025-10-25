#!/bin/bash

# Kill any existing processes
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "🚀 Starting Soulmate Development Environment..."

# Start backend server on port 5000
echo "📦 Starting Backend Server on http://localhost:5000"
PORT=5000 npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend with Vite on port 5173
echo "🎨 Starting Frontend on http://localhost:5173"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "   Backend API: http://localhost:5000"
echo "   Frontend UI: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to kill both processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "tsx server/index.ts" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Wait for both processes
wait