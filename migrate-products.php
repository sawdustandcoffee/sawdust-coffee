<?php
/**
 * Migrate Products from sawdustandcoffee.com
 * Access: https://capecodwoodworking.com/migrate-products.php
 */

set_time_limit(600); // 10 minutes

echo "<pre>\n";
echo "=== Product Migration from sawdustandcoffee.com ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Product data from sawdustandcoffee.com
$products = [
    [
        'name' => 'Cornhole Board Vinyl Wrap Cutter',
        'slug' => 'cornhole-board-vinyl-wrap-cutter',
        'price' => 40.00, // Average of range
        'description' => 'Professional vinyl wrap cutter for cornhole boards',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2024/11/il_794xN.7076543987_2hzy-300x300.avif',
        'category' => 'Cornhole Boards',
        'active' => true,
        'featured' => false,
        'inventory' => 10,
    ],
    [
        'name' => 'Personalized Holiday Gift & Stocking Tags (3D Printed Multicolor)',
        'slug' => 'personalized-holiday-gift-stocking-tags-3d-printed-multicolor',
        'price' => 20.00,
        'description' => '3D printed multicolor holiday gift and stocking tags - personalized for your family',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2024/11/20241111_115441-300x300.jpg',
        'category' => 'Small Items',
        'active' => true,
        'featured' => false,
        'inventory' => 50,
    ],
    [
        'name' => 'Slab Flattening and other Surfacing',
        'slug' => 'slab-flattening-and-other-surfacing',
        'price' => 525.00, // Average of range
        'description' => 'Professional slab flattening and wood surfacing services',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2024/02/29308-300x300.jpeg',
        'category' => 'Services',
        'active' => true,
        'featured' => false,
        'inventory' => 999,
    ],
    [
        'name' => 'American Flag Cornhole Set – Built-In Scoreboard',
        'slug' => 'american-flag-cornhole-set-built-in-scoreboard',
        'price' => 375.99,
        'description' => 'Beautiful American flag themed cornhole set with built-in scoreboard',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2024/01/PXL_20240119_221359153-300x300.jpg',
        'category' => 'Cornhole Boards',
        'active' => true,
        'featured' => true,
        'inventory' => 5,
    ],
    [
        'name' => 'Unfinished Cornhole Free Standing Scoreboard',
        'slug' => 'unfinished-cornhole-free-standing-scoreboard',
        'price' => 75.00,
        'description' => 'Unfinished wooden free standing scoreboard for cornhole games',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2024/09/PXL_20240902_171957465-removebg-preview-300x300.png',
        'category' => 'Cornhole Boards',
        'active' => true,
        'featured' => false,
        'inventory' => 8,
    ],
    [
        'name' => 'Unfinished Cornhole Set – Built-In Scoreboard',
        'slug' => 'unfinished-cornhole-set-built-in-scoreboard',
        'price' => 249.99,
        'description' => 'Unfinished cornhole set with built-in scoreboard - ready for your custom finish',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/12/unfinished-cornhole-face-300x300.png',
        'category' => 'Cornhole Boards',
        'active' => true,
        'featured' => false,
        'inventory' => 10,
    ],
    [
        'name' => 'Unfinished Cornhole Set – Free Standing Scoreboard',
        'slug' => 'unfinished-cornhole-set-free-standing-scoreboard',
        'price' => 299.99,
        'description' => 'Unfinished cornhole set with free standing scoreboard',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/12/unfinished-cornhole-face-300x300.png',
        'category' => 'Cornhole Boards',
        'active' => true,
        'featured' => false,
        'inventory' => 10,
    ],
    [
        'name' => 'Wavy 3D Wooden American Flag',
        'slug' => 'painted-and-carved-wooden-american-flag',
        'price' => 250.00, // Average of range
        'description' => 'Stunning wavy 3D wooden American flag - hand-carved and painted',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/05/american-flag-standard-300x300.jpg',
        'category' => 'CNC Signs',
        'active' => true,
        'featured' => true,
        'inventory' => 5,
    ],
    [
        'name' => 'Wavy 3D Wooden American Flag – First Responder',
        'slug' => 'painted-and-carved-wooden-first-responder-flag',
        'price' => 275.00, // Average of range
        'description' => 'Wavy 3D wooden American flag honoring first responders - hand-carved and painted',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/05/received_1292529398018725-300x300.jpeg',
        'category' => 'CNC Signs',
        'active' => true,
        'featured' => true,
        'inventory' => 5,
    ],
    [
        'name' => 'Wavy 3D Wooden American Flag – Wall Clock',
        'slug' => 'wavy-3d-wooden-american-flag-wall-clock',
        'price' => 300.00, // Average of range
        'description' => 'Wavy 3D wooden American flag with built-in wall clock mechanism',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/09/PXL_20230908_210648261-300x300.jpg',
        'category' => 'CNC Signs',
        'active' => true,
        'featured' => false,
        'inventory' => 3,
    ],
    [
        'name' => 'Custom Live Edge Tables',
        'slug' => 'custom-live-edge-tables',
        'price' => 0.00, // Customized per order
        'description' => 'Custom handcrafted live edge tables - each piece unique. Contact for pricing.',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/03/PXL_20230325_210237836-300x300.jpg',
        'category' => 'Live Edge Furniture',
        'active' => true,
        'featured' => true,
        'inventory' => 999,
    ],
    [
        'name' => 'Wooden Horse (CNC/Laser) – Downloadable Files',
        'slug' => 'wooden-horse-plans-cnc-laser',
        'price' => 50.00,
        'description' => 'Downloadable CNC/Laser files for creating beautiful wooden horses',
        'image_url' => 'https://sawdustandcoffee.com/wp-content/uploads/2023/01/PXL_20230103_234318914-300x300.jpg',
        'category' => 'Small Items',
        'active' => true,
        'featured' => false,
        'inventory' => 999,
    ],
];

try {
    $db = DB::connection()->getPdo();

    // Create storage directory if needed
    $storageDir = __DIR__ . '/backend/storage/app/public/products';
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
        echo "✓ Created storage directory: $storageDir\n\n";
    }

    echo "Step 1: Processing " . count($products) . " products\n\n";

    $importedCount = 0;
    $skippedCount = 0;
    $imageCount = 0;

    foreach ($products as $productData) {
        echo "Processing: {$productData['name']}\n";

        // Check if product already exists
        $existing = DB::table('products')->where('slug', $productData['slug'])->first();

        if ($existing) {
            echo "  ⊘ Product already exists (ID: {$existing->id}), skipping\n\n";
            $skippedCount++;
            continue;
        }

        // Get or create category
        $category = DB::table('product_categories')
            ->where('name', $productData['category'])
            ->first();

        if (!$category) {
            echo "  ! Category '{$productData['category']}' not found, using first available\n";
            $category = DB::table('product_categories')->first();
        }

        // Generate unique SKU
        $baseSku = 'SD-' . strtoupper(substr(str_replace('-', '', $productData['slug']), 0, 10));
        $sku = $baseSku;
        $counter = 1;

        // Ensure SKU is unique
        while (DB::table('products')->where('sku', $sku)->exists()) {
            $sku = $baseSku . '-' . $counter;
            $counter++;
        }

        // Create product
        $productId = DB::table('products')->insertGetId([
            'name' => $productData['name'],
            'slug' => $productData['slug'],
            'description' => $productData['description'],
            'long_description' => $productData['description'],
            'price' => $productData['price'],
            'sale_price' => null,
            'inventory' => $productData['inventory'],
            'active' => $productData['active'],
            'featured' => $productData['featured'],
            'sku' => $sku,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        echo "  ✓ Product created (ID: $productId)\n";

        // Attach category
        if ($category) {
            DB::table('product_category')->insert([
                'product_id' => $productId,
                'product_category_id' => $category->id,
            ]);
            echo "  ✓ Category attached: {$category->name}\n";
        }

        // Download and save image
        $imageUrl = $productData['image_url'];

        // Try full-size image first (remove -300x300)
        $fullSizeUrl = str_replace('-300x300', '', $imageUrl);

        $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION);

        // Handle .avif extension (convert to jpg for compatibility)
        if ($extension === 'avif' || empty($extension)) {
            $extension = 'jpg';
        }

        $filename = $productData['slug'] . '.' . $extension;
        $filepath = $storageDir . '/' . $filename;

        echo "  Downloading image (trying full size first)...\n";

        // Try full-size image first
        $ch = curl_init($fullSizeUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $imageData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // If full-size fails, try the original URL
        if ($httpCode !== 200 || !$imageData) {
            echo "  Full-size failed (HTTP $httpCode), trying thumbnail...\n";
            $ch = curl_init($imageUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            $imageData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
        }

        if ($httpCode === 200 && $imageData && strlen($imageData) > 0) {
            file_put_contents($filepath, $imageData);
            echo "  ✓ Image saved: $filename (" . number_format(strlen($imageData)) . " bytes)\n";

            // Create product image record
            DB::table('product_images')->insert([
                'product_id' => $productId,
                'path' => 'products/' . $filename,
                'alt_text' => $productData['name'],
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            echo "  ✓ Image record created\n";
            $imageCount++;
        } else {
            echo "  ✗ Failed to download image (HTTP $httpCode)\n";
            echo "  → Using placeholder image instead\n";

            // Create placeholder image record
            DB::table('product_images')->insert([
                'product_id' => $productId,
                'path' => 'products/placeholder.jpg',
                'alt_text' => $productData['name'],
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            echo "  ✓ Placeholder image assigned\n";
        }

        echo "\n";
        $importedCount++;
    }

    echo "=== Migration Complete ===\n\n";
    echo "Products imported: $importedCount\n";
    echo "Products skipped: $skippedCount\n";
    echo "Images downloaded: $imageCount\n\n";

    echo "Next steps:\n";
    echo "1. Visit: https://capecodwoodworking.com/shop\n";
    echo "2. Click on any product to view details\n";
    echo "3. Login to admin to edit products if needed: https://capecodwoodworking.com/login\n";

} catch (\Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n</pre>";
?>
