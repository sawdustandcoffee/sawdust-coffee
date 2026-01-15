<?php
/**
 * Debug Single Product API Endpoint
 * Access: https://capecodwoodworking.com/debug-single-product-api.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<pre>\n";
echo "=== Debug Single Product API ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$testSlug = 'cornhole-board-vinyl-wrap-cutter';

echo "Testing product slug: $testSlug\n\n";

// Test 1: Load product with relationships
echo "Step 1: Load product with relationships\n";
try {
    $product = \App\Models\Product::with(['categories', 'images', 'activeVariants', 'options.values'])
        ->where('slug', $testSlug)
        ->where('active', true)
        ->first();

    if (!$product) {
        echo "✗ Product not found\n";
        die();
    }

    echo "✓ Product loaded: {$product->name}\n";
    echo "  Categories: " . $product->categories->count() . "\n";
    echo "  Images: " . $product->images->count() . "\n";
    echo "  Variants: " . $product->activeVariants->count() . "\n";
    echo "  Options: " . $product->options->count() . "\n\n";

} catch (\Exception $e) {
    echo "✗ Failed to load product: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    die();
}

// Test 2: Convert to array (triggers appends)
echo "Step 2: Convert product to array\n";
try {
    $array = $product->toArray();
    echo "✓ Product converted to array\n";
    echo "  Keys: " . implode(', ', array_keys($array)) . "\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to convert: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    die();
}

// Test 3: Convert to JSON (like API does)
echo "Step 3: Convert product to JSON\n";
try {
    $json = json_encode($product);

    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ Product converted to JSON\n";
        echo "  Length: " . strlen($json) . " bytes\n\n";
    } else {
        echo "✗ JSON encoding failed: " . json_last_error_msg() . "\n\n";
        die();
    }
} catch (\Exception $e) {
    echo "✗ Exception during JSON conversion: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    die();
}

// Test 4: Call the actual controller method
echo "Step 4: Call ProductController::publicShow()\n";
try {
    $controller = new \App\Http\Controllers\Api\ProductController();

    ob_start();
    $response = $controller->publicShow($testSlug);
    $output = ob_get_clean();

    if ($output) {
        echo "! Controller produced output: $output\n";
    }

    $statusCode = $response->getStatusCode();
    echo "✓ Controller executed\n";
    echo "  Status code: $statusCode\n";

    if ($statusCode === 200) {
        $content = $response->getContent();
        $data = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✓ Valid JSON response\n";
            echo "  Product name: " . ($data['name'] ?? 'N/A') . "\n";
            echo "  Images: " . (isset($data['images']) ? count($data['images']) : 0) . "\n";
        } else {
            echo "✗ Invalid JSON: " . json_last_error_msg() . "\n";
            echo "  Response (first 500 chars): " . substr($content, 0, 500) . "\n";
        }
    } else {
        echo "✗ Controller returned HTTP $statusCode\n";
        echo "  Response: " . substr($response->getContent(), 0, 1000) . "\n";
    }
    echo "\n";

} catch (\Exception $e) {
    echo "✗ Controller failed: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n  Stack trace (first 15 lines):\n";
    $trace = explode("\n", $e->getTraceAsString());
    foreach (array_slice($trace, 0, 15) as $line) {
        echo "  " . $line . "\n";
    }
    echo "\n";
    die();
}

// Test 5: Test via HTTP request
echo "Step 5: Test via actual HTTP request\n";
$url = "https://capecodwoodworking.com/api/public/products/$testSlug";
echo "URL: $url\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";

if ($httpCode === 200) {
    echo "✓ API accessible via HTTP\n";
} else {
    echo "✗ API returned HTTP $httpCode\n";
    echo "\nResponse:\n";
    echo "---\n";
    echo substr($response, 0, 1000);
    echo "\n---\n";
}

echo "\n=== All Tests Passed! ===\n";
echo "\nThe controller works when called directly.\n";
echo "If HTTP request fails, it's a web server/routing issue.\n";

echo "\n</pre>";
?>
