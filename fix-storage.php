<?php
/**
 * Fix Laravel Storage Symlink
 * Access: https://capecodwoodworking.com/fix-storage.php
 */

echo "<pre>\n";
echo "=== Fix Laravel Storage ===\n\n";

chdir(__DIR__ . '/backend');

// Run storage:link command
echo "Running: php artisan storage:link\n";
$output = shell_exec('php artisan storage:link 2>&1');
echo $output . "\n";

// Verify symlink in backend/public/storage
$backendSymlink = __DIR__ . '/backend/public/storage';
echo "Checking backend/public/storage...\n";
if (file_exists($backendSymlink)) {
    if (is_link($backendSymlink)) {
        echo "✓ Backend storage symlink exists\n";
        echo "  Location: $backendSymlink\n";
        echo "  Points to: " . readlink($backendSymlink) . "\n\n";
    } else {
        echo "✗ Path exists but is not a symlink\n\n";
    }
} else {
    echo "✗ Backend storage symlink not found\n\n";
}

// Create symlink in public_html root (for Hostinger deployment)
$rootSymlink = __DIR__ . '/storage';
$storagePath = __DIR__ . '/backend/storage/app/public';

echo "Creating root storage symlink...\n";
echo "  From: $rootSymlink\n";
echo "  To: $storagePath\n";

if (file_exists($rootSymlink)) {
    if (is_link($rootSymlink)) {
        echo "  Symlink already exists\n";
        echo "  Points to: " . readlink($rootSymlink) . "\n";
    } else {
        echo "  ✗ Path exists but is not a symlink (removing...)\n";
        if (is_dir($rootSymlink)) {
            rmdir($rootSymlink);
        } else {
            unlink($rootSymlink);
        }
    }
}

if (!file_exists($rootSymlink)) {
    if (symlink($storagePath, $rootSymlink)) {
        echo "  ✓ Root storage symlink created successfully\n\n";
    } else {
        echo "  ✗ Failed to create root storage symlink\n\n";
    }
} else {
    echo "  ✓ Root storage symlink verified\n\n";
}

// Test storage directory
echo "=== Storage Directory Test ===\n";
$productsDir = $storagePath . '/products';
echo "Products directory: $productsDir\n";
if (file_exists($productsDir)) {
    echo "✓ Products directory exists\n";
    $files = scandir($productsDir);
    $imageCount = count(array_filter($files, function($f) {
        return !in_array($f, ['.', '..']) && preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $f);
    }));
    echo "  Images found: $imageCount\n";
} else {
    echo "✗ Products directory not found (will be created when images are uploaded)\n";
}

echo "\n=== Test URLs ===\n";
echo "Visit these URLs to verify storage is working:\n";
echo "- https://capecodwoodworking.com/storage/test.txt (will 404 if no test file)\n";
echo "- Upload a product image via admin to test\n";

echo "\n=== Complete ===\n";
echo "</pre>";
?>
