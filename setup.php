<?php
/**
 * One-time Laravel Setup Script for Hostinger
 *
 * Upload this file to: /home/u135614800/sawdust-coffee/setup.php
 * Access via: https://capecodwoodworking.com/setup.php
 *
 * This script will:
 * 1. Create backend/.env file with your database credentials
 * 2. Run Laravel setup commands (key:generate, migrate, etc.)
 * 3. Set proper permissions
 * 4. Delete itself when done
 */

// Prevent running in production without confirmation
$confirm = $_GET['confirm'] ?? '';
if ($confirm !== 'yes') {
    die('
    <h1>Laravel Setup Script</h1>
    <p>This script will configure your Laravel application.</p>
    <p><strong>WARNING:</strong> This will create a fresh .env file and run migrations!</p>
    <p>Before proceeding, make sure you have:</p>
    <ul>
        <li>MySQL database created in Hostinger</li>
        <li>Database name, username, and password ready</li>
    </ul>
    <form method="GET">
        <h3>Database Configuration:</h3>
        <label>Database Name: <input type="text" name="db_name" value="u135614800_sawdust" required /></label><br>
        <label>Database User: <input type="text" name="db_user" value="u135614800_admin" required /></label><br>
        <label>Database Password: <input type="password" name="db_pass" required /></label><br>
        <label>Database Host: <input type="text" name="db_host" value="localhost" required /></label><br>
        <br>
        <h3>Stripe Keys (optional - can configure later):</h3>
        <label>Stripe Publishable Key: <input type="text" name="stripe_pub" placeholder="pk_test_..." /></label><br>
        <label>Stripe Secret Key: <input type="text" name="stripe_secret" placeholder="sk_test_..." /></label><br>
        <br>
        <input type="hidden" name="confirm" value="yes" />
        <button type="submit">Run Setup</button>
    </form>
    ');
}

// Configuration from form
$dbName = $_GET['db_name'] ?? 'u135614800_sawdust';
$dbUser = $_GET['db_user'] ?? 'u135614800_admin';
$dbPass = $_GET['db_pass'] ?? '';
$dbHost = $_GET['db_host'] ?? 'localhost';
$stripePub = $_GET['stripe_pub'] ?? 'pk_test_your_key';
$stripeSecret = $_GET['stripe_secret'] ?? 'sk_test_your_key';

if (empty($dbPass)) {
    die('Error: Database password is required!');
}

echo '<pre>';
echo "=== Laravel Setup Script ===\n\n";

// Change to project root
$projectRoot = __DIR__;
$backendDir = $projectRoot . '/backend';

if (!is_dir($backendDir)) {
    die("Error: Backend directory not found at: $backendDir\n");
}

chdir($backendDir);
echo "✓ Changed to backend directory: $backendDir\n\n";

// Step 1: Create .env file
echo "Step 1: Creating .env file...\n";

$envContent = <<<ENV
APP_NAME="Sawdust & Coffee"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://capecodwoodworking.com
APP_KEY=

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=$dbHost
DB_PORT=3306
DB_DATABASE=$dbName
DB_USERNAME=$dbUser
DB_PASSWORD=$dbPass

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.capecodwoodworking.com

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@capecodwoodworking.com
MAIL_FROM_NAME="\${APP_NAME}"

SANCTUM_STATEFUL_DOMAINS=capecodwoodworking.com,www.capecodwoodworking.com

STRIPE_PUBLISHABLE_KEY=$stripePub
STRIPE_SECRET_KEY=$stripeSecret
STRIPE_WEBHOOK_SECRET=

VITE_APP_NAME="\${APP_NAME}"
ENV;

if (file_put_contents('.env', $envContent)) {
    echo "✓ Created .env file\n\n";
} else {
    die("✗ Failed to create .env file\n");
}

// Step 2: Generate application key
echo "Step 2: Generating application key...\n";
$output = shell_exec('php artisan key:generate --force 2>&1');
echo $output . "\n";

// Step 3: Test database connection
echo "Step 3: Testing database connection...\n";
try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbName",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✓ Database connection successful\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Step 4: Run migrations
echo "Step 4: Running database migrations...\n";
$output = shell_exec('php artisan migrate --seed --force 2>&1');
echo $output . "\n";

// Step 5: Create storage symlink
echo "Step 5: Creating storage symlink...\n";
$output = shell_exec('php artisan storage:link 2>&1');
echo $output . "\n";

// Step 6: Cache configurations
echo "Step 6: Caching configurations...\n";
$output = shell_exec('php artisan config:cache 2>&1');
echo $output;
$output = shell_exec('php artisan route:cache 2>&1');
echo $output;
$output = shell_exec('php artisan view:cache 2>&1');
echo $output . "\n";

// Step 7: Set permissions
echo "Step 7: Setting permissions...\n";
shell_exec('chmod -R 755 storage bootstrap/cache 2>&1');
echo "✓ Permissions set\n\n";

// Step 8: Verify frontend files
echo "Step 8: Verifying frontend files...\n";
$frontendFiles = [
    'public/index.html',
    'public/assets',
    'public/vite.svg'
];

foreach ($frontendFiles as $file) {
    if (file_exists($file)) {
        echo "✓ Found: $file\n";
    } else {
        echo "✗ Missing: $file\n";
    }
}

echo "\n=== Setup Complete! ===\n\n";
echo "Next steps:\n";
echo "1. Test the site: https://capecodwoodworking.com\n";
echo "2. Login to admin: https://capecodwoodworking.com/login\n";
echo "   - Email: admin@sawdustandcoffee.com\n";
echo "   - Password: password\n";
echo "   - IMPORTANT: Change this password immediately!\n\n";

// Step 9: Delete this script
echo "Step 9: Cleaning up...\n";
$setupScript = $projectRoot . '/setup.php';
if (file_exists($setupScript)) {
    if (unlink($setupScript)) {
        echo "✓ Setup script deleted\n";
    } else {
        echo "⚠ Could not delete setup script. Please manually delete: $setupScript\n";
    }
}

echo "\n✓ All done!\n";
echo '</pre>';
