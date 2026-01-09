<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Live Edge Furniture',
                'description' => 'Custom tables, desks, and countertops featuring natural live edges',
                'sort_order' => 1,
            ],
            [
                'name' => 'Epoxy Designs',
                'description' => 'Custom epoxy resin woodwork with unique colors and patterns',
                'sort_order' => 2,
            ],
            [
                'name' => 'CNC Signs',
                'description' => 'Custom CNC-carved wooden signs and decorative pieces',
                'sort_order' => 3,
            ],
            [
                'name' => 'Cornhole Boards',
                'description' => 'Handcrafted cornhole boards and scoreboards',
                'sort_order' => 4,
            ],
            [
                'name' => 'Custom Cabinetry',
                'description' => 'Built-in cabinets and storage solutions',
                'sort_order' => 5,
            ],
            [
                'name' => 'Small Items',
                'description' => 'Cutting boards, coasters, and other small wooden items',
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'sort_order' => $category['sort_order'],
                    'active' => true,
                ]
            );
        }

        $this->command->info('Product categories seeded successfully.');
    }
}
