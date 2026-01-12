#!/bin/bash

# Sawdust & Coffee Deployment Script
# This script sets up and deploys the full application

set -e  # Exit on error

echo "========================================="
echo "Sawdust & Coffee - Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if Docker is running
print_status "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

# Start Docker services
print_status "Starting Docker services (MySQL & phpMyAdmin)..."
docker-compose up -d
print_success "Docker services started"

# Wait for MySQL to be ready
print_status "Waiting for MySQL to be ready..."
sleep 5
until docker exec sawdust_mysql mysqladmin ping -h localhost --silent; do
    printf '.'
    sleep 1
done
echo ""
print_success "MySQL is ready"

# Backend setup
print_status "Setting up backend..."
cd backend

# Install Composer dependencies if needed
if [ ! -d "vendor" ]; then
    print_status "Installing Composer dependencies..."
    composer install
    print_success "Composer dependencies installed"
else
    print_status "Composer dependencies already installed"
fi

# Generate app key if needed
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating application key..."
    php artisan key:generate
    print_success "Application key generated"
fi

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force
print_success "Database migrations completed"

# Create storage link if it doesn't exist
if [ ! -L "public/storage" ]; then
    print_status "Creating storage link..."
    php artisan storage:link
    print_success "Storage link created"
fi

# Clear and cache configuration
print_status "Optimizing backend..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
print_success "Backend optimized"

cd ..

# Frontend setup
print_status "Setting up frontend..."
cd frontend

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
    print_success "npm dependencies installed"
else
    print_status "npm dependencies already installed"
fi

cd ..

print_success "Deployment setup complete!"
echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Start the backend server:"
echo "   ${GREEN}cd backend && php artisan serve${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "3. Access the application:"
echo "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo "   Backend API: ${GREEN}http://localhost:8000${NC}"
echo "   phpMyAdmin: ${GREEN}http://localhost:8080${NC}"
echo ""
echo "4. Default database credentials:"
echo "   Database: sawdust_coffee"
echo "   Username: sawdust"
echo "   Password: sawdust_secret"
echo ""
echo "5. To stop Docker services:"
echo "   ${YELLOW}docker-compose down${NC}"
echo ""
print_warning "Note: For testing payments, you'll need to set up Stripe test keys in backend/.env"
echo ""
