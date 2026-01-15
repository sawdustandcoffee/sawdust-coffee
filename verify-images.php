<?php
/**
 * Verify Image Setup and Storage
 * Access: https://capecodwoodworking.com/verify-images.php
 */

echo "<pre>\n";
echo "=== Verify Image Setup ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check 1: Storage directory
echo "Step 1: Check storage directory\n";
$storageDir = __DIR__ . '/backend/storage/app/public/products';
if (is_dir($storageDir)) {
    echo "✓ Storage directory exists: $storageDir\n";
    $files = glob($storageDir . '/*');
    echo "  Files in directory: " . count($files) . "\n";

    if (count($files) > 0) {
        echo "\n  Sample files:\n";
        foreach (array_slice($files, 0, 5) as $file) {
            echo "    - " . basename($file) . " (" . number_format(filesize($file)) . " bytes)\n";
        }
    }
} else {
    echo "✗ Storage directory NOT found\n";
}
echo "\n";

// Check 2: Symlinks
echo "Step 2: Check storage symlinks\n";

$rootStorageLink = __DIR__ . '/storage';
echo "Root storage symlink: $rootStorageLink\n";
if (file_exists($rootStorageLink)) {
    if (is_link($rootStorageLink)) {
        echo "  ✓ Exists as symlink\n";
        echo "  Points to: " . readlink($rootStorageLink) . "\n";
    } else {
        echo "  ✗ Exists but is NOT a symlink (it's a " . (is_dir($rootStorageLink) ? 'directory' : 'file') . ")\n";
    }
} else {
    echo "  ✗ Does NOT exist\n";
}
echo "\n";

$backendStorageLink = __DIR__ . '/backend/public/storage';
echo "Backend storage symlink: $backendStorageLink\n";
if (file_exists($backendStorageLink)) {
    if (is_link($backendStorageLink)) {
        echo "  ✓ Exists as symlink\n";
        echo "  Points to: " . readlink($backendStorageLink) . "\n";
    } else {
        echo "  ✗ Exists but is NOT a symlink\n";
    }
} else {
    echo "  ✗ Does NOT exist\n";
}
echo "\n";

// Check 3: Database records
echo "Step 3: Check database image records\n";
$imageRecords = DB::table('product_images')
    ->where('path', '!=', 'products/placeholder.jpg')
    ->get();

echo "Real image records in database: " . $imageRecords->count() . "\n";

if ($imageRecords->count() > 0) {
    echo "\nSample records:\n";
    foreach ($imageRecords->take(5) as $img) {
        echo "  Product ID {$img->product_id}: {$img->path} (primary: " . ($img->is_primary ? 'yes' : 'no') . ")\n";
    }
}
echo "\n";

// Check 4: Test image URL accessibility
echo "Step 4: Test image URL accessibility\n";

$testImage = $imageRecords->first();
if ($testImage) {
    $imagePath = $testImage->path;
    echo "Testing: {$imagePath}\n";

    $testUrls = [
        'https://capecodwoodworking.com/storage/' . $imagePath,
        'https://capecodwoodworking.com/backend/storage/app/public/' . $imagePath,
    ];

    foreach ($testUrls as $url) {
        echo "\n  Trying: $url\n";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            echo "    ✓ Accessible (HTTP 200)\n";
        } else {
            echo "    ✗ Not accessible (HTTP $httpCode)\n";
        }
    }
}
echo "\n";

// Check 5: API response
echo "Step 5: Check API product response\n";
$product = \App\Models\Product::with('images')->where('slug', 'cornhole-board-vinyl-wrap-cutter')->first();

if ($product) {
    echo "Product: {$product->name}\n";
    echo "Images in model: " . $product->images->count() . "\n";

    if ($product->images->count() > 0) {
        foreach ($product->images as $img) {
            echo "  - {$img->path}\n";
        }
    }

    echo "\nAs JSON:\n";
    $json = json_encode($product->toArray(), JSON_PRETTY_PRINT);
    echo substr($json, 0, 1000) . "...\n";
}
echo "\n";

// Step 6: Fix if needed
echo "Step 6: Attempting to fix storage symlink\n";

// Remove root storage if it's not a symlink
if (file_exists($rootStorageLink) && !is_link($rootStorageLink)) {
    echo "Removing non-symlink at $rootStorageLink\n";
    if (is_dir($rootStorageLink)) {
        rmdir($rootStorageLink);
    } else {
        unlink($rootStorageLink);
    }
}

// Create root storage symlink
if (!file_exists($rootStorageLink)) {
    $target = __DIR__ . '/backend/storage/app/public';
    echo "Creating symlink: $rootStorageLink -> $target\n";
    if (symlink($target, $rootStorageLink)) {
        echo "✓ Root storage symlink created\n";
    } else {
        echo "✗ Failed to create root storage symlink\n";
    }
} else {
    echo "✓ Root storage symlink already exists\n";
}
echo "\n";

echo "=== Test Again ===\n\n";
echo "After creating symlink, test these URLs:\n";
foreach ($imageRecords->take(3) as $img) {
    echo "- https://capecodwoodworking.com/storage/{$img->path}\n";
}
echo "\nThen visit:\n";
echo "- https://capecodwoodworking.com/shop\n";
echo "- https://capecodwoodworking.com/api/public/products\n";

echo "\n</pre>";
?>
