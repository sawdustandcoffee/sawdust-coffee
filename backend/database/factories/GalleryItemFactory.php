<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GalleryItem>
 */
class GalleryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = [
            'Custom Walnut River Table',
            'Personalized Family Name Sign',
            'Live Edge Bar Top Installation',
            'Rustic Kitchen Island',
            'Laser Engraved Wedding Gift',
            'CNC Carved Business Logo',
            'Epoxy Resin Coffee Table',
            'Custom Cornhole Tournament Set',
        ];

        return [
            'title' => fake()->randomElement($titles),
            'description' => fake()->sentence(15),
            'category' => fake()->randomElement(['Furniture', 'Signs', 'Live Edge', 'Epoxy', 'Custom Work', 'Games']),
            'image_path' => '/storage/gallery/' . fake()->uuid() . '.jpg',
            'featured' => fake()->boolean(30), // 30% featured
        ];
    }

    /**
     * Indicate that the gallery item is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }
}
