<?php
/**
 * Update .htaccess from backend/public to public_html
 * Access: https://capecodwoodworking.com/update-htaccess.php
 */

echo "<pre>\n";
echo "=== Update .htaccess ===\n\n";

$backendHtaccess = __DIR__ . '/backend/public/.htaccess';
$publicHtaccess = __DIR__ . '/.htaccess';

echo "Source: $backendHtaccess\n";
echo "Destination: $publicHtaccess\n\n";

if (!file_exists($backendHtaccess)) {
    die("✗ Source .htaccess not found!\n");
}

echo "Copying .htaccess...\n";
if (copy($backendHtaccess, $publicHtaccess)) {
    echo "✓ .htaccess updated successfully\n\n";

    echo "New .htaccess contents:\n";
    echo "---\n";
    echo file_get_contents($publicHtaccess);
    echo "\n---\n";
} else {
    echo "✗ Failed to copy .htaccess\n";
}

echo "\n=== Update Complete ===\n";
echo "</pre>";
?>
