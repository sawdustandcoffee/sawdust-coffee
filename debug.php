<?php
/**
 * Debug Script - Check Laravel Configuration
 * Access: https://capecodwoodworking.com/debug.php
 */

echo "<pre>\n";
echo "=== Laravel Debug Info ===\n\n";

// Check if we're in the right directory
echo "Current directory: " . getcwd() . "\n\n";

// Check if backend .env exists
$envPath = __DIR__ . '/backend/.env';
echo "Checking for .env: $envPath\n";
if (file_exists($envPath)) {
    echo "✓ .env file exists\n";
    echo "Size: " . filesize($envPath) . " bytes\n";

    // Check if it has APP_KEY
    $envContent = file_get_contents($envPath);
    if (strpos($envContent, 'APP_KEY=base64:') !== false) {
        echo "✓ APP_KEY is set\n";
    } else {
        echo "✗ APP_KEY is missing or not set!\n";
    }

    // Check database config
    if (preg_match('/DB_DATABASE=(.+)/', $envContent, $matches)) {
        echo "✓ DB_DATABASE is set: " . trim($matches[1]) . "\n";
    }
    if (preg_match('/DB_USERNAME=(.+)/', $envContent, $matches)) {
        echo "✓ DB_USERNAME is set: " . trim($matches[1]) . "\n";
    }
    if (preg_match('/DB_PASSWORD=/', $envContent)) {
        echo "✓ DB_PASSWORD is set\n";
    }
} else {
    echo "✗ .env file NOT found!\n";
}

echo "\n";

// Check vendor autoload
$autoloadPath = __DIR__ . '/backend/vendor/autoload.php';
echo "Checking autoload: $autoloadPath\n";
if (file_exists($autoloadPath)) {
    echo "✓ Vendor autoload exists\n";
} else {
    echo "✗ Vendor autoload NOT found!\n";
}

echo "\n";

// Check storage permissions
$storagePath = __DIR__ . '/backend/storage';
echo "Checking storage: $storagePath\n";
if (is_dir($storagePath)) {
    echo "✓ Storage directory exists\n";
    if (is_writable($storagePath)) {
        echo "✓ Storage is writable\n";
    } else {
        echo "✗ Storage is NOT writable!\n";
        echo "  Run: chmod -R 755 backend/storage backend/bootstrap/cache\n";
    }

    // Check logs directory
    $logsPath = $storagePath . '/logs';
    if (is_dir($logsPath) && is_writable($logsPath)) {
        echo "✓ Storage/logs is writable\n";

        // Check for error logs
        $laravelLog = $logsPath . '/laravel.log';
        if (file_exists($laravelLog)) {
            echo "\n--- Last 30 lines of laravel.log ---\n";
            $logLines = file($laravelLog);
            $lastLines = array_slice($logLines, -30);
            echo implode('', $lastLines);
            echo "--- End of log ---\n\n";
        }
    } else {
        echo "✗ Storage/logs is NOT writable!\n";
    }
} else {
    echo "✗ Storage directory NOT found!\n";
}

echo "\n";

// Try to load Laravel and see actual error
echo "Attempting to load Laravel...\n";
try {
    if (file_exists($autoloadPath)) {
        require $autoloadPath;
        $app = require_once __DIR__ . '/backend/bootstrap/app.php';
        echo "✓ Laravel bootstrap successful!\n";

        // Try to boot the app
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        echo "✓ Laravel loaded successfully!\n";
    } else {
        echo "✗ Cannot load - autoload missing\n";
    }
} catch (Exception $e) {
    echo "✗ Laravel error:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n=== End Debug ===\n";
echo "\nDelete this file after debugging: debug.php\n";
echo "</pre>";
?>
