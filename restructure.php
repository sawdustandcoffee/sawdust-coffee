<?php
/**
 * Restructure Script for Hostinger
 *
 * Since Hostinger deploys to public_html root, this script:
 * 1. Copies backend/public/* files to public_html root
 * 2. Updates index.php paths to find Laravel in backend/
 * 3. Allows web server to serve from public_html root
 *
 * Access: https://capecodwoodworking.com/restructure.php
 */

echo "<pre>\n";
echo "=== Restructuring for Hostinger ===\n\n";

$publicHtml = __DIR__;
$backendPublic = $publicHtml . '/backend/public';

// Step 1: Copy backend/public/* to public_html/
echo "Step 1: Copying backend/public files to root...\n";

$files = glob($backendPublic . '/{,.}*', GLOB_BRACE | GLOB_MARK);
foreach ($files as $file) {
    $basename = basename($file);
    if ($basename === '.' || $basename === '..') continue;

    $dest = $publicHtml . '/' . $basename;

    if (is_dir($file)) {
        if (!is_dir($dest)) {
            echo "  Copying directory: $basename\n";
            shell_exec("cp -r " . escapeshellarg($file) . " " . escapeshellarg($dest));
        }
    } else {
        echo "  Copying file: $basename\n";
        copy($file, $dest);
    }
}

echo "✓ Files copied to root\n";

// Step 2: Update index.php to point to correct paths
echo "\nStep 2: Updating index.php paths...\n";

$indexPhp = $publicHtml . '/index.php';
if (!file_exists($indexPhp)) {
    die("Error: index.php not found!\n");
}

$content = file_get_contents($indexPhp);

// Update paths to point to backend directory
$content = str_replace(
    "require __DIR__.'/../vendor/autoload.php';",
    "require __DIR__.'/backend/vendor/autoload.php';",
    $content
);

$content = str_replace(
    "require_once __DIR__.'/../bootstrap/app.php';",
    "require_once __DIR__.'/backend/bootstrap/app.php';",
    $content
);

$content = str_replace(
    "__DIR__.'/../storage'",
    "__DIR__.'/backend/storage'",
    $content
);

$content = str_replace(
    "__DIR__.'/../bootstrap/cache'",
    "__DIR__.'/backend/bootstrap/cache'",
    $content
);

file_put_contents($indexPhp, $content);
echo "✓ Updated index.php paths\n";

// Step 3: Create storage symlink in root
echo "\nStep 3: Creating storage symlink...\n";
$storageLink = $publicHtml . '/storage';
$storageTarget = $publicHtml . '/backend/storage/app/public';

if (!file_exists($storageLink) && file_exists($storageTarget)) {
    symlink($storageTarget, $storageLink);
    echo "✓ Created storage symlink\n";
} else {
    echo "⚠ Storage symlink already exists or target missing\n";
}

// Step 4: Verify files
echo "\nStep 4: Verifying structure...\n";
$required = ['index.php', 'index.html', '.htaccess', 'assets'];
foreach ($required as $file) {
    if (file_exists($publicHtml . '/' . $file)) {
        echo "✓ Found: $file\n";
    } else {
        echo "✗ Missing: $file\n";
    }
}

echo "\n=== Restructure Complete! ===\n\n";
echo "Next steps:\n";
echo "1. Visit: https://capecodwoodworking.com (should load!)\n";
echo "2. If it works, delete these files:\n";
echo "   - restructure.php\n";
echo "   - setup.php\n\n";

// Try to delete setup.php if it exists
if (file_exists($publicHtml . '/setup.php')) {
    if (unlink($publicHtml . '/setup.php')) {
        echo "✓ Deleted setup.php\n";
    }
}

echo "\n✓ All done!\n";
echo "</pre>";
?>
