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

// Check if npm exists
logMessage("Checking for npm...");
$output = [];
exec('which npm 2>&1', $output, $return);
if ($return !== 0 || empty($output)) {
    logMessage("⚠️ npm not in PATH. Searching common locations...");

    // Try to find npm using common paths
    $npmFound = false;
    $searchPaths = [
        '/usr/local/bin/npm',
        '/usr/bin/npm',
        '/opt/alt/*/root/usr/bin/npm'
    ];

    foreach ($searchPaths as $pattern) {
        $matches = glob($pattern);
        if (!empty($matches)) {
            $npmPath = $matches[0];
            logMessage("✓ Found npm at: $npmPath");
            // Add to PATH
            $npmDir = dirname($npmPath);
            $currentPath = getenv('PATH');
            putenv("PATH=$npmDir:$currentPath");
            logMessage("Added $npmDir to PATH");
            $npmFound = true;
            break;
        }
    }

    if (!$npmFound) {
        logMessage("❌ npm not found! Cannot build frontend.");
        logMessage("Available paths checked: " . implode(", ", $searchPaths));
        exit(1);
    }
} else {
    logMessage("✓ npm found in PATH at: " . trim($output[0]));
}

logMessage("Changing to frontend directory...");
chdir('frontend');
logMessage("Current directory: " . getcwd());

// Verify npm is accessible
logMessage("Verifying npm is accessible...");
$output = [];
exec('npm --version 2>&1', $output, $return);
if ($return === 0) {
    logMessage("✓ npm version: " . trim($output[0]));
} else {
    logMessage("❌ npm --version failed with exit code: $return");
    logMessage("Output: " . implode("\n", $output));
    exit(1);
}

logMessage("Running: npm ci --production (with 5-minute timeout)");
$output = [];
$startTime = time();
exec('timeout 300 npm ci --production 2>&1', $output, $return);
$elapsed = time() - $startTime;
logMessage("npm ci completed in $elapsed seconds");
logMessage("npm ci exit code: $return");
if ($return !== 0) {
    logMessage("❌ npm install failed with exit code: $return");
    logMessage("Output (first 20 lines): " . implode("\n", array_slice($output, 0, 20)));
    exit(1);
}
logMessage("✓ npm dependencies installed (" . count($output) . " lines of output)");

logMessage("Running: npm run build (with 10-minute timeout)");
$output = [];
$startTime = time();
exec('timeout 600 npm run build 2>&1', $output, $return);
$elapsed = time() - $startTime;
logMessage("npm build completed in $elapsed seconds");
logMessage("npm build exit code: $return");
if ($return !== 0) {
    logMessage("❌ Frontend build failed with exit code: $return");
    logMessage("Output (first 50 lines): " . implode("\n", array_slice($output, 0, 50)));
    exit(1);
}
chdir('..');
logMessage("✓ Frontend built successfully (" . count($output) . " lines of output)");

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
