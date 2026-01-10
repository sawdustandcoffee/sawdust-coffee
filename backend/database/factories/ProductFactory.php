<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productNames = [
            'Live Edge Walnut Coffee Table',
            'Custom CNC Family Name Sign',
            'Epoxy River Dining Table',
            'Rustic Pine Bookshelf',
            'Personalized Cutting Board',
            'Laser Engraved Coaster Set',
            'Custom Cornhole Board Set',
            'Live Edge Desk',
            'Floating Shelves (Set of 3)',
            'Charcuterie Board',
        ];

        $name = fake()->randomElement($productNames);
        $slug = \Illuminate\Support\Str::slug($name) . '-' . fake()->unique()->numberBetween(1, 1000);
        $price = fake()->randomFloat(2, 29.99, 1299.99);
        $hasSale = fake()->boolean(20); // 20% chance of sale

        return [
            'name' => $name,
            'slug' => $slug,
            'sku' => 'SC-' . strtoupper(fake()->bothify('???-####')),
            'description' => fake()->sentence(12),
            'long_description' => fake()->paragraph(4),
            'price' => $price,
            'sale_price' => $hasSale ? $price * fake()->randomFloat(2, 0.7, 0.9) : null,
            'inventory' => fake()->numberBetween(0, 50),
            'active' => fake()->boolean(90), // 90% active
            'featured' => fake()->boolean(20), // 20% featured
        ];
    }

    /**
     * Indicate that the product is on sale.
     */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'sale_price' => $attributes['price'] * 0.8,
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'inventory' => 0,
        ]);
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
            'active' => true,
        ]);
    }
}
