<?php
/**
 * Test Product Detail Page Routing
 * Access: https://capecodwoodworking.com/test-product-routing.php
 */

echo "<pre>\n";
echo "=== Test Product Detail Page Routing ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test 1: Check if products exist
echo "Step 1: Check products in database\n";
$products = \App\Models\Product::where('active', true)->take(3)->get(['id', 'name', 'slug']);

echo "Active products: " . $products->count() . "\n";
foreach ($products as $product) {
    echo "  - {$product->name} (slug: {$product->slug})\n";
}
echo "\n";

// Test 2: Test API endpoint for individual product
echo "Step 2: Test API endpoint for product detail\n";
$testSlug = $products->first()->slug;
$apiUrl = "https://capecodwoodworking.com/api/public/products/$testSlug";

echo "Testing: $apiUrl\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ API returns valid JSON\n";
        echo "  Product name: " . ($data['name'] ?? 'N/A') . "\n";
        echo "  Images: " . (isset($data['images']) ? count($data['images']) : 0) . "\n";
    } else {
        echo "✗ Invalid JSON\n";
    }
} else {
    echo "✗ API returned error\n";
    echo "Response: " . substr($response, 0, 500) . "\n";
}
echo "\n";

// Test 3: Test frontend product page
echo "Step 3: Test frontend product page\n";
$productPageUrl = "https://capecodwoodworking.com/shop/$testSlug";
echo "Testing: $productPageUrl\n";

$ch = curl_init($productPageUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";

if ($httpCode === 200) {
    echo "✓ Page loads\n";

    // Check if it's the React app
    if (strpos($html, 'root') !== false || strpos($html, 'react') !== false) {
        echo "✓ React app detected\n";
    } else {
        echo "! React app not detected in response\n";
    }

    // Check for "not found" text
    if (stripos($html, 'not found') !== false || stripos($html, '404') !== false) {
        echo "⚠ Response contains 'not found' or '404'\n";
    } else {
        echo "✓ No 'not found' text in response\n";
    }

    // Show page title
    if (preg_match('/<title>([^<]+)<\/title>/', $html, $matches)) {
        echo "  Page title: " . $matches[1] . "\n";
    }
} else {
    echo "✗ Page returned HTTP $httpCode\n";
}
echo "\n";

// Test 4: Check .htaccess routing
echo "Step 4: Check .htaccess\n";
$htaccess = __DIR__ . '/.htaccess';
if (file_exists($htaccess)) {
    echo "✓ .htaccess exists\n";
    $content = file_get_contents($htaccess);

    // Check for important rules
    if (strpos($content, 'RewriteRule ^api/') !== false) {
        echo "✓ API routing rule found\n";
    } else {
        echo "✗ API routing rule NOT found\n";
    }

    if (strpos($content, 'index.html') !== false) {
        echo "✓ React SPA routing rule found\n";
    } else {
        echo "✗ React SPA routing rule NOT found\n";
    }
} else {
    echo "✗ .htaccess NOT found\n";
}
echo "\n";

// Test 5: Check React build
echo "Step 5: Check React build files\n";
$indexHtml = __DIR__ . '/index.html';
if (file_exists($indexHtml)) {
    echo "✓ index.html exists\n";
    $html = file_get_contents($indexHtml);

    // Check for React root div
    if (strpos($html, 'id="root"') !== false) {
        echo "✓ React root div found\n";
    } else {
        echo "✗ React root div NOT found\n";
    }

    // Check for JS bundles
    if (preg_match_all('/<script[^>]+src="([^"]+)"/', $html, $matches)) {
        echo "✓ Found " . count($matches[1]) . " script tags\n";
        foreach ($matches[1] as $src) {
            echo "  - $src\n";
        }
    }
} else {
    echo "✗ index.html NOT found\n";
}
echo "\n";

echo "=== Diagnosis ===\n\n";

if ($httpCode === 200 && strpos($response, '"name"') !== false) {
    echo "✓ API endpoint is working correctly\n";
    echo "✓ Product data is available\n\n";
    echo "If you're seeing 'Product Not Found' in the browser:\n";
    echo "1. Check browser console for JavaScript errors\n";
    echo "2. Check Network tab for failed API requests\n";
    echo "3. The issue is likely in the frontend React code\n";
} else {
    echo "✗ API endpoint has issues\n";
    echo "The backend needs to be fixed first\n";
}

echo "\nTest URLs:\n";
foreach ($products as $product) {
    echo "- https://capecodwoodworking.com/shop/{$product->slug}\n";
}

echo "\n</pre>";
?>
