#!/bin/sh
# Remove set -e temporarily to see all errors
# set -e  # Exit on error

echo "=== Hostinger Auto-Deploy Started ==="
echo "Working directory: $(pwd)"
echo "Commit: $(git log -1 --oneline)"
echo "Time: $(date)"
echo ""
echo "=== Environment Check ==="
echo "PHP version: $(php -v | head -n 1)"
echo "Composer: $(which composer || echo 'NOT FOUND')"
echo "Node: $(which node || echo 'NOT FOUND')"
echo "NPM: $(which npm || echo 'NOT FOUND')"
echo "PATH: $PATH"
echo ""

# Already in project root - no need to cd

# Detect if this is first deployment
FIRST_DEPLOY=false
if [ ! -f "backend/.env" ]; then
    FIRST_DEPLOY=true
    echo "⚠️  FIRST DEPLOYMENT DETECTED"
fi

# Backend deployment
echo "=== Backend Deployment ==="
cd backend

# First-time setup
if [ "$FIRST_DEPLOY" = true ]; then
    echo "Setting up backend for first time..."

    # Create .env from example
    if [ -f ".env.example" ] && [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✓ Created .env from .env.example"
        echo "⚠️  WARNING: You MUST configure .env with database credentials!"
        echo "⚠️  Edit via Hostinger File Manager: backend/.env"
    fi
fi

# Update Composer dependencies (production only)
if [ -f "composer.json" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-dev --no-interaction --optimize-autoloader
fi

# Generate app key if not set
if [ -f "artisan" ] && [ "$FIRST_DEPLOY" = true ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Create storage symlink if doesn't exist
if [ -f "artisan" ] && [ ! -L "public/storage" ]; then
    echo "Creating storage symlink..."
    php artisan storage:link
fi

# Run database migrations
if [ -f "artisan" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

# Seed database on first deploy
if [ "$FIRST_DEPLOY" = true ] && [ -f "artisan" ]; then
    echo "Seeding initial data..."
    php artisan db:seed --class=DatabaseSeeder --force || echo "⚠️  Seeding failed - may need manual setup"
fi

# Clear and cache configurations
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend deployment
echo "=== Frontend Deployment ==="
cd ../frontend

# Create frontend .env if doesn't exist
if [ "$FIRST_DEPLOY" = true ] && [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created frontend .env from example"
fi

# Install npm dependencies
echo "Installing npm dependencies..."
npm ci --production

# Build for production
echo "Building frontend..."
npm run build

# Deploy to backend/public
echo "Deploying frontend to backend/public..."
rm -rf ../backend/public/index.html ../backend/public/assets ../backend/public/vite.svg
cp -r dist/* ../backend/public/

# Set permissions
echo "Setting file permissions..."
cd ..
chmod -R 755 backend/storage backend/bootstrap/cache 2>/dev/null || true

echo "=== Deployment Complete ==="
if [ "$FIRST_DEPLOY" = true ]; then
    echo ""
    echo "🎉 FIRST DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Configure backend/.env with your database credentials"
    echo "2. Configure frontend/.env with your API URL"
    echo "3. Update Stripe keys in backend/.env"
    echo "4. Change admin password (default: admin@sawdustandcoffee.com / password)"
    echo ""
fi
echo "Frontend bundle deployed to: backend/public/"
echo "Check live site: https://capecodwoodworking.com"
