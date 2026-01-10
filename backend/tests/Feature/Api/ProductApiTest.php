<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user for authenticated requests
        $this->admin = User::factory()->create([
            'email' => 'admin@sawdustandcoffee.com',
        ]);
    }

    public function test_public_can_view_active_products(): void
    {
        // Create some products
        Product::factory()->count(5)->create(['active' => true]);
        Product::factory()->count(2)->create(['active' => false]);

        $response = $this->getJson('/api/public/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price', 'description', 'active']
                ]
            ]);

        // Should only return active products
        $this->assertCount(5, $response->json('data'));
    }

    public function test_public_can_view_single_product_by_slug(): void
    {
        $product = Product::factory()->create([
            'name' => 'Test Walnut Table',
            'slug' => 'test-walnut-table',
            'active' => true,
        ]);

        $response = $this->getJson('/api/public/products/test-walnut-table');

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'Test Walnut Table',
                'slug' => 'test-walnut-table',
            ]);
    }

    public function test_admin_can_create_product(): void
    {
        $productData = [
            'name' => 'New Product',
            'slug' => 'new-product',
            'sku' => 'SC-TEST-001',
            'description' => 'Test description',
            'price' => 99.99,
            'inventory' => 10,
            'active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', $productData);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'New Product']);

        $this->assertDatabaseHas('products', [
            'name' => 'New Product',
            'slug' => 'new-product',
        ]);
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/products/{$product->id}", [
                'name' => 'Updated Name',
                'slug' => $product->slug,
                'price' => $product->price,
                'inventory' => $product->inventory,
                'active' => $product->active,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/products/{$product->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }

    public function test_guest_cannot_create_product(): void
    {
        $productData = [
            'name' => 'New Product',
            'slug' => 'new-product',
            'price' => 99.99,
        ];

        $response = $this->postJson('/api/admin/products', $productData);

        $response->assertStatus(401);
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        Product::factory()->count(3)->create(['active' => true]);

        $response = $this->getJson('/api/public/products?category=1');

        $response->assertStatus(200);
    }

    public function test_products_can_be_sorted_by_price(): void
    {
        Product::factory()->create(['price' => 100, 'active' => true]);
        Product::factory()->create(['price' => 50, 'active' => true]);
        Product::factory()->create(['price' => 75, 'active' => true]);

        $response = $this->getJson('/api/public/products?sort_by=price&sort_dir=asc');

        $response->assertStatus(200);

        $prices = collect($response->json('data'))->pluck('price');
        $this->assertEquals($prices, $prices->sort()->values());
    }

    public function test_featured_products_can_be_retrieved(): void
    {
        Product::factory()->count(3)->create(['featured' => true, 'active' => true]);
        Product::factory()->count(5)->create(['featured' => false, 'active' => true]);

        $response = $this->getJson('/api/public/products?featured=true');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }
}
