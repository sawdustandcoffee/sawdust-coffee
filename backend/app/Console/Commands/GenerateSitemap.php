<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\GalleryItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate XML sitemap for the website';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sitemap...');

        $baseUrl = config('app.url');

        // Start XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        // Add static pages
        $staticPages = [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['url' => '/shop', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => '/about', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/services', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/gallery', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->addUrl($baseUrl . $page['url'], now(), $page['priority'], $page['changefreq']);
        }

        // Add product pages
        $products = Product::where('active', true)->get();
        $this->info("Adding {$products->count()} products...");

        foreach ($products as $product) {
            $xml .= $this->addUrl(
                $baseUrl . '/shop/' . $product->slug,
                $product->updated_at,
                '0.8',
                'weekly'
            );
        }

        // Close XML
        $xml .= '</urlset>';

        // Save to public directory
        $path = public_path('sitemap.xml');
        File::put($path, $xml);

        $this->info("Sitemap generated successfully at: {$path}");
        $this->info("Total URLs: " . (count($staticPages) + $products->count()));

        return Command::SUCCESS;
    }

    /**
     * Generate a URL entry for the sitemap
     */
    private function addUrl($loc, $lastmod, $priority, $changefreq)
    {
        $xml = '  <url>' . PHP_EOL;
        $xml .= '    <loc>' . htmlspecialchars($loc) . '</loc>' . PHP_EOL;
        $xml .= '    <lastmod>' . $lastmod->format('Y-m-d') . '</lastmod>' . PHP_EOL;
        $xml .= '    <priority>' . $priority . '</priority>' . PHP_EOL;
        $xml .= '    <changefreq>' . $changefreq . '</changefreq>' . PHP_EOL;
        $xml .= '  </url>' . PHP_EOL;

        return $xml;
    }
}
