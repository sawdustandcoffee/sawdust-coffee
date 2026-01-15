<?php
/**
 * Create Placeholder Product Image
 * Access: https://capecodwoodworking.com/create-placeholder.php
 */

echo "<pre>\n";
echo "=== Create Placeholder Image ===\n\n";

$storageDir = __DIR__ . '/backend/storage/app/public/products';
$placeholderPath = $storageDir . '/placeholder.jpg';

// Create products directory if it doesn't exist
if (!file_exists($storageDir)) {
    echo "Creating products directory: $storageDir\n";
    mkdir($storageDir, 0755, true);
    echo "✓ Directory created\n\n";
} else {
    echo "✓ Products directory exists: $storageDir\n\n";
}

// Check if placeholder already exists
if (file_exists($placeholderPath)) {
    echo "Placeholder image already exists: $placeholderPath\n";
    echo "Size: " . filesize($placeholderPath) . " bytes\n";
    echo "Delete it first if you want to recreate it.\n\n";
} else {
    // Create a simple 800x600 placeholder image
    echo "Creating placeholder image...\n";

    $width = 800;
    $height = 600;

    // Create image
    $image = imagecreatetruecolor($width, $height);

    // Set colors
    $bgColor = imagecolorallocate($image, 240, 240, 240); // Light gray background
    $borderColor = imagecolorallocate($image, 200, 200, 200); // Gray border
    $textColor = imagecolorallocate($image, 100, 100, 100); // Dark gray text

    // Fill background
    imagefill($image, 0, 0, $bgColor);

    // Draw border
    imagerectangle($image, 0, 0, $width - 1, $height - 1, $borderColor);
    imagerectangle($image, 10, 10, $width - 11, $height - 11, $borderColor);

    // Add text
    $text1 = "CAPE COD WOODWORKING";
    $text2 = "Product Image Placeholder";
    $text3 = $width . " x " . $height;

    // Use built-in font (font 5 is the largest built-in)
    $font = 5;

    // Calculate text positions (centered)
    $text1Width = imagefontwidth($font) * strlen($text1);
    $text2Width = imagefontwidth($font) * strlen($text2);
    $text3Width = imagefontwidth($font) * strlen($text3);

    $x1 = ($width - $text1Width) / 2;
    $x2 = ($width - $text2Width) / 2;
    $x3 = ($width - $text3Width) / 2;

    $y1 = ($height / 2) - 40;
    $y2 = ($height / 2) + 10;
    $y3 = ($height / 2) + 40;

    imagestring($image, $font, $x1, $y1, $text1, $textColor);
    imagestring($image, $font, $x2, $y2, $text2, $textColor);
    imagestring($image, $font, $x3, $y3, $text3, $textColor);

    // Save as JPEG
    if (imagejpeg($image, $placeholderPath, 85)) {
        echo "✓ Placeholder image created successfully\n";
        echo "  Location: $placeholderPath\n";
        echo "  Size: " . filesize($placeholderPath) . " bytes\n";
        echo "  Dimensions: {$width}x{$height}\n\n";
    } else {
        echo "✗ Failed to create placeholder image\n\n";
    }

    // Free memory
    imagedestroy($image);
}

// Test if accessible via URL
echo "=== Test Access ===\n";
echo "After running fix-storage.php, this image should be accessible at:\n";
echo "https://capecodwoodworking.com/storage/products/placeholder.jpg\n\n";

echo "=== Complete ===\n";
echo "</pre>";
?>
