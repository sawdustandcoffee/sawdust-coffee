<?php
/**
 * Test API via Web Request (simulates browser)
 * Access: https://capecodwoodworking.com/test-web-api.php
 */

echo "<pre>\n";
echo "=== Test API via Web Request ===\n\n";

// Test the API endpoint via HTTP request (like a browser does)
$apiUrl = 'https://capecodwoodworking.com/api/public/products';

echo "Testing: $apiUrl\n\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_VERBOSE, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

echo "HTTP Status Code: $httpCode\n\n";

echo "Response Headers:\n";
echo "---\n";
echo $headers;
echo "---\n\n";

if ($httpCode === 200) {
    echo "✓ API returned 200 OK\n";

    $data = json_decode($body, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ Valid JSON response\n";
        echo "  Total products: " . ($data['total'] ?? 'unknown') . "\n";
        echo "  Products in response: " . (isset($data['data']) ? count($data['data']) : 0) . "\n";
    } else {
        echo "✗ Invalid JSON: " . json_last_error_msg() . "\n";
        echo "Body: " . substr($body, 0, 500) . "\n";
    }
} else {
    echo "✗ API returned error code: $httpCode\n\n";

    echo "Response Body:\n";
    echo "---\n";
    echo substr($body, 0, 2000);
    echo "\n---\n\n";

    // Check if it's a Laravel error or web server error
    if (strpos($body, 'Laravel') !== false || strpos($body, 'Whoops') !== false) {
        echo "→ This is a Laravel application error\n";
    } else if (strpos($body, 'Apache') !== false || strpos($body, 'Internal Server Error') !== false) {
        echo "→ This is a web server error\n";
    } else {
        echo "→ Unknown error type\n";
    }
}

echo "\n=== Additional Diagnostics ===\n\n";

// Test if index.php exists and is accessible
echo "Checking backend/public/index.php:\n";
$indexPath = __DIR__ . '/backend/public/index.php';
if (file_exists($indexPath)) {
    echo "✓ index.php exists\n";
    echo "  Size: " . filesize($indexPath) . " bytes\n";
    echo "  Readable: " . (is_readable($indexPath) ? 'Yes' : 'No') . "\n";
} else {
    echo "✗ index.php NOT found at: $indexPath\n";
}
echo "\n";

// Check if index.php exists in root (for Hostinger deployment)
echo "Checking root index.php:\n";
$rootIndexPath = __DIR__ . '/index.php';
if (file_exists($rootIndexPath)) {
    echo "✓ Root index.php exists\n";
    echo "  Size: " . filesize($rootIndexPath) . " bytes\n";

    // Show first few lines
    $lines = file($rootIndexPath);
    echo "  First 5 lines:\n";
    foreach (array_slice($lines, 0, 5) as $i => $line) {
        echo "    " . ($i + 1) . ": " . rtrim($line) . "\n";
    }
} else {
    echo "✗ Root index.php NOT found\n";
}
echo "\n";

// Check .htaccess
echo "Checking .htaccess:\n";
$htaccessPath = __DIR__ . '/.htaccess';
if (file_exists($htaccessPath)) {
    echo "✓ .htaccess exists\n";
    echo "  Size: " . filesize($htaccessPath) . " bytes\n";
    echo "\n  Contents:\n";
    echo "---\n";
    echo file_get_contents($htaccessPath);
    echo "\n---\n";
} else {
    echo "✗ .htaccess NOT found\n";
}

echo "\n</pre>";
?>
