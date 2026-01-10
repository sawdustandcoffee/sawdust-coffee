<?php

namespace Database\Seeders;

use App\Models\ContactFormSubmission;
use App\Models\GalleryItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding demo data...');

        // Create admin user
        $this->command->info('Creating admin user...');
        User::firstOrCreate(
            ['email' => 'admin@sawdustandcoffee.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
            ]
        );

        // Create categories
        $this->command->info('Creating product categories...');
        $categories = ProductCategory::factory()->count(7)->create();

        // Create products with category relationships
        $this->command->info('Creating products...');
        $products = Product::factory()->count(25)->create();

        // Attach random categories to products
        foreach ($products as $product) {
            $product->categories()->attach(
                $categories->random(rand(1, 3))->pluck('id')->toArray()
            );
        }

        // Create some featured products
        $this->command->info('Creating featured products...');
        Product::factory()->featured()->count(5)->create()->each(function ($product) use ($categories) {
            $product->categories()->attach(
                $categories->random(rand(1, 2))->pluck('id')->toArray()
            );
        });

        // Create some products on sale
        $this->command->info('Creating sale products...');
        Product::factory()->onSale()->count(8)->create()->each(function ($product) use ($categories) {
            $product->categories()->attach(
                $categories->random(rand(1, 2))->pluck('id')->toArray()
            );
        });

        // Create some out of stock products
        $this->command->info('Creating out of stock products...');
        Product::factory()->outOfStock()->count(3)->create()->each(function ($product) use ($categories) {
            $product->categories()->attach(
                $categories->random(rand(1, 2))->pluck('id')->toArray()
            );
        });

        // Create gallery items
        $this->command->info('Creating gallery items...');
        GalleryItem::factory()->count(20)->create();
        GalleryItem::factory()->featured()->count(5)->create();

        // Create orders (completed with paid status)
        $this->command->info('Creating completed orders...');
        Order::factory()->completed()->count(15)->create()->each(function ($order) use ($products) {
            // Add 1-3 order items per order
            $orderProducts = $products->random(rand(1, 3));
            foreach ($orderProducts as $product) {
                $quantity = rand(1, 3);
                $priceAtPurchase = $product->sale_price ?? $product->price;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price_at_purchase' => $priceAtPurchase,
                    'subtotal' => $priceAtPurchase * $quantity,
                ]);
            }

            // Recalculate order total
            $subtotal = $order->items->sum('subtotal');
            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + $order->tax + $order->shipping,
            ]);
        });

        // Create pending orders
        $this->command->info('Creating pending orders...');
        Order::factory()->pending()->count(5)->create()->each(function ($order) use ($products) {
            $orderProducts = $products->random(rand(1, 2));
            foreach ($orderProducts as $product) {
                $quantity = rand(1, 2);
                $priceAtPurchase = $product->sale_price ?? $product->price;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price_at_purchase' => $priceAtPurchase,
                    'subtotal' => $priceAtPurchase * $quantity,
                ]);
            }

            $subtotal = $order->items->sum('subtotal');
            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + $order->tax + $order->shipping,
            ]);
        });

        // Create quote requests
        $this->command->info('Creating quote requests...');
        QuoteRequest::factory()->count(10)->create();
        QuoteRequest::factory()->state(['status' => 'new'])->count(5)->create();
        QuoteRequest::factory()->state(['status' => 'quoted', 'quoted_price' => rand(500, 5000)])->count(3)->create();
        QuoteRequest::factory()->state(['status' => 'accepted'])->count(2)->create();

        // Create contact form submissions
        $this->command->info('Creating contact submissions...');
        ContactFormSubmission::factory()->count(15)->create();
        ContactFormSubmission::factory()->state(['status' => 'new'])->count(5)->create();
        ContactFormSubmission::factory()->state(['status' => 'responded'])->count(5)->create();

        $this->command->info('Demo data seeded successfully!');
        $this->command->newLine();
        $this->command->info('Admin Login:');
        $this->command->info('Email: admin@sawdustandcoffee.com');
        $this->command->info('Password: password123');
    }
}
