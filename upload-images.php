<?php
/**
 * Product Image Upload Tool
 * Access: https://capecodwoodworking.com/upload-images.php
 */

// Bootstrap Laravel
chdir(__DIR__ . '/backend');
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Handle image upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image']) && isset($_POST['product_id'])) {
    try {
        $productId = (int)$_POST['product_id'];
        $product = \App\Models\Product::findOrFail($productId);

        // Validate image
        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid file type. Only JPG, PNG, and WEBP allowed.');
        }

        if ($file['size'] > $maxSize) {
            throw new Exception('File too large. Max 5MB.');
        }

        // Create storage directory
        $storageDir = __DIR__ . '/backend/storage/app/public/products';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        // Generate filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $product->slug . '-' . time() . '.' . $extension;
        $filepath = $storageDir . '/' . $filename;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            // Remove old placeholder image record
            \DB::table('product_images')
                ->where('product_id', $productId)
                ->where('path', 'products/placeholder.jpg')
                ->delete();

            // Create new image record
            \DB::table('product_images')->insert([
                'product_id' => $productId,
                'path' => 'products/' . $filename,
                'alt_text' => $product->name,
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $success = "✓ Image uploaded for: {$product->name}";
        } else {
            throw new Exception('Failed to save file');
        }

    } catch (\Exception $e) {
        $error = "✗ Error: " . $e->getMessage();
    }
}

// Get all products
$products = \App\Models\Product::with('images')->orderBy('name')->get();

?>
<!DOCTYPE html>
<html>
<head>
    <title>Upload Product Images</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .product-card {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .product-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .product-price {
            color: #666;
            margin-bottom: 10px;
        }
        .has-placeholder {
            color: #dc3545;
            font-size: 14px;
        }
        .has-real-image {
            color: #28a745;
            font-size: 14px;
        }
        .upload-form {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        input[type="file"] {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            flex: 1;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #0056b3;
        }
        .original-link {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        .original-link a {
            color: #007bff;
        }
        .stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>📸 Product Image Upload Tool</h1>

    <?php if (isset($success)): ?>
        <div class="success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <?php if (isset($error)): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php
    $totalProducts = $products->count();
    $withPlaceholder = $products->filter(function($p) {
        return $p->images->first() && $p->images->first()->path === 'products/placeholder.jpg';
    })->count();
    $withRealImages = $totalProducts - $withPlaceholder;
    ?>

    <div class="stats">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number"><?= $totalProducts ?></div>
                <div class="stat-label">Total Products</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" style="color: #dc3545;"><?= $withPlaceholder ?></div>
                <div class="stat-label">Need Images</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" style="color: #28a745;"><?= $withRealImages ?></div>
                <div class="stat-label">Have Images</div>
            </div>
        </div>
    </div>

    <p><strong>Instructions:</strong> Upload images for each product. You can download the original images from sawdustandcoffee.com first, then upload them here.</p>

    <?php foreach ($products as $product): ?>
        <?php
        $image = $product->images->first();
        $imagePath = $image ? $image->path : 'products/placeholder.jpg';
        $isPlaceholder = $imagePath === 'products/placeholder.jpg';
        $imageUrl = 'https://capecodwoodworking.com/storage/' . $imagePath;
        ?>

        <div class="product-card">
            <img src="<?= htmlspecialchars($imageUrl) ?>" alt="<?= htmlspecialchars($product->name) ?>" class="product-image">

            <div class="product-info">
                <div class="product-name"><?= htmlspecialchars($product->name) ?></div>
                <div class="product-price">$<?= number_format($product->price, 2) ?></div>

                <?php if ($isPlaceholder): ?>
                    <div class="has-placeholder">⚠ Using placeholder image</div>
                <?php else: ?>
                    <div class="has-real-image">✓ Has real image</div>
                <?php endif; ?>

                <div class="original-link">
                    Original: <a href="https://sawdustandcoffee.com/product/<?= urlencode($product->slug) ?>/" target="_blank">View on sawdustandcoffee.com</a>
                </div>

                <form method="POST" enctype="multipart/form-data" class="upload-form">
                    <input type="hidden" name="product_id" value="<?= $product->id ?>">
                    <input type="file" name="image" accept="image/jpeg,image/jpg,image/png,image/webp" required>
                    <button type="submit">Upload Image</button>
                </form>
            </div>
        </div>
    <?php endforeach; ?>

</body>
</html>
