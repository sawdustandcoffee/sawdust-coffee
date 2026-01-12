#!/bin/bash

################################################################################
# Sawdust & Coffee - Hostinger Deployment Script
# Domain: capecodwoodworking.com
#
# This script automates the deployment to Hostinger hosting
# Run this script ON the Hostinger server via SSH
#
# Usage:
#   chmod +x hostinger-deploy.sh
#   ./hostinger-deploy.sh
################################################################################

set -e  # Exit on error

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

echo "========================================="
echo "Sawdust & Coffee - Hostinger Deployment"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/artisan" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Prompt for configuration values
print_status "Please provide the following configuration values:"
echo ""

read -p "Database Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Name [sawdust_coffee_prod]: " DB_DATABASE
DB_DATABASE=${DB_DATABASE:-sawdust_coffee_prod}

read -p "Database Username: " DB_USERNAME
if [ -z "$DB_USERNAME" ]; then
    print_error "Database username is required"
    exit 1
fi

read -sp "Database Password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    print_error "Database password is required"
    exit 1
fi

read -p "Frontend Domain [capecodwoodworking.com]: " FRONTEND_DOMAIN
FRONTEND_DOMAIN=${FRONTEND_DOMAIN:-capecodwoodworking.com}

read -p "API Domain [api.capecodwoodworking.com]: " API_DOMAIN
API_DOMAIN=${API_DOMAIN:-api.capecodwoodworking.com}

read -p "Admin Email [admin@sawdustandcoffee.com]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@sawdustandcoffee.com}

read -p "Enable production mode? (true/false) [true]: " PRODUCTION_MODE
PRODUCTION_MODE=${PRODUCTION_MODE:-true}

if [ "$PRODUCTION_MODE" = "true" ]; then
    APP_ENV="production"
    APP_DEBUG="false"
else
    APP_ENV="staging"
    APP_DEBUG="true"
fi

echo ""
print_warning "Note: Stripe keys and mail settings can be configured later in backend/.env"
echo ""

################################################################################
# BACKEND DEPLOYMENT
################################################################################

print_status "Starting backend deployment..."

# Navigate to backend directory
cd backend

# Backup existing .env if it exists
if [ -f .env ]; then
    print_warning "Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Create .env file
print_status "Creating backend .env file..."
cat > .env << EOF
APP_NAME="Sawdust & Coffee"
APP_ENV=${APP_ENV}
APP_KEY=
APP_DEBUG=${APP_DEBUG}
APP_URL=https://${API_DOMAIN}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

BROADCAST_DRIVER=log
CACHE_DRIVER=database
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.${FRONTEND_DOMAIN}

SANCTUM_STATEFUL_DOMAINS=${FRONTEND_DOMAIN},www.${FRONTEND_DOMAIN}

# Stripe Configuration (Test keys - UPDATE THESE FOR PRODUCTION)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Mail Configuration (UPDATE THESE FOR PRODUCTION)
MAIL_MAILER=log
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@${FRONTEND_DOMAIN}
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@${FRONTEND_DOMAIN}
MAIL_FROM_NAME="\${APP_NAME}"

# Admin Configuration
ADMIN_EMAIL=${ADMIN_EMAIL}
EOF

print_success "Backend .env created"

# Check for Composer
print_status "Checking for Composer..."
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed. Please install Composer first."
    exit 1
fi
print_success "Composer found"

# Install Composer dependencies
print_status "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
print_success "Composer dependencies installed"

# Generate application key
print_status "Generating application key..."
php artisan key:generate --force
print_success "Application key generated"

# Test database connection
print_status "Testing database connection..."
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connection successful';" 2>&1 | grep -q "successful"
if [ $? -eq 0 ]; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your credentials."
    exit 1
fi

# Run migrations
print_status "Running database migrations..."
php artisan migrate --force
print_success "Database migrations completed"

# Seed initial data
print_status "Seeding initial data..."
php artisan db:seed --class=DatabaseSeeder --force
print_success "Initial data seeded"
print_warning "Default admin credentials: ${ADMIN_EMAIL} / password"

# Create storage link
print_status "Creating storage link..."
if [ -L "public/storage" ]; then
    rm public/storage
fi
php artisan storage:link
print_success "Storage link created"

# Set permissions
print_status "Setting permissions..."
chmod -R 775 storage bootstrap/cache
print_success "Permissions set"

# Optimize for production
if [ "$PRODUCTION_MODE" = "true" ]; then
    print_status "Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    print_success "Production optimizations applied"
fi

print_success "Backend deployment completed!"

################################################################################
# FRONTEND DEPLOYMENT
################################################################################

cd ../frontend

print_status "Starting frontend deployment..."

# Backup existing .env if it exists
if [ -f .env ]; then
    print_warning "Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Create frontend .env file
print_status "Creating frontend .env file..."
cat > .env << EOF
VITE_API_URL=https://${API_DOMAIN}/api
EOF
print_success "Frontend .env created"

# Check for npm
print_status "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi
print_success "npm found"

# Install npm dependencies
print_status "Installing npm dependencies..."
npm ci --production
print_success "npm dependencies installed"

# Build for production
print_status "Building frontend for production..."
npm run build
print_success "Frontend build completed"

# Check if dist folder was created
if [ ! -d "dist" ]; then
    print_error "Build failed - dist folder not found"
    exit 1
fi

print_success "Frontend deployment completed!"
print_status "Build output is in: frontend/dist/"

################################################################################
# POST-DEPLOYMENT INSTRUCTIONS
################################################################################

cd ..

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
print_success "Backend and frontend have been deployed successfully!"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Configure Apache/Nginx Virtual Hosts:"
echo "   - API: ${API_DOMAIN} → backend/public/"
echo "   - Frontend: ${FRONTEND_DOMAIN} → frontend/dist/"
echo ""
echo "2. Copy frontend build to web root (choose one):"
echo "   ${BLUE}Option A:${NC} cp -r frontend/dist/* /path/to/${FRONTEND_DOMAIN}/public_html/"
echo "   ${BLUE}Option B:${NC} Serve from backend/public (requires Laravel fallback route)"
echo ""
echo "3. Configure SSL certificates for both domains"
echo ""
echo "4. Update Stripe keys in backend/.env:"
echo "   - STRIPE_PUBLISHABLE_KEY (use pk_live_... for production)"
echo "   - STRIPE_SECRET_KEY (use sk_live_... for production)"
echo "   - STRIPE_WEBHOOK_SECRET"
echo ""
echo "5. Update mail settings in backend/.env:"
echo "   - MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD"
echo ""
echo "6. Configure Stripe webhook:"
echo "   - Endpoint: https://${API_DOMAIN}/api/webhooks/stripe"
echo "   - Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed"
echo ""
echo "7. Change admin password:"
echo "   - Login at: https://${FRONTEND_DOMAIN}/login"
echo "   - Email: ${ADMIN_EMAIL}"
echo "   - Password: ${YELLOW}password${NC} (CHANGE THIS IMMEDIATELY)"
echo ""
echo "8. Test the application:"
echo "   - Visit: https://${FRONTEND_DOMAIN}"
echo "   - Admin panel: https://${FRONTEND_DOMAIN}/admin"
echo "   - API test: curl https://${API_DOMAIN}/api/public/products"
echo ""
echo "IMPORTANT FILES:"
echo "   - Backend config: backend/.env"
echo "   - Frontend config: frontend/.env"
echo "   - Laravel logs: backend/storage/logs/laravel.log"
echo ""
echo "VERIFICATION COMMANDS:"
echo "   cd backend"
echo "   php artisan --version"
echo "   php artisan migrate:status"
echo "   php artisan route:list | grep bundles"
echo "   php artisan route:list | grep collections"
echo "   php artisan route:list | grep search"
echo ""
print_warning "Remember to set up daily database backups!"
echo ""

# Create a quick reference file
cat > DEPLOYMENT_INFO.txt << EOF
Sawdust & Coffee - Deployment Information
==========================================

Deployed: $(date)

Configuration:
- Frontend Domain: ${FRONTEND_DOMAIN}
- API Domain: ${API_DOMAIN}
- Database: ${DB_DATABASE}
- Environment: ${APP_ENV}

Admin Access:
- URL: https://${FRONTEND_DOMAIN}/login
- Email: ${ADMIN_EMAIL}
- Default Password: password (CHANGE IMMEDIATELY)

GitHub Repository:
- https://github.com/sawdustandcoffee/sawdust-coffee

New Features Deployed:
1. Product Bundles/Kits
2. Product Reviews & Ratings
3. Featured Collections (manual + auto)
4. Product Recommendations (3 algorithms)
5. Advanced Search with faceted filtering

API Endpoints:
- GET /api/public/bundles
- GET /api/public/collections
- GET /api/public/recommendations/*
- GET /api/public/search
- GET /api/public/products/{productId}/reviews

Important Files:
- Backend .env: backend/.env
- Frontend .env: frontend/.env
- Logs: backend/storage/logs/laravel.log

TODO:
[ ] Configure Apache/Nginx vhosts
[ ] Set up SSL certificates
[ ] Update Stripe live keys
[ ] Update mail configuration
[ ] Change admin password
[ ] Configure Stripe webhook
[ ] Set up database backups
[ ] Test all features
EOF

print_success "Deployment info saved to DEPLOYMENT_INFO.txt"

echo ""
print_success "🎉 Deployment script completed successfully!"
echo ""
