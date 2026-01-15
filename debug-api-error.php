<?php
/**
 * Debug API 500 Error
 * Access: https://capecodwoodworking.com/debug-api-error.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<pre>\n";
echo "=== Debug API 500 Error ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Step 1: Clear ALL caches\n";
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('cache:clear');
    Artisan::call('view:clear');
    echo "✓ All caches cleared\n\n";

    echo "Step 2: Test direct Product query with relationships\n";
    try {
        $products = \App\Models\Product::with(['categories', 'primaryImage'])
            ->where('active', true)
            ->limit(3)
            ->get();

        echo "✓ Query successful\n";
        echo "  Products returned: " . $products->count() . "\n";

        foreach ($products as $product) {
            echo "  - {$product->name}\n";
            echo "    Categories: " . $product->categories->count() . "\n";
            echo "    Primary image: " . ($product->primaryImage ? $product->primaryImage->path : 'none') . "\n";
        }
        echo "\n";
    } catch (\Exception $e) {
        echo "✗ Query failed: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    }

    echo "Step 3: Check Product model appends\n";
    try {
        $product = \App\Models\Product::where('active', true)->first();

        if ($product) {
            echo "Testing appended attributes:\n";

            try {
                $effectivePrice = $product->effective_price;
                echo "  ✓ effective_price: \${$effectivePrice}\n";
            } catch (\Exception $e) {
                echo "  ✗ effective_price failed: " . $e->getMessage() . "\n";
            }

            try {
                $isOnSale = $product->is_on_sale;
                echo "  ✓ is_on_sale: " . ($isOnSale ? 'true' : 'false') . "\n";
            } catch (\Exception $e) {
                echo "  ✗ is_on_sale failed: " . $e->getMessage() . "\n";
            }

            try {
                $isInStock = $product->is_in_stock;
                echo "  ✓ is_in_stock: " . ($isInStock ? 'true' : 'false') . "\n";
            } catch (\Exception $e) {
                echo "  ✗ is_in_stock failed: " . $e->getMessage() . "\n";
            }

            try {
                $avgRating = $product->average_rating;
                echo "  ✓ average_rating: " . ($avgRating ?? 'null') . "\n";
            } catch (\Exception $e) {
                echo "  ✗ average_rating failed: " . $e->getMessage() . "\n";
            }

            try {
                $reviewCount = $product->review_count;
                echo "  ✓ review_count: {$reviewCount}\n";
            } catch (\Exception $e) {
                echo "  ✗ review_count failed: " . $e->getMessage() . "\n";
            }

            echo "\n";
        }
    } catch (\Exception $e) {
        echo "✗ Failed to test appends: " . $e->getMessage() . "\n\n";
    }

    echo "Step 4: Simulate exact API call\n";
    try {
        $request = \Illuminate\Http\Request::create('/api/public/products', 'GET');
        $controller = new \App\Http\Controllers\Api\ProductController();

        ob_start();
        $response = $controller->publicIndex($request);
        $output = ob_get_clean();

        if ($output) {
            echo "  ! Warning: Controller produced output: $output\n";
        }

        echo "✓ API controller executed\n";
        echo "  Status code: " . $response->getStatusCode() . "\n";

        $content = $response->getContent();
        $data = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            echo "  ✓ Valid JSON response\n";
            echo "  Products in response: " . (isset($data['data']) ? count($data['data']) : 'N/A') . "\n";
            echo "  Total: " . ($data['total'] ?? 'N/A') . "\n";
            echo "  Per page: " . ($data['per_page'] ?? 'N/A') . "\n";
        } else {
            echo "  ✗ Invalid JSON: " . json_last_error_msg() . "\n";
            echo "  First 500 chars: " . substr($content, 0, 500) . "\n";
        }
        echo "\n";

    } catch (\Exception $e) {
        echo "✗ API controller failed: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo "  Stack trace:\n";
        foreach (explode("\n", $e->getTraceAsString()) as $line) {
            echo "    " . $line . "\n";
        }
        echo "\n";
    }

    echo "Step 5: Check Laravel error logs\n";
    $logFile = __DIR__ . '/backend/storage/logs/laravel.log';
    if (file_exists($logFile)) {
        $logSize = filesize($logFile);
        echo "Log file exists: $logFile\n";
        echo "Size: " . number_format($logSize) . " bytes\n";

        if ($logSize > 0) {
            echo "\nLast 50 lines of log:\n";
            echo "---\n";
            $lines = file($logFile);
            $lastLines = array_slice($lines, -50);
            echo implode('', $lastLines);
            echo "---\n";
        } else {
            echo "Log file is empty\n";
        }
    } else {
        echo "Log file not found\n";
    }

    echo "\n=== Debug Complete ===\n";

} catch (\Exception $e) {
    echo "\n✗ FATAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n</pre>";
?>
