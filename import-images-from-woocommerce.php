<?php
/**
 * Import Product Images from WooCommerce Site
 * Access: https://capecodwoodworking.com/import-images-from-woocommerce.php
 */

set_time_limit(600); // 10 minutes
ini_set('max_execution_time', 600);

echo "<pre>\n";
echo "=== Import Images from WooCommerce ===\n\n";

chdir(__DIR__ . '/backend');

// Bootstrap Laravel
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$woocommerceUrl = 'https://sawdustandcoffee.com';
$apiEndpoint = $woocommerceUrl . '/wp-json/wc/v3/products';

// Try to fetch products from WooCommerce API (public access)
echo "Step 1: Fetching products from WooCommerce API\n";
echo "Endpoint: $apiEndpoint\n\n";

$ch = curl_init($apiEndpoint . '?per_page=100');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Cape Cod Woodworking Import Script');
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "✗ API returned HTTP $httpCode\n";
    echo "Response: " . substr($response, 0, 500) . "\n\n";
    echo "Trying alternative approach: Scraping product pages...\n\n";

    // Fallback: Use our known products and scrape images from product pages
    $products = \App\Models\Product::with('images')->get();

    foreach ($products as $product) {
        echo "Processing: {$product->name}\n";

        $productUrl = $woocommerceUrl . '/product/' . $product->slug . '/';
        echo "  Fetching: $productUrl\n";

        $ch = curl_init($productUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            echo "  ✗ Failed to fetch page (HTTP $httpCode)\n\n";
            continue;
        }

        // Extract images from HTML
        $imageUrls = [];

        // Look for WooCommerce gallery images
        if (preg_match_all('/data-large_image="([^"]+)"/', $html, $matches)) {
            $imageUrls = array_merge($imageUrls, $matches[1]);
        }

        // Look for product image in meta tags
        if (preg_match('/<meta property="og:image" content="([^"]+)"/', $html, $match)) {
            $imageUrls[] = $match[1];
        }

        // Look for img tags in product gallery
        if (preg_match_all('/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/', $html, $matches)) {
            $imageUrls = array_merge($imageUrls, $matches[1]);
        }

        // Remove duplicates
        $imageUrls = array_unique($imageUrls);

        echo "  Found " . count($imageUrls) . " images\n";

        if (empty($imageUrls)) {
            echo "  ✗ No images found\n\n";
            continue;
        }

        // Download and save images
        $storageDir = __DIR__ . '/backend/storage/app/public/products';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        // Remove old placeholder images
        DB::table('product_images')
            ->where('product_id', $product->id)
            ->where('path', 'products/placeholder.jpg')
            ->delete();

        $savedCount = 0;
        foreach ($imageUrls as $index => $imageUrl) {
            echo "  Downloading image " . ($index + 1) . ": $imageUrl\n";

            // Clean URL (remove query strings and get full size)
            $cleanUrl = strtok($imageUrl, '?');
            $cleanUrl = str_replace('-150x150', '', $cleanUrl);
            $cleanUrl = str_replace('-300x300', '', $cleanUrl);
            $cleanUrl = str_replace('-scaled', '', $cleanUrl);

            $ch = curl_init($cleanUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            $imageData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $imageData && strlen($imageData) > 0) {
                $extension = pathinfo(parse_url($cleanUrl, PHP_URL_PATH), PATHINFO_EXTENSION);
                if (empty($extension) || !in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                    $extension = 'jpg';
                }

                $filename = $product->slug . '-' . ($index + 1) . '.' . $extension;
                $filepath = $storageDir . '/' . $filename;

                file_put_contents($filepath, $imageData);
                echo "    ✓ Saved: $filename (" . number_format(strlen($imageData)) . " bytes)\n";

                // Create image record
                DB::table('product_images')->insert([
                    'product_id' => $product->id,
                    'path' => 'products/' . $filename,
                    'alt_text' => $product->name . ' - Image ' . ($index + 1),
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $savedCount++;
            } else {
                echo "    ✗ Failed (HTTP $httpCode)\n";
            }
        }

        echo "  ✓ Saved $savedCount images for {$product->name}\n\n";
    }

    echo "=== Import Complete (Scraping Method) ===\n";

} else {
    // WooCommerce API worked
    $wooProducts = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        die("✗ Invalid JSON: " . json_last_error_msg() . "\n");
    }

    echo "✓ Found " . count($wooProducts) . " products in WooCommerce\n\n";

    // Match and download images
    echo "Step 2: Matching products and downloading images\n\n";

    $storageDir = __DIR__ . '/backend/storage/app/public/products';
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
    }

    $matchedCount = 0;
    $imageCount = 0;

    foreach ($wooProducts as $wooProduct) {
        $slug = $wooProduct['slug'];

        // Find matching product in our database
        $product = \App\Models\Product::where('slug', $slug)->first();

        if (!$product) {
            echo "⊘ No match for slug: $slug\n";
            continue;
        }

        echo "Processing: {$product->name}\n";
        $matchedCount++;

        // Remove old placeholder images
        DB::table('product_images')
            ->where('product_id', $product->id)
            ->where('path', 'products/placeholder.jpg')
            ->delete();

        // Collect all image URLs
        $imageUrls = [];

        // Featured image
        if (!empty($wooProduct['images'])) {
            foreach ($wooProduct['images'] as $img) {
                if (!empty($img['src'])) {
                    $imageUrls[] = $img['src'];
                }
            }
        }

        echo "  Found " . count($imageUrls) . " images\n";

        // Download each image
        foreach ($imageUrls as $index => $imageUrl) {
            echo "  Downloading image " . ($index + 1) . ": $imageUrl\n";

            $ch = curl_init($imageUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            $imageData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $imageData && strlen($imageData) > 0) {
                $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION);
                if (empty($extension)) {
                    $extension = 'jpg';
                }

                $filename = $product->slug . '-' . ($index + 1) . '.' . $extension;
                $filepath = $storageDir . '/' . $filename;

                file_put_contents($filepath, $imageData);
                echo "    ✓ Saved: $filename (" . number_format(strlen($imageData)) . " bytes)\n";

                // Create image record
                DB::table('product_images')->insert([
                    'product_id' => $product->id,
                    'path' => 'products/' . $filename,
                    'alt_text' => $product->name . ' - Image ' . ($index + 1),
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $imageCount++;
            } else {
                echo "    ✗ Failed (HTTP $httpCode)\n";
            }
        }

        echo "\n";
    }

    echo "=== Import Complete (API Method) ===\n\n";
    echo "Products matched: $matchedCount\n";
    echo "Images downloaded: $imageCount\n";
}

echo "\nNext steps:\n";
echo "1. Visit: https://capecodwoodworking.com/shop\n";
echo "2. All products should now have real images\n";
echo "3. Check individual product pages\n";

echo "\n</pre>";
?>
