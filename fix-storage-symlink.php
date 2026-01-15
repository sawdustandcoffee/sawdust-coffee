<?php
/**
 * Fix Storage Symlink - Remove directory and create proper symlink
 * Access: https://capecodwoodworking.com/fix-storage-symlink.php
 */

echo "<pre>\n";
echo "=== Fix Storage Symlink ===\n\n";

$storageDir = __DIR__ . '/storage';
$target = __DIR__ . '/backend/storage/app/public';

echo "Step 1: Check current state\n";
echo "Storage path: $storageDir\n";

if (file_exists($storageDir)) {
    if (is_link($storageDir)) {
        echo "✓ Already a symlink\n";
        echo "  Points to: " . readlink($storageDir) . "\n";
        echo "Nothing to fix!\n";
        die();
    } else {
        echo "✗ Exists as a " . (is_dir($storageDir) ? 'DIRECTORY' : 'FILE') . "\n";
        echo "  This needs to be removed and replaced with a symlink\n\n";
    }
} else {
    echo "! Does not exist (will create symlink)\n\n";
}

echo "Step 2: Remove existing directory/file\n";

if (is_dir($storageDir)) {
    echo "Removing directory recursively...\n";

    // Recursive delete function
    function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return unlink($dir);
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? deleteDirectory($path) : unlink($path);
        }

        return rmdir($dir);
    }

    if (deleteDirectory($storageDir)) {
        echo "✓ Directory removed successfully\n\n";
    } else {
        echo "✗ Failed to remove directory\n";
        echo "  You may need to manually delete: $storageDir\n\n";
        die();
    }
} else if (file_exists($storageDir)) {
    echo "Removing file...\n";
    if (unlink($storageDir)) {
        echo "✓ File removed\n\n";
    } else {
        echo "✗ Failed to remove file\n\n";
        die();
    }
}

echo "Step 3: Create symlink\n";
echo "From: $storageDir\n";
echo "To: $target\n";

if (!file_exists($target)) {
    echo "✗ Target directory does not exist: $target\n";
    die();
}

if (symlink($target, $storageDir)) {
    echo "✓ Symlink created successfully!\n\n";
} else {
    echo "✗ Failed to create symlink\n";
    echo "  This might be a permissions issue\n\n";
    die();
}

echo "Step 4: Verify symlink\n";
if (is_link($storageDir)) {
    echo "✓ Confirmed: $storageDir is now a symlink\n";
    echo "  Points to: " . readlink($storageDir) . "\n\n";
} else {
    echo "✗ Something went wrong - not a symlink\n\n";
    die();
}

echo "Step 5: Test image access\n";
$testImagePath = 'products/cornhole-board-vinyl-wrap-cutter-1.webp';
$testUrl = 'https://capecodwoodworking.com/storage/' . $testImagePath;

echo "Testing: $testUrl\n";

$ch = curl_init($testUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✓ Image accessible (HTTP 200)\n\n";
} else {
    echo "✗ Image not accessible (HTTP $httpCode)\n\n";
}

echo "=== SUCCESS! ===\n\n";
echo "Storage symlink is now configured correctly.\n\n";
echo "Next steps:\n";
echo "1. Visit: https://capecodwoodworking.com/shop\n";
echo "   - Products should now display real images\n\n";
echo "2. Check product detail pages (currently showing 'not found')\n";
echo "   - Run: https://capecodwoodworking.com/test-product-routing.php\n";

echo "\n</pre>";
?>
