<?php
/**
 * Show ACTUAL Error - No caching, raw diagnostics
 * Access: https://capecodwoodworking.com/show-actual-error.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<pre>\n";
echo "=== ACTUAL ERROR DIAGNOSTIC ===\n\n";

// Step 1: Show actual file contents
echo "Step 1: Product.php ACTUAL contents (appends section)\n";
echo "---\n";
$modelPath = __DIR__ . '/backend/app/Models/Product.php';
$content = file_get_contents($modelPath);

// Extract just the appends section
$lines = explode("\n", $content);
$inAppends = false;
$appendsLines = [];

foreach ($lines as $i => $line) {
    if (strpos($line, 'protected $appends') !== false) {
        $inAppends = true;
    }

    if ($inAppends) {
        $appendsLines[] = "Line " . ($i + 1) . ": " . $line;
        if (strpos($line, '];') !== false) {
            break;
        }
    }
}

echo implode("\n", $appendsLines);
echo "\n---\n\n";

// Step 2: Bootstrap Laravel with error handling
echo "Step 2: Bootstrap Laravel\n";
chdir(__DIR__ . '/backend');

try {
    require __DIR__ . '/backend/vendor/autoload.php';
    $app = require_once __DIR__ . '/backend/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    echo "✓ Laravel bootstrapped\n\n";
} catch (\Exception $e) {
    die("✗ Bootstrap failed: " . $e->getMessage() . "\n");
}

// Step 3: Test loading a single product
echo "Step 3: Load single product (no JSON conversion)\n";
try {
    $product = \App\Models\Product::where('active', true)->first();

    if (!$product) {
        die("✗ No products found\n");
    }

    echo "✓ Product loaded: {$product->name}\n";
    echo "  ID: {$product->id}\n";
    echo "  Price: \${$product->price}\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to load product: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    die();
}

// Step 4: Test converting to array (triggers appends)
echo "Step 4: Convert product to array (this triggers appended attributes)\n";
try {
    $array = $product->toArray();
    echo "✓ Product converted to array\n";
    echo "  Keys: " . implode(', ', array_keys($array)) . "\n";

    if (isset($array['average_rating'])) {
        echo "  ⚠ WARNING: average_rating is present in array\n";
    } else {
        echo "  ✓ average_rating NOT in array\n";
    }

    if (isset($array['review_count'])) {
        echo "  ⚠ WARNING: review_count is present in array\n";
    } else {
        echo "  ✓ review_count NOT in array\n";
    }
    echo "\n";
} catch (\Exception $e) {
    echo "✗ Failed to convert to array: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n  FULL ERROR:\n";
    echo "  " . str_replace("\n", "\n  ", $e->getTraceAsString()) . "\n\n";
    die();
}

// Step 5: Test with relationships
echo "Step 5: Load product with relationships\n";
try {
    $productWithRels = \App\Models\Product::with(['categories', 'primaryImage'])
        ->where('active', true)
        ->first();

    echo "✓ Product with relationships loaded\n";
    echo "  Categories: " . $productWithRels->categories->count() . "\n";
    echo "  Primary image: " . ($productWithRels->primaryImage ? $productWithRels->primaryImage->path : 'none') . "\n\n";

    // Try to convert with relationships
    $arrayWithRels = $productWithRels->toArray();
    echo "✓ Product with relationships converted to array\n\n";

} catch (\Exception $e) {
    echo "✗ Failed with relationships: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    die();
}

// Step 6: Test paginated query (like API does)
echo "Step 6: Test paginated query (simulates API endpoint)\n";
try {
    $paginated = \App\Models\Product::with(['categories', 'primaryImage'])
        ->where('active', true)
        ->paginate(12);

    echo "✓ Paginated query succeeded\n";
    echo "  Total: {$paginated->total()}\n";
    echo "  Per page: {$paginated->perPage()}\n";
    echo "  Current page: {$paginated->currentPage()}\n\n";

    // Try to convert to array (this is what response()->json() does)
    $paginatedArray = $paginated->toArray();
    echo "✓ Paginated results converted to array\n";
    echo "  Products in data: " . count($paginatedArray['data']) . "\n\n";

} catch (\Exception $e) {
    echo "✗ Pagination failed: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n  THIS IS THE ACTUAL API ERROR:\n";
    echo "  " . str_replace("\n", "\n  ", $e->__toString()) . "\n\n";
    die();
}

// Step 7: Actually call the API controller
echo "Step 7: Call actual API controller method\n";
try {
    $request = \Illuminate\Http\Request::create('/api/public/products', 'GET');
    $controller = new \App\Http\Controllers\Api\ProductController();

    $response = $controller->publicIndex($request);

    echo "✓ API controller executed\n";
    echo "  Status: {$response->getStatusCode()}\n";

    if ($response->getStatusCode() === 200) {
        $content = $response->getContent();
        $data = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            echo "  ✓ Valid JSON returned\n";
            echo "  Products: " . count($data['data']) . "\n";
            echo "  Total: {$data['total']}\n";
        } else {
            echo "  ✗ Invalid JSON: " . json_last_error_msg() . "\n";
        }
    }
    echo "\n";

} catch (\Exception $e) {
    echo "✗ API controller failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n  FULL TRACE:\n";
    $trace = explode("\n", $e->getTraceAsString());
    foreach (array_slice($trace, 0, 20) as $line) {
        echo "  " . $line . "\n";
    }
    echo "\n";
    die();
}

echo "=== ALL TESTS PASSED! ===\n\n";
echo "If you see this, the API should be working.\n";
echo "Test it: https://capecodwoodworking.com/api/public/products\n";

echo "\n</pre>";
?>
