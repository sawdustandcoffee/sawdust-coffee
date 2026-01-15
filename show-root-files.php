<?php
/**
 * Show Root Files - Check what's actually in root
 * Access: https://capecodwoodworking.com/show-root-files.php
 */

echo "<pre>\n";
echo "=== Root Files Check ===\n\n";

// Check root index.php
echo "=== ROOT index.php ===\n";
$rootIndex = __DIR__ . '/index.php';
if (file_exists($rootIndex)) {
    echo "File: $rootIndex\n";
    echo "Size: " . filesize($rootIndex) . " bytes\n\n";
    echo "Contents:\n";
    echo "---\n";
    echo file_get_contents($rootIndex);
    echo "\n---\n\n";
} else {
    echo "NOT FOUND\n\n";
}

// Check backend/public/index.php
echo "=== BACKEND/PUBLIC index.php ===\n";
$backendIndex = __DIR__ . '/backend/public/index.php';
if (file_exists($backendIndex)) {
    echo "File: $backendIndex\n";
    echo "Size: " . filesize($backendIndex) . " bytes\n\n";
    echo "Contents:\n";
    echo "---\n";
    echo file_get_contents($backendIndex);
    echo "\n---\n\n";
} else {
    echo "NOT FOUND\n\n";
}

// Check if they're the same
if (file_exists($rootIndex) && file_exists($backendIndex)) {
    $rootContent = file_get_contents($rootIndex);
    $backendContent = file_get_contents($backendIndex);

    if ($rootContent === $backendContent) {
        echo "✓ Root and backend index.php are IDENTICAL\n\n";
    } else {
        echo "✗ Root and backend index.php are DIFFERENT!\n\n";
    }
}

// Try to directly execute the API request with error capture
echo "=== Direct API Execution with Error Capture ===\n\n";

// Temporarily enable error display
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set up error handler
$errors = [];
set_error_handler(function($errno, $errstr, $errfile, $errline) use (&$errors) {
    $errors[] = [
        'type' => $errno,
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    return true;
});

try {
    // Simulate the web request
    $_SERVER['REQUEST_URI'] = '/api/public/products';
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['SCRIPT_NAME'] = '/index.php';

    echo "Simulating request to: /api/public/products\n";
    echo "Including: $rootIndex\n\n";

    ob_start();
    include $rootIndex;
    $output = ob_get_clean();

    echo "Output length: " . strlen($output) . " bytes\n";

    if (!empty($errors)) {
        echo "\nErrors captured:\n";
        foreach ($errors as $error) {
            echo "  [{$error['type']}] {$error['message']}\n";
            echo "    File: {$error['file']}:{$error['line']}\n";
        }
        echo "\n";
    }

    if (strlen($output) > 0) {
        echo "Output:\n";
        echo "---\n";
        echo substr($output, 0, 5000);
        echo "\n---\n";
    } else {
        echo "✗ NO OUTPUT GENERATED!\n";
    }

} catch (\Throwable $e) {
    echo "✗ Exception caught: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n  Stack trace:\n";
    foreach (explode("\n", $e->getTraceAsString()) as $line) {
        echo "  " . $line . "\n";
    }
}

restore_error_handler();

echo "\n</pre>";
?>
