<?php
/**
 * Test API Endpoints
 * Access: https://capecodwoodworking.com/test-api.php
 */

echo "<pre>\n";
echo "=== API Testing ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Step 1: Direct Database Query\n";
    $products = DB::table('products')->where('active', true)->get(['id', 'name', 'slug', 'price']);
    echo "Active products in database: " . $products->count() . "\n\n";

    if ($products->count() > 0) {
        echo "Sample products:\n";
        foreach ($products->take(3) as $product) {
            echo "  - {$product->name} (\${$product->price}) - Slug: {$product->slug}\n";
        }
        echo "\n";
    }

    echo "Step 2: Test Product Model\n";
    $productModel = \App\Models\Product::with(['categories', 'images'])->where('active', true)->first();

    if ($productModel) {
        echo "✓ Product model works\n";
        echo "  Product: {$productModel->name}\n";
        echo "  Categories: " . $productModel->categories->count() . "\n";
        echo "  Images: " . $productModel->images->count() . "\n";

        if ($productModel->images->count() > 0) {
            echo "  Image path: {$productModel->images->first()->path}\n";
        }
        echo "\n";
    } else {
        echo "✗ No products found via model\n\n";
    }

    echo "Step 3: Test API Controller\n";
    $controller = new \App\Http\Controllers\Api\ProductController();

    // Create a fake request
    $request = \Illuminate\Http\Request::create('/api/public/products', 'GET');

    try {
        $response = $controller->publicIndex($request);
        echo "✓ API controller works\n";
        $data = json_decode($response->getContent(), true);
        echo "  Response code: " . $response->getStatusCode() . "\n";
        echo "  Products returned: " . (isset($data['data']) ? count($data['data']) : 'unknown') . "\n";
        echo "  Total in response: " . ($data['total'] ?? 'unknown') . "\n\n";
    } catch (\Exception $e) {
        echo "✗ API controller error: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    }

    echo "Step 4: Check Product Images\n";
    $productWithImage = DB::table('products')
        ->join('product_images', 'products.id', '=', 'product_images.product_id')
        ->where('products.active', true)
        ->select('products.name', 'product_images.path', 'product_images.is_primary')
        ->first();

    if ($productWithImage) {
        echo "✓ Product with image found\n";
        echo "  Product: {$productWithImage->name}\n";
        echo "  Image path: {$productWithImage->path}\n";
        echo "  Is primary: " . ($productWithImage->is_primary ? 'Yes' : 'No') . "\n\n";
    } else {
        echo "✗ No products with images found\n\n";
    }

    echo "Step 5: Check Laravel Cache\n";
    echo "Clearing caches...\n";
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('cache:clear');
    echo "✓ Caches cleared\n\n";

    echo "=== Test Complete ===\n";
    echo "\nIf API is still returning 500, try:\n";
    echo "1. Check Laravel logs: backend/storage/logs/laravel.log\n";
    echo "2. Visit: https://capecodwoodworking.com/api/public/products\n";

} catch (\Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n</pre>";
?>
