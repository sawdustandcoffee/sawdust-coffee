<?php
/**
 * Nuclear Fix - Directly modify Product.php on server
 * Access: https://capecodwoodworking.com/nuclear-fix.php
 */

echo "<pre>\n";
echo "=== Nuclear API Fix ===\n\n";
echo "This will directly modify the Product model file on the server.\n\n";

$modelPath = __DIR__ . '/backend/app/Models/Product.php';

if (!file_exists($modelPath)) {
    die("✗ Product model not found at: $modelPath\n");
}

echo "Step 1: Read current Product.php\n";
$currentContent = file_get_contents($modelPath);

// Backup original
$backupPath = $modelPath . '.backup.' . date('YmdHis');
file_put_contents($backupPath, $currentContent);
echo "✓ Backed up to: $backupPath\n\n";

echo "Step 2: Check current appends array\n";
if (strpos($currentContent, "'average_rating',") !== false) {
    echo "! Found 'average_rating' in appends array - needs fixing\n";
} else {
    echo "✓ 'average_rating' already removed or commented\n";
}

if (strpos($currentContent, "'review_count',") !== false) {
    echo "! Found 'review_count' in appends array - needs fixing\n";
} else {
    echo "✓ 'review_count' already removed or commented\n";
}
echo "\n";

echo "Step 3: Replace appends array\n";

// Find and replace the protected $appends array
$pattern = '/protected \$appends = \[\s*\'effective_price\',\s*\'is_on_sale\',\s*\'is_in_stock\',\s*\'average_rating\',\s*\'review_count\',\s*\];/s';

$replacement = 'protected $appends = [
        \'effective_price\',
        \'is_on_sale\',
        \'is_in_stock\',
        // Disabled until product_reviews table is created
        // \'average_rating\',
        // \'review_count\',
    ];';

$newContent = preg_replace($pattern, $replacement, $currentContent);

if ($newContent === null || $newContent === $currentContent) {
    echo "! Regex didn't match, trying alternative approach...\n";

    // Alternative: Replace any line with 'average_rating' or 'review_count' in appends
    $lines = explode("\n", $currentContent);
    $newLines = [];
    $inAppends = false;

    foreach ($lines as $line) {
        if (strpos($line, 'protected $appends = [') !== false) {
            $inAppends = true;
        }

        if ($inAppends) {
            if (strpos($line, "'average_rating'") !== false) {
                $line = str_replace("'average_rating',", "// 'average_rating',", $line);
            }
            if (strpos($line, "'review_count'") !== false) {
                $line = str_replace("'review_count',", "// 'review_count',", $line);
            }
            if (strpos($line, '];') !== false) {
                $inAppends = false;
            }
        }

        $newLines[] = $line;
    }

    $newContent = implode("\n", $newLines);
}

// Write the modified content
file_put_contents($modelPath, $newContent);
echo "✓ Product.php modified\n\n";

echo "Step 4: Verify changes\n";
$verifyContent = file_get_contents($modelPath);

if (strpos($verifyContent, "// 'average_rating',") !== false) {
    echo "✓ 'average_rating' is now commented out\n";
} else if (strpos($verifyContent, "'average_rating',") === false) {
    echo "✓ 'average_rating' is removed\n";
} else {
    echo "✗ 'average_rating' is still active!\n";
}

if (strpos($verifyContent, "// 'review_count',") !== false) {
    echo "✓ 'review_count' is now commented out\n";
} else if (strpos($verifyContent, "'review_count',") === false) {
    echo "✓ 'review_count' is removed\n";
} else {
    echo "✗ 'review_count' is still active!\n";
}
echo "\n";

echo "Step 5: Clear PHP OPcache\n";
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "✓ OPcache cleared\n";
} else {
    echo "! OPcache not available\n";
}

if (function_exists('opcache_invalidate')) {
    opcache_invalidate($modelPath, true);
    echo "✓ Product.php invalidated in OPcache\n";
}
echo "\n";

echo "Step 6: Clear Laravel caches\n";
chdir(__DIR__ . '/backend');
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Artisan::call('config:clear');
Artisan::call('route:clear');
Artisan::call('cache:clear');
Artisan::call('view:clear');
echo "✓ All Laravel caches cleared\n\n";

echo "Step 7: Test API\n";
try {
    $request = \Illuminate\Http\Request::create('/api/public/products', 'GET');
    $controller = new \App\Http\Controllers\Api\ProductController();
    $response = $controller->publicIndex($request);

    $statusCode = $response->getStatusCode();
    echo "Status code: $statusCode\n";

    if ($statusCode === 200) {
        $data = json_decode($response->getContent(), true);
        echo "✓ API WORKING!\n";
        echo "  Products returned: " . count($data['data'] ?? []) . "\n";
        echo "  Total: " . ($data['total'] ?? 'unknown') . "\n";
    } else {
        echo "✗ API returned $statusCode\n";
    }
} catch (\Exception $e) {
    echo "✗ API failed: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Complete ===\n\n";
echo "Original backed up to: $backupPath\n";
echo "Now test: https://capecodwoodworking.com/api/public/products\n";

echo "\n</pre>";
?>
