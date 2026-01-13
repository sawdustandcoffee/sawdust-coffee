<?php
// Hostinger deployment script
echo "=== PHP Deployment Script Started ===\n";
echo "Working directory: " . getcwd() . "\n";

// Run the shell script
echo "\n=== Running deployment script ===\n";
$output = [];
$return_var = 0;
exec('sh .hostinger-deploy.sh 2>&1', $output, $return_var);

foreach ($output as $line) {
    echo $line . "\n";
}

if ($return_var === 0) {
    echo "\n✅ Deployment completed successfully!\n";
} else {
    echo "\n❌ Deployment failed with exit code: $return_var\n";
}
