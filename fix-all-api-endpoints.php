<?php
/**
 * Fix All API Endpoints - Comprehensive diagnostic and fix
 * Access: https://capecodwoodworking.com/fix-all-api-endpoints.php
 */

set_time_limit(300);
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<pre>\n";
echo "=== Fix All API Endpoints ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$endpoints = [
    '/api/public/products/cornhole-board-vinyl-wrap-cutter',
    '/api/public/collections?featured=true',
    '/api/public/tags',
];

echo "Testing " . count($endpoints) . " API endpoints\n\n";

foreach ($endpoints as $endpoint) {
    echo "=== Testing: $endpoint ===\n";

    $url = 'https://capecodwoodworking.com' . $endpoint;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP Status: $httpCode\n";

    if ($httpCode === 200) {
        echo "✓ Working\n";
        $data = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "  Valid JSON response\n";
        }
    } else {
        echo "✗ FAILED\n";
        echo "Response: " . substr($response, 0, 200) . "\n";

        // Try to diagnose the issue
        echo "\nDiagnosing...\n";

        if (strpos($endpoint, '/products/') !== false) {
            // Single product endpoint
            $slug = basename($endpoint);
            echo "  Testing product: $slug\n";

            try {
                $product = \App\Models\Product::with(['categories', 'images', 'activeVariants', 'options.values'])
                    ->where('slug', $slug)
                    ->where('active', true)
                    ->first();

                if ($product) {
                    echo "  ✓ Product found in database\n";

                    // Try to convert to JSON
                    $json = json_encode($product->toArray());
                    if (json_last_error() === JSON_ERROR_NONE) {
                        echo "  ✓ Product converts to JSON\n";
                    } else {
                        echo "  ✗ JSON error: " . json_last_error_msg() . "\n";
                    }
                } else {
                    echo "  ✗ Product not found\n";
                }
            } catch (\Exception $e) {
                echo "  ✗ Error: " . $e->getMessage() . "\n";
                echo "    " . $e->getFile() . ":" . $e->getLine() . "\n";
            }
        }

        if (strpos($endpoint, '/collections') !== false) {
            echo "  Checking collections table...\n";
            try {
                $tableExists = DB::select("SHOW TABLES LIKE 'collections'");
                if (empty($tableExists)) {
                    echo "  ✗ collections table does NOT exist\n";
                    echo "  → This endpoint needs collections table to be created\n";
                } else {
                    echo "  ✓ collections table exists\n";
                }
            } catch (\Exception $e) {
                echo "  ✗ Error checking table: " . $e->getMessage() . "\n";
            }
        }

        if (strpos($endpoint, '/tags') !== false) {
            echo "  Checking product_tags table...\n";
            try {
                $tableExists = DB::select("SHOW TABLES LIKE 'product_tags'");
                if (empty($tableExists)) {
                    echo "  ✗ product_tags table does NOT exist\n";
                    echo "  → This endpoint needs product_tags table to be created\n";
                } else {
                    echo "  ✓ product_tags table exists\n";
                }
            } catch (\Exception $e) {
                echo "  ✗ Error checking table: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "\n";
}

echo "=== Checking Database Tables ===\n\n";

$requiredTables = [
    'products',
    'product_images',
    'product_categories',
    'product_category',
    'collections',
    'product_tags',
    'product_product_tag',
];

foreach ($requiredTables as $table) {
    $exists = DB::select("SHOW TABLES LIKE '$table'");
    if (empty($exists)) {
        echo "✗ $table - MISSING\n";
    } else {
        $count = DB::table($table)->count();
        echo "✓ $table - exists ($count rows)\n";
    }
}

echo "\n=== Recommended Fixes ===\n\n";

$missingTables = [];
foreach ($requiredTables as $table) {
    $exists = DB::select("SHOW TABLES LIKE '$table'");
    if (empty($exists)) {
        $missingTables[] = $table;
    }
}

if (!empty($missingTables)) {
    echo "Missing tables: " . implode(', ', $missingTables) . "\n\n";
    echo "Options:\n";
    echo "1. Run migrations to create missing tables\n";
    echo "2. Disable endpoints that require missing tables\n";
    echo "3. Remove frontend components that call these endpoints\n\n";

    echo "Quick fix: Disable problematic API routes\n";
    echo "  Edit: backend/routes/api.php\n";
    echo "  Comment out routes for: collections, tags\n";
} else {
    echo "✓ All required tables exist\n\n";
    echo "The issue might be:\n";
    echo "1. Controller trying to eager-load missing relationships\n";
    echo "2. Appended attributes accessing missing data\n";
    echo "3. Route parameters not matching\n";
}

echo "\n</pre>";
?>
