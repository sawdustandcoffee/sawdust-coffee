#!/usr/bin/env php
<?php
// Force output immediately
ob_implicit_flush(true);
@ob_end_flush();

// Also log to file for debugging
$logFile = 'deployment.log';
function logMessage($msg) {
    global $logFile;
    echo $msg . PHP_EOL;
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' - ' . $msg . PHP_EOL, FILE_APPEND);
}

logMessage("=== Hostinger Deployment Started ===");
logMessage("PHP Version: " . PHP_VERSION);
logMessage("Working directory: " . getcwd());
logMessage("Script: " . __FILE__);
logMessage("");

// Check if required directories exist
if (!is_dir('backend')) {
    logMessage("❌ ERROR: backend/ directory not found!");
    exit(1);
}
if (!is_dir('frontend')) {
    logMessage("❌ ERROR: frontend/ directory not found!");
    exit(1);
}

// Backend deployment
logMessage("=== Backend Deployment ===");

// Create .env if doesn't exist
logMessage("Checking for backend/.env...");
if (!file_exists('backend/.env') && file_exists('backend/.env.example')) {
    copy('backend/.env.example', 'backend/.env');
    logMessage("✓ Created backend/.env from example");
    logMessage("⚠️  CONFIGURE backend/.env with database credentials before next deploy!");
} else {
    logMessage("✓ backend/.env exists");
}

// Run migrations (may fail if .env not configured)
logMessage("");
logMessage("Running database migrations...");
$output = [];
exec('php backend/artisan migrate --force 2>&1', $output, $return);
logMessage("Migration exit code: $return");
if ($return === 0) {
    logMessage("✓ Migrations completed");
} else {
    logMessage("⚠️  Migrations skipped (database not configured)");
    logMessage("Migration output: " . implode("\n", array_slice($output, 0, 5)));
}

// Cache Laravel configs
logMessage("Caching Laravel configs...");
$output = [];
exec('php backend/artisan config:cache 2>&1', $output, $return);
logMessage("config:cache exit code: $return");
$output = [];
exec('php backend/artisan route:cache 2>&1', $output, $return);
logMessage("route:cache exit code: $return");
$output = [];
exec('php backend/artisan view:cache 2>&1', $output, $return);
logMessage("view:cache exit code: $return");
logMessage("✓ Laravel optimized");

// Frontend deployment
logMessage("");
logMessage("=== Frontend Deployment ===");

// Create frontend .env if doesn't exist
logMessage("Checking for frontend/.env...");
if (!file_exists('frontend/.env') && file_exists('frontend/.env.example')) {
    copy('frontend/.env.example', 'frontend/.env');
    logMessage("✓ Created frontend/.env from example");
} else {
    logMessage("✓ frontend/.env exists");
}

// Build frontend
logMessage("Building frontend (this may take 1-2 minutes)...");
logMessage("Changing to frontend directory...");
chdir('frontend');
logMessage("Current directory: " . getcwd());

logMessage("Running: npm ci --production");
$output = [];
exec('npm ci --production 2>&1', $output, $return);
logMessage("npm ci exit code: $return");
if ($return !== 0) {
    logMessage("❌ npm install failed with exit code: $return");
    logMessage("Output: " . implode("\n", $output));
    exit(1);
}
logMessage("✓ npm dependencies installed");

logMessage("Running: npm run build");
$output = [];
exec('npm run build 2>&1', $output, $return);
logMessage("npm build exit code: $return");
if ($return !== 0) {
    logMessage("❌ Frontend build failed with exit code: $return");
    logMessage("Output: " . implode("\n", $output));
    exit(1);
}
chdir('..');
logMessage("✓ Frontend built successfully");

// Deploy to backend/public
logMessage("Deploying frontend to backend/public...");
logMessage("Removing old frontend files...");
exec('rm -rf backend/public/index.html backend/public/assets backend/public/vite.svg 2>&1', $output, $return);
logMessage("Copying new frontend files...");
$output = [];
exec('cp -r frontend/dist/* backend/public/ 2>&1', $output, $return);
logMessage("Copy exit code: $return");
if ($return === 0) {
    logMessage("✓ Frontend deployed!");
} else {
    logMessage("❌ Frontend deployment failed!");
    logMessage("Output: " . implode("\n", $output));
    exit(1);
}

logMessage("");
logMessage("=== Deployment Complete ===");
logMessage("🎉 Site deployed to: https://capecodwoodworking.com");

if (!file_exists('backend/.env.configured')) {
    logMessage("");
    logMessage("📝 NEXT STEPS:");
    logMessage("1. Edit backend/.env with your database credentials");
    logMessage("2. Push any change to trigger re-deployment");
}

exit(0);
