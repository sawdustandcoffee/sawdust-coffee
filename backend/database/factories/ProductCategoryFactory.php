<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductCategory>
 */
class ProductCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'Furniture', 'description' => 'Custom handcrafted furniture pieces'],
            ['name' => 'Live Edge', 'description' => 'Natural edge wood furniture and decor'],
            ['name' => 'Signs', 'description' => 'CNC and laser engraved custom signs'],
            ['name' => 'Kitchen', 'description' => 'Cutting boards, charcuterie boards, and kitchen items'],
            ['name' => 'Home Decor', 'description' => 'Decorative pieces for your home'],
            ['name' => 'Games', 'description' => 'Cornhole boards and other game sets'],
            ['name' => 'Epoxy', 'description' => 'Epoxy resin river tables and designs'],
        ];

        $category = fake()->randomElement($categories);
        $slug = \Illuminate\Support\Str::slug($category['name']) . '-' . fake()->unique()->numberBetween(1, 100);

        return [
            'name' => $category['name'],
            'slug' => $slug,
            'description' => $category['description'],
        ];
    }
}
