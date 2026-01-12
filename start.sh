#!/bin/bash

# Sawdust & Coffee - Start Script
# Starts both backend and frontend servers

set -e

echo "========================================="
echo "Starting Sawdust & Coffee Application"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker services are running
if ! docker ps | grep -q sawdust_mysql; then
    echo -e "${BLUE}Starting Docker services...${NC}"
    docker-compose up -d
    sleep 5
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Start backend server in background
echo -e "${BLUE}Starting backend server on http://localhost:8000${NC}"
cd backend
php artisan serve > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend server in background
echo -e "${BLUE}Starting frontend server on http://localhost:5173${NC}"
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Application started successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "phpMyAdmin: http://localhost:8080"
echo ""
echo "Logs are being written to:"
echo "  - logs/backend.log"
echo "  - logs/frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Tail logs
tail -f logs/backend.log logs/frontend.log
