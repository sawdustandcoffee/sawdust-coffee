<?php
/**
 * Fix API - Clear all caches and verify
 * Access: https://capecodwoodworking.com/fix-api-now.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<pre>\n";
echo "=== Fix API Now ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Step 1: Check Product model file\n";
    $modelPath = __DIR__ . '/backend/app/Models/Product.php';
    $modelContents = file_get_contents($modelPath);

    if (strpos($modelContents, "'average_rating',") !== false &&
        strpos($modelContents, "// 'average_rating',") === false) {
        echo "✗ Product model NOT updated - still has average_rating uncommented\n";
        echo "  This means git pull hasn't happened yet or failed\n\n";
        echo "ACTION REQUIRED:\n";
        echo "1. Go to Hostinger Git panel\n";
        echo "2. Manually pull latest changes\n";
        echo "3. Run this script again\n";
        die();
    } else {
        echo "✓ Product model updated - average_rating is commented out\n\n";
    }

    echo "Step 2: Clear ALL caches\n";
    Artisan::call('config:clear');
    echo "  ✓ Config cache cleared\n";

    Artisan::call('route:clear');
    echo "  ✓ Route cache cleared\n";

    Artisan::call('cache:clear');
    echo "  ✓ Application cache cleared\n";

    Artisan::call('view:clear');
    echo "  ✓ View cache cleared\n";

    // Clear opcache if available
    if (function_exists('opcache_reset')) {
        opcache_reset();
        echo "  ✓ OPcache cleared\n";
    } else {
        echo "  ! OPcache not available\n";
    }
    echo "\n";

    echo "Step 3: Test Product model directly\n";
    try {
        $product = \App\Models\Product::where('active', true)->first();

        if (!$product) {
            echo "✗ No active products found\n";
            die();
        }

        echo "✓ Product loaded: {$product->name}\n";

        // Convert to array to trigger appends
        $productArray = $product->toArray();

        echo "✓ Product converted to array (appends triggered)\n";
        echo "  Keys in array: " . implode(', ', array_keys($productArray)) . "\n";

        if (isset($productArray['average_rating']) || isset($productArray['review_count'])) {
            echo "  ✗ WARNING: average_rating or review_count still present!\n";
        } else {
            echo "  ✓ average_rating and review_count NOT in array\n";
        }
        echo "\n";

    } catch (\Exception $e) {
        echo "✗ Product model test failed: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
        die();
    }

    echo "Step 4: Test API controller\n";
    try {
        $request = \Illuminate\Http\Request::create('/api/public/products', 'GET');
        $controller = new \App\Http\Controllers\Api\ProductController();

        ob_start();
        $response = $controller->publicIndex($request);
        $output = ob_get_clean();

        if ($output) {
            echo "  ! Warning: Controller output: $output\n";
        }

        $statusCode = $response->getStatusCode();
        echo "✓ API controller executed\n";
        echo "  Status code: $statusCode\n";

        if ($statusCode !== 200) {
            echo "  ✗ API returned non-200 status code\n";
            die();
        }

        $content = $response->getContent();
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "  ✗ Invalid JSON: " . json_last_error_msg() . "\n";
            echo "  Response: " . substr($content, 0, 500) . "\n";
            die();
        }

        echo "✓ Valid JSON response\n";
        echo "  Total products: " . ($data['total'] ?? 'unknown') . "\n";
        echo "  Per page: " . ($data['per_page'] ?? 'unknown') . "\n";
        echo "  Current page: " . ($data['current_page'] ?? 'unknown') . "\n";

        if (isset($data['data']) && count($data['data']) > 0) {
            echo "  Products in response: " . count($data['data']) . "\n";
            echo "\nSample product:\n";
            $first = $data['data'][0];
            echo "  Name: " . ($first['name'] ?? 'N/A') . "\n";
            echo "  Price: $" . ($first['price'] ?? 'N/A') . "\n";
            echo "  Slug: " . ($first['slug'] ?? 'N/A') . "\n";
            echo "  Has average_rating: " . (isset($first['average_rating']) ? 'YES (BAD!)' : 'NO (GOOD!)') . "\n";
            echo "  Has review_count: " . (isset($first['review_count']) ? 'YES (BAD!)' : 'NO (GOOD!)') . "\n";
        }
        echo "\n";

    } catch (\Exception $e) {
        echo "✗ API controller failed: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";

        echo "Stack trace (first 10 lines):\n";
        $traces = explode("\n", $e->getTraceAsString());
        foreach (array_slice($traces, 0, 10) as $trace) {
            echo "  " . $trace . "\n";
        }
        die();
    }

    echo "=== SUCCESS! ===\n\n";
    echo "The API is now working!\n\n";
    echo "Next steps:\n";
    echo "1. Visit: https://capecodwoodworking.com/api/public/products\n";
    echo "2. Visit: https://capecodwoodworking.com/shop\n";
    echo "3. All 12 products should display with placeholder images\n";

} catch (\Exception $e) {
    echo "\n✗ FATAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n</pre>";
?>
