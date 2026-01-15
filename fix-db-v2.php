<?php
/**
 * Fix Database - Reset and run migrations properly (v2)
 * Access: https://capecodwoodworking.com/fix-db-v2.php
 */

echo "<pre>\n";
echo "=== Database Fix Script v2 ===\n\n";

chdir(__DIR__ . '/backend');

// Load .env file properly
function getEnvValue($key) {
    $envFile = __DIR__ . '/backend/.env';
    if (!file_exists($envFile)) {
        return null;
    }

    $lines = file($envFile);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }

        if (strpos($line, $key . '=') === 0) {
            $value = substr($line, strlen($key) + 1);
            // Remove quotes if present
            $value = trim($value, '"\'');
            return $value;
        }
    }
    return null;
}

// Step 1: Check database connection
echo "Step 1: Testing database connection...\n";
$dbHost = getEnvValue('DB_HOST');
$dbDatabase = getEnvValue('DB_DATABASE');
$dbUsername = getEnvValue('DB_USERNAME');
$dbPassword = getEnvValue('DB_PASSWORD');

echo "DB_HOST: $dbHost\n";
echo "DB_DATABASE: $dbDatabase\n";
echo "DB_USERNAME: $dbUsername\n";
echo "DB_PASSWORD: " . (empty($dbPassword) ? '(empty)' : '(set)') . "\n\n";

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbDatabase",
        $dbUsername,
        $dbPassword,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✓ Database connection successful\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Step 2: Drop all tables (fresh start)
echo "Step 2: Clearing existing tables...\n";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
if (!empty($tables)) {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    foreach ($tables as $table) {
        echo "  Dropping table: $table\n";
        $pdo->exec("DROP TABLE IF EXISTS `$table`");
    }
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "✓ All tables dropped\n\n";
} else {
    echo "✓ No existing tables to drop\n\n";
}

// Step 3: Run migrations
echo "Step 3: Running migrations...\n";
$output = shell_exec('php artisan migrate --force 2>&1');
echo $output . "\n";

// Step 4: Seed database
echo "Step 4: Seeding database with initial data...\n";
$output = shell_exec('php artisan db:seed --force 2>&1');
echo $output . "\n";

// Step 5: Clear caches
echo "Step 5: Clearing Laravel caches...\n";
shell_exec('php artisan config:clear 2>&1');
shell_exec('php artisan route:clear 2>&1');
shell_exec('php artisan view:clear 2>&1');
shell_exec('php artisan cache:clear 2>&1');
echo "✓ Caches cleared\n\n";

// Step 6: Cache configs
echo "Step 6: Caching configurations...\n";
shell_exec('php artisan config:cache 2>&1');
shell_exec('php artisan route:cache 2>&1');
shell_exec('php artisan view:cache 2>&1');
echo "✓ Configurations cached\n\n";

// Step 7: Verify tables
echo "Step 7: Verifying database tables...\n";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Found " . count($tables) . " tables:\n";
foreach ($tables as $table) {
    echo "  - $table\n";
}

echo "\n=== Database Fix Complete! ===\n\n";
echo "Next steps:\n";
echo "1. Visit: https://capecodwoodworking.com (should work now!)\n";
echo "2. Login: https://capecodwoodworking.com/login\n";
echo "   - Email: admin@sawdustandcoffee.com\n";
echo "   - Password: password\n";
echo "3. Delete these debug files:\n";
echo "   - fix-db.php\n";
echo "   - fix-db-v2.php\n";
echo "   - debug.php\n";
echo "   - restructure.php\n\n";

// Try to delete old scripts
$filesToDelete = [__FILE__, __DIR__ . '/fix-db.php'];
foreach ($filesToDelete as $file) {
    if (file_exists($file) && unlink($file)) {
        echo "✓ Deleted " . basename($file) . "\n";
    }
}

echo "</pre>";
?>
