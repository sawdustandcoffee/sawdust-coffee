<?php
/**
 * Reset Products (Clear before re-migration)
 * Access: https://capecodwoodworking.com/reset-products.php
 */

echo "<pre>\n";
echo "=== Reset Products ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Clearing products and related data...\n\n";

    // Delete in correct order (respecting foreign keys)
    $productImageCount = DB::table('product_images')->count();
    DB::table('product_images')->delete();
    echo "✓ Deleted $productImageCount product images\n";

    $categoryRelCount = DB::table('product_category')->count();
    DB::table('product_category')->delete();
    echo "✓ Deleted $categoryRelCount product-category relationships\n";

    $productCount = DB::table('products')->count();
    DB::table('products')->delete();
    echo "✓ Deleted $productCount products\n";

    // Clean up downloaded image files (keep placeholder)
    $storageDir = __DIR__ . '/backend/storage/app/public/products';
    if (is_dir($storageDir)) {
        $files = glob($storageDir . '/*');
        $deletedFiles = 0;
        foreach ($files as $file) {
            if (is_file($file) && basename($file) !== 'placeholder.jpg') {
                unlink($file);
                $deletedFiles++;
            }
        }
        echo "✓ Deleted $deletedFiles image files (kept placeholder.jpg)\n";
    }

    echo "\n=== Reset Complete ===\n\n";
    echo "You can now run migrate-products.php again to re-import all products.\n";

} catch (\Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n</pre>";
?>
