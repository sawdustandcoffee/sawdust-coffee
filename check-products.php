<?php
/**
 * Check Product Database Status
 * Access: https://capecodwoodworking.com/check-products.php
 */

echo "<pre>\n";
echo "=== Product Database Check ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Check database connection
    echo "Step 1: Database Connection\n";
    $pdo = DB::connection()->getPdo();
    echo "✓ Database connected\n\n";

    // Check products table
    echo "Step 2: Products Table\n";
    $productCount = DB::table('products')->count();
    echo "Total products: $productCount\n";

    if ($productCount > 0) {
        $activeCount = DB::table('products')->where('active', true)->count();
        $inactiveCount = DB::table('products')->where('active', false)->count();
        echo "Active products: $activeCount\n";
        echo "Inactive products: $inactiveCount\n\n";

        // Show first 5 products
        echo "Sample Products:\n";
        $products = DB::table('products')->limit(5)->get(['id', 'name', 'slug', 'price', 'active']);
        foreach ($products as $product) {
            $status = $product->active ? '✓' : '✗';
            echo "  $status ID: $product->id | $product->name | Slug: $product->slug | Price: \$$product->price\n";
        }
        echo "\n";
    } else {
        echo "✗ NO PRODUCTS IN DATABASE!\n";
        echo "You need to run the seeder.\n\n";
    }

    // Check product images
    echo "Step 3: Product Images\n";
    $imageCount = DB::table('product_images')->count();
    echo "Total product images: $imageCount\n";

    if ($imageCount > 0) {
        $primaryCount = DB::table('product_images')->where('is_primary', true)->count();
        echo "Primary images: $primaryCount\n";

        // Show sample images
        echo "\nSample Images:\n";
        $images = DB::table('product_images')->limit(5)->get(['id', 'product_id', 'path', 'is_primary']);
        foreach ($images as $image) {
            $primary = $image->is_primary ? '[PRIMARY]' : '';
            echo "  Product $image->product_id: $image->path $primary\n";
        }
        echo "\n";
    } else {
        echo "✗ NO PRODUCT IMAGES!\n\n";
    }

    // Check categories
    echo "Step 4: Product Categories\n";
    $categoryCount = DB::table('product_categories')->count();
    echo "Total categories: $categoryCount\n";

    if ($categoryCount > 0) {
        $categories = DB::table('product_categories')->get(['id', 'name', 'active']);
        foreach ($categories as $cat) {
            $status = $cat->active ? '✓' : '✗';
            echo "  $status $cat->name\n";
        }
        echo "\n";
    }

    // Test API endpoint
    echo "Step 5: Test Public API\n";
    $apiUrl = env('APP_URL') . '/api/public/products';
    echo "Testing: $apiUrl\n";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Response code: $httpCode\n";

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['data'])) {
            echo "✓ API returned " . count($data['data']) . " products\n";
            echo "  Per page: " . ($data['per_page'] ?? 'N/A') . "\n";
            echo "  Total: " . ($data['total'] ?? 'N/A') . "\n";
        } else {
            echo "✗ API response format unexpected\n";
            echo "Response: " . substr($response, 0, 200) . "\n";
        }
    } else {
        echo "✗ API returned error\n";
        echo "Response: " . substr($response, 0, 500) . "\n";
    }

    echo "\n=== Fix Instructions ===\n\n";

    if ($productCount === 0) {
        echo "PROBLEM: No products in database\n\n";
        echo "SOLUTION: Run the database seeder\n";
        echo "Option 1 - Fresh seed (recommended):\n";
        echo "  Visit: https://capecodwoodworking.com/fix-db-v2.php\n";
        echo "  This will reset the database and seed all data\n\n";
        echo "Option 2 - Add products only:\n";
        echo "  Run in terminal: php artisan db:seed --class=DemoDataSeeder --force\n";
        echo "  This adds demo products without resetting database\n\n";
    } else {
        echo "✓ Products exist in database\n";
        echo "If shop page still shows 'No products found', check:\n";
        echo "1. Browser console for JavaScript errors\n";
        echo "2. Network tab to see API request/response\n";
        echo "3. Check if VITE_API_URL is correct in frontend .env\n";
    }

} catch (\Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n</pre>";
?>
