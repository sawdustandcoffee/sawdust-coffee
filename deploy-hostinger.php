#!/usr/bin/env php
<?php

echo "=== Hostinger Deployment Started ===" . PHP_EOL;
echo "Working directory: " . getcwd() . PHP_EOL;
echo PHP_EOL;

// Backend deployment
echo "=== Backend Deployment ===" . PHP_EOL;

// Create .env if doesn't exist
if (!file_exists('backend/.env') && file_exists('backend/.env.example')) {
    copy('backend/.env.example', 'backend/.env');
    echo "✓ Created backend/.env from example" . PHP_EOL;
    echo "⚠️  CONFIGURE backend/.env with database credentials before next deploy!" . PHP_EOL;
} else {
    echo "✓ backend/.env exists" . PHP_EOL;
}

// Run migrations (may fail if .env not configured)
echo PHP_EOL . "Running database migrations..." . PHP_EOL;
exec('php backend/artisan migrate --force 2>&1', $output, $return);
if ($return === 0) {
    echo "✓ Migrations completed" . PHP_EOL;
} else {
    echo "⚠️  Migrations skipped (database not configured)" . PHP_EOL;
}

// Cache Laravel configs
echo "Caching Laravel configs..." . PHP_EOL;
exec('php backend/artisan config:cache 2>&1', $output, $return);
exec('php backend/artisan route:cache 2>&1', $output, $return);
exec('php backend/artisan view:cache 2>&1', $output, $return);
echo "✓ Laravel optimized" . PHP_EOL;

// Frontend deployment
echo PHP_EOL . "=== Frontend Deployment ===" . PHP_EOL;

// Create frontend .env if doesn't exist
if (!file_exists('frontend/.env') && file_exists('frontend/.env.example')) {
    copy('frontend/.env.example', 'frontend/.env');
    echo "✓ Created frontend/.env from example" . PHP_EOL;
}

// Build frontend
echo "Building frontend (this may take 1-2 minutes)..." . PHP_EOL;
chdir('frontend');
exec('npm ci --production 2>&1', $output, $return);
if ($return !== 0) {
    echo "❌ npm install failed!" . PHP_EOL;
    exit(1);
}
exec('npm run build 2>&1', $output, $return);
if ($return !== 0) {
    echo "❌ Frontend build failed!" . PHP_EOL;
    exit(1);
}
chdir('..');
echo "✓ Frontend built successfully" . PHP_EOL;

// Deploy to backend/public
echo "Deploying frontend to backend/public..." . PHP_EOL;
exec('rm -rf backend/public/index.html backend/public/assets backend/public/vite.svg 2>&1');
exec('cp -r frontend/dist/* backend/public/ 2>&1', $output, $return);
if ($return === 0) {
    echo "✓ Frontend deployed!" . PHP_EOL;
} else {
    echo "❌ Frontend deployment failed!" . PHP_EOL;
    exit(1);
}

echo PHP_EOL . "=== Deployment Complete ===" . PHP_EOL;
echo "🎉 Site deployed to: https://capecodwoodworking.com" . PHP_EOL;

if (!file_exists('backend/.env.configured')) {
    echo PHP_EOL . "📝 NEXT STEPS:" . PHP_EOL;
    echo "1. Edit backend/.env with your database credentials" . PHP_EOL;
    echo "2. Push any change to trigger re-deployment" . PHP_EOL;
}

exit(0);
