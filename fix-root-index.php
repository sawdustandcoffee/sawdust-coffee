<?php
/**
 * Fix Root index.php - Update paths to backend directory
 * Access: https://capecodwoodworking.com/fix-root-index.php
 */

echo "<pre>\n";
echo "=== Fix Root index.php ===\n\n";

$indexPath = __DIR__ . '/index.php';

echo "Step 1: Backup current index.php\n";
$backupPath = $indexPath . '.backup.' . date('YmdHis');
copy($indexPath, $backupPath);
echo "✓ Backed up to: $backupPath\n\n";

echo "Step 2: Read current contents\n";
$current = file_get_contents($indexPath);
echo "Current size: " . strlen($current) . " bytes\n\n";

echo "Step 3: Show current problematic lines\n";
$lines = explode("\n", $current);
foreach ($lines as $i => $line) {
    if (strpos($line, '__DIR__') !== false) {
        echo "  Line " . ($i + 1) . ": " . trim($line) . "\n";
    }
}
echo "\n";

echo "Step 4: Replace paths\n";
$fixed = str_replace(
    "__DIR__.'/../vendor/autoload.php'",
    "__DIR__.'/backend/vendor/autoload.php'",
    $current
);

$fixed = str_replace(
    "__DIR__.'/../bootstrap/app.php'",
    "__DIR__.'/backend/bootstrap/app.php'",
    $fixed
);

echo "✓ Paths updated\n\n";

echo "Step 5: Write fixed index.php\n";
file_put_contents($indexPath, $fixed);
echo "✓ index.php updated\n\n";

echo "Step 6: Verify changes\n";
$verify = file_get_contents($indexPath);
$verifyLines = explode("\n", $verify);
foreach ($verifyLines as $i => $line) {
    if (strpos($line, '__DIR__') !== false) {
        echo "  Line " . ($i + 1) . ": " . trim($line) . "\n";
    }
}
echo "\n";

echo "Step 7: Test the fix\n";
try {
    // Clear opcache
    if (function_exists('opcache_reset')) {
        opcache_reset();
        echo "✓ OPcache cleared\n";
    }

    if (function_exists('opcache_invalidate')) {
        opcache_invalidate($indexPath, true);
        echo "✓ index.php invalidated in OPcache\n";
    }

    // Test via HTTP request
    $ch = curl_init('https://capecodwoodworking.com/api/public/products');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "\nAPI Test:\n";
    echo "  HTTP Code: $httpCode\n";

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "  ✓ API WORKING!\n";
            echo "  Products: " . count($data['data'] ?? []) . "\n";
            echo "  Total: " . ($data['total'] ?? 'unknown') . "\n";
        } else {
            echo "  Response: " . substr($response, 0, 200) . "\n";
        }
    } else {
        echo "  ✗ Still returning $httpCode\n";
        echo "  Response: " . substr($response, 0, 500) . "\n";
    }

} catch (\Exception $e) {
    echo "✗ Test failed: " . $e->getMessage() . "\n";
}

echo "\n=== Complete ===\n\n";
echo "Now test:\n";
echo "1. https://capecodwoodworking.com/api/public/products\n";
echo "2. https://capecodwoodworking.com/shop\n";

echo "\n</pre>";
?>
