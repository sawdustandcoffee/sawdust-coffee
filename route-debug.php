<?php
/**
 * Route Debug Script
 * Access: https://capecodwoodworking.com/route-debug.php
 */

echo "<pre>\n";
echo "=== Route Debug ===\n\n";

// Test different URLs
$urlsToTest = [
    '/',
    '/login',
    '/shop',
    '/api/public/products',
];

foreach ($urlsToTest as $url) {
    echo "Testing: $url\n";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://capecodwoodworking.com' . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    echo "  Status: $httpCode\n";
    echo "  Content-Type: $contentType\n";

    if ($httpCode >= 400) {
        echo "  ✗ ERROR\n";
        // Show first 200 chars of response
        $headerSize = strpos($response, "\r\n\r\n");
        $body = substr($response, $headerSize + 4);
        echo "  Response: " . substr($body, 0, 200) . "\n";
    } else {
        echo "  ✓ OK\n";
    }
    echo "\n";
}

// Check .htaccess
echo "=== Current .htaccess ===\n";
$htaccess = __DIR__ . '/.htaccess';
if (file_exists($htaccess)) {
    echo file_get_contents($htaccess);
} else {
    echo "✗ .htaccess not found!\n";
}

// Check if index.html exists
echo "\n=== Files Check ===\n";
$indexHtml = __DIR__ . '/index.html';
echo "index.html exists: " . (file_exists($indexHtml) ? 'YES (' . filesize($indexHtml) . ' bytes)' : 'NO') . "\n";

$indexPhp = __DIR__ . '/index.php';
echo "index.php exists: " . (file_exists($indexPhp) ? 'YES (' . filesize($indexPhp) . ' bytes)' : 'NO') . "\n";

// Check backend files
echo "\n=== Backend Files ===\n";
$backendIndex = __DIR__ . '/backend/public/index.php';
echo "backend/public/index.php: " . (file_exists($backendIndex) ? 'YES' : 'NO') . "\n";

$backendHtml = __DIR__ . '/backend/public/index.html';
echo "backend/public/index.html: " . (file_exists($backendHtml) ? 'YES' : 'NO') . "\n";

echo "\n</pre>";
?>
