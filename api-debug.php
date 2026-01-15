<?php
/**
 * API Debug Script
 * Access: https://capecodwoodworking.com/api-debug.php
 */

echo "<pre>\n";
echo "=== Laravel API Debug ===\n\n";

// Check if we can load Laravel
echo "Step 1: Testing Laravel Bootstrap...\n";

try {
    require __DIR__ . '/backend/vendor/autoload.php';
    echo "✓ Autoloader loaded\n";

    $app = require_once __DIR__ . '/backend/bootstrap/app.php';
    echo "✓ App bootstrapped\n";

    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "✓ Kernel created\n";

    // Test database connection
    echo "\nStep 2: Testing Database Connection...\n";
    $app->make('db')->connection()->getPdo();
    echo "✓ Database connected\n";

    // Check .env values
    echo "\nStep 3: Environment Configuration...\n";
    echo "APP_ENV: " . env('APP_ENV') . "\n";
    echo "APP_DEBUG: " . (env('APP_DEBUG') ? 'true' : 'false') . "\n";
    echo "APP_URL: " . env('APP_URL') . "\n";
    echo "DB_CONNECTION: " . env('DB_CONNECTION') . "\n";
    echo "DB_HOST: " . env('DB_HOST') . "\n";
    echo "DB_DATABASE: " . env('DB_DATABASE') . "\n";

    // Test a simple API route
    echo "\nStep 4: Testing API Route...\n";
    $request = Illuminate\Http\Request::create('/api/public/products', 'GET');
    $request->server->set('REQUEST_URI', '/api/public/products');

    $response = $kernel->handle($request);
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Length: " . strlen($response->getContent()) . " bytes\n";

    if ($response->getStatusCode() === 200) {
        echo "✓ API route working\n";
        $data = json_decode($response->getContent(), true);
        if (isset($data['data'])) {
            echo "Products found: " . count($data['data']) . "\n";
        }
    } else {
        echo "✗ API route returned error\n";
        echo "Response: " . substr($response->getContent(), 0, 500) . "\n";
    }

    $kernel->terminate($request, $response);

    echo "\n=== Debug Complete ===\n";

} catch (\Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n</pre>";
?>
