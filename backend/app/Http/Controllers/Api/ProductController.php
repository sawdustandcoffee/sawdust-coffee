<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BackInStockMail;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products (Admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['categories', 'images', 'variants', 'options.values']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('product_categories.id', $request->category_id);
            });
        }

        // Filter by status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'inventory' => 'required|integer|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'active' => 'boolean',
            'featured' => 'boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:product_categories,id',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = Product::create($validated);

        // Attach categories
        if (!empty($validated['category_ids'])) {
            $product->categories()->attach($validated['category_ids']);
        }

        // Log activity
        ActivityLog::log(
            'created',
            'Product',
            $product->id,
            "Created product: {$product->name}",
            ['product' => $product->toArray()]
        );

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load(['categories', 'images', 'variants']),
        ], 201);
    }

    /**
     * Display the specified product (Admin).
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['categories', 'images', 'variants', 'options.values'])->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $oldInventory = $product->inventory;

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'inventory' => 'sometimes|integer|min:0',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'active' => 'boolean',
            'featured' => 'boolean',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:product_categories,id',
        ]);

        $product->update($validated);

        // Sync categories
        if (isset($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        // Check if inventory went from 0 to > 0 and send notifications
        if (isset($validated['inventory']) && $oldInventory == 0 && $validated['inventory'] > 0) {
            $this->sendStockNotifications($product);
        }

        // Log activity
        ActivityLog::log(
            'updated',
            'Product',
            $product->id,
            "Updated product: {$product->name}",
            ['changes' => $validated]
        );

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load(['categories', 'images', 'variants']),
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $productName = $product->name;
        $product->delete();

        // Log activity
        ActivityLog::log(
            'deleted',
            'Product',
            null,
            "Deleted product: {$productName}"
        );

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Display a listing of products (Public).
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Product::with(['categories', 'primaryImage'])
            ->where('active', true);

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('product_categories.slug', $request->category);
            });
        }

        // Filter by tag (disabled - tags table not implemented yet)
        // if ($request->has('tag')) {
        //     $query->whereHas('tags', function ($q) use ($request) {
        //         $q->where('product_tags.slug', $request->tag);
        //     });
        // }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range filter
        if ($request->has('price_min')) {
            $query->where(function ($q) use ($request) {
                $q->where('price', '>=', $request->price_min)
                    ->orWhere(function ($subQ) use ($request) {
                        $subQ->whereNotNull('sale_price')
                             ->where('sale_price', '>=', $request->price_min);
                    });
            });
        }

        if ($request->has('price_max')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($subQ) use ($request) {
                    $subQ->whereNull('sale_price')
                         ->where('price', '<=', $request->price_max);
                })->orWhere(function ($subQ) use ($request) {
                    $subQ->whereNotNull('sale_price')
                         ->where('sale_price', '<=', $request->price_max);
                });
            });
        }

        // In stock only filter
        if ($request->boolean('in_stock')) {
            $query->where('inventory', '>', 0);
        }

        // On sale only filter
        if ($request->boolean('on_sale')) {
            $query->whereNotNull('sale_price');
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = match ($sortBy) {
            'price_low' => ['price', 'asc'],
            'price_high' => ['price', 'desc'],
            'name' => ['name', 'asc'],
            default => ['created_at', 'desc'],
        };

        $query->orderBy($sortOrder[0], $sortOrder[1]);

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json($products);
    }

    /**
     * Display a single product (Public).
     */
    public function publicShow(string $slug): JsonResponse
    {
        $product = Product::with(['categories', 'images'])
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return response()->json($product);
    }

    /**
     * Adjust product inventory.
     */
    public function adjustInventory(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'adjustment' => 'required|integer',
            'notes' => 'nullable|string|max:500',
        ]);

        $oldInventory = $product->inventory;
        $newInventory = max(0, $oldInventory + $validated['adjustment']);

        $product->update(['inventory' => $newInventory]);

        // Check if inventory went from 0 to > 0 and send notifications
        if ($oldInventory == 0 && $newInventory > 0) {
            $this->sendStockNotifications($product);
        }

        // Log the inventory change
        \App\Models\ActivityLog::log(
            'inventory_adjusted',
            'Product',
            $product->id,
            "Inventory adjusted from {$oldInventory} to {$newInventory} (change: {$validated['adjustment']})",
            [
                'old_inventory' => $oldInventory,
                'new_inventory' => $newInventory,
                'adjustment' => $validated['adjustment'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Inventory updated successfully',
            'product' => $product->fresh(),
        ]);
    }

    /**
     * Upload an image for a product.
     */
    public function uploadImage(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        // If this is set as primary, unset all other primary images
        if ($request->boolean('is_primary')) {
            ProductImage::where('product_id', $product->id)
                ->update(['is_primary' => false]);
        }

        // Store the image
        $path = $request->file('image')->store('products', 'public');

        // Get the next sort order
        $maxSortOrder = ProductImage::where('product_id', $product->id)
            ->max('sort_order') ?? -1;

        // Create the image record
        $image = ProductImage::create([
            'product_id' => $product->id,
            'path' => $path,
            'alt_text' => $validated['alt_text'] ?? $product->name,
            'sort_order' => $maxSortOrder + 1,
            'is_primary' => $request->boolean('is_primary'),
        ]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'image' => $image,
        ], 201);
    }

    /**
     * Update an image's metadata.
     */
    public function updateImage(Request $request, string $productId, string $imageId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $image = ProductImage::where('product_id', $product->id)
            ->where('id', $imageId)
            ->firstOrFail();

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_primary' => 'boolean',
        ]);

        // If setting as primary, unset all other primary images
        if (isset($validated['is_primary']) && $validated['is_primary']) {
            ProductImage::where('product_id', $product->id)
                ->where('id', '!=', $image->id)
                ->update(['is_primary' => false]);
        }

        $image->update($validated);

        return response()->json([
            'message' => 'Image updated successfully',
            'image' => $image,
        ]);
    }

    /**
     * Delete a product image.
     */
    public function deleteImage(string $productId, string $imageId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $image = ProductImage::where('product_id', $product->id)
            ->where('id', $imageId)
            ->firstOrFail();

        // Delete the file from storage
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        // Delete the database record
        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * Perform bulk actions on products.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:delete,activate,deactivate,feature,unfeature',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
        ]);

        $productIds = $validated['product_ids'];
        $action = $validated['action'];
        $count = 0;

        switch ($action) {
            case 'delete':
                $count = Product::whereIn('id', $productIds)->delete();
                $message = "$count product(s) deleted successfully";
                break;

            case 'activate':
                $count = Product::whereIn('id', $productIds)->update(['active' => true]);
                $message = "$count product(s) activated successfully";
                break;

            case 'deactivate':
                $count = Product::whereIn('id', $productIds)->update(['active' => false]);
                $message = "$count product(s) deactivated successfully";
                break;

            case 'feature':
                $count = Product::whereIn('id', $productIds)->update(['featured' => true]);
                $message = "$count product(s) marked as featured successfully";
                break;

            case 'unfeature':
                $count = Product::whereIn('id', $productIds)->update(['featured' => false]);
                $message = "$count product(s) unmarked as featured successfully";
                break;

            default:
                return response()->json([
                    'message' => 'Invalid action',
                ], 400);
        }

        // Log activity
        ActivityLog::log(
            'bulk_' . $action,
            'Product',
            null,
            "Performed bulk {$action} on {$count} product(s)",
            ['product_ids' => $productIds, 'count' => $count]
        );

        return response()->json([
            'message' => $message,
            'count' => $count,
        ]);
    }

    /**
     * Send back-in-stock notifications for a product.
     */
    protected function sendStockNotifications(Product $product): void
    {
        // Get all pending notifications for this product
        $notifications = StockNotification::where('product_id', $product->id)
            ->pending()
            ->get();

        if ($notifications->isEmpty()) {
            return;
        }

        // Send email to each subscriber
        foreach ($notifications as $notification) {
            try {
                Mail::to($notification->email)->send(new BackInStockMail($product, $notification->email));
                $notification->markAsNotified();
            } catch (\Exception $e) {
                // Log error but don't fail the inventory update
                \Log::error("Failed to send back-in-stock notification", [
                    'product_id' => $product->id,
                    'email' => $notification->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Log activity
        ActivityLog::log(
            'stock_notifications_sent',
            'Product',
            $product->id,
            "Sent back-in-stock notifications for: {$product->name}",
            ['notification_count' => $notifications->count()]
        );
    }

    /**
     * Get related products for a specific product.
     * Includes manually set relations and automatic recommendations.
     */
    public function relatedProducts(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        // Get manually configured related products
        $manualRelated = $product->relatedProducts()
            ->where('active', true)
            ->with(['images', 'categories'])
            ->take(8)
            ->get();

        // If we have enough manual relations, return those
        if ($manualRelated->count() >= 4) {
            return response()->json($manualRelated);
        }

        // Otherwise, generate automatic recommendations
        $recommendedIds = $manualRelated->pluck('id')->toArray();
        $needed = 8 - $manualRelated->count();

        $automatic = $this->getAutomaticRecommendations($product, $recommendedIds, $needed);

        // Combine manual and automatic
        $combined = $manualRelated->concat($automatic);

        return response()->json($combined);
    }

    /**
     * Generate automatic product recommendations.
     */
    protected function getAutomaticRecommendations(Product $product, array $excludeIds, int $limit): \Illuminate\Database\Eloquent\Collection
    {
        $excludeIds[] = $product->id; // Don't recommend the product itself

        // Priority 1: Same categories
        $categoryIds = $product->categories->pluck('id');
        $sameCategoryProducts = Product::where('active', true)
            ->where('inventory', '>', 0)
            ->whereNotIn('id', $excludeIds)
            ->whereHas('categories', function ($query) use ($categoryIds) {
                $query->whereIn('product_categories.id', $categoryIds);
            })
            ->with(['images', 'categories'])
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        if ($sameCategoryProducts->count() >= $limit) {
            return $sameCategoryProducts;
        }

        // Priority 2: Similar price range (+/- 30%)
        $excludeIds = array_merge($excludeIds, $sameCategoryProducts->pluck('id')->toArray());
        $priceMin = $product->price * 0.7;
        $priceMax = $product->price * 1.3;
        $remaining = $limit - $sameCategoryProducts->count();

        $similarPriceProducts = Product::where('active', true)
            ->where('inventory', '>', 0)
            ->whereNotIn('id', $excludeIds)
            ->whereBetween('price', [$priceMin, $priceMax])
            ->with(['images', 'categories'])
            ->inRandomOrder()
            ->limit($remaining)
            ->get();

        $combined = $sameCategoryProducts->concat($similarPriceProducts);

        if ($combined->count() >= $limit) {
            return $combined;
        }

        // Priority 3: Featured products
        $excludeIds = array_merge($excludeIds, $similarPriceProducts->pluck('id')->toArray());
        $remaining = $limit - $combined->count();

        $featuredProducts = Product::where('active', true)
            ->where('inventory', '>', 0)
            ->where('featured', true)
            ->whereNotIn('id', $excludeIds)
            ->with(['images', 'categories'])
            ->inRandomOrder()
            ->limit($remaining)
            ->get();

        return $combined->concat($featuredProducts);
    }

    /**
     * Admin: Add related products to a product.
     */
    public function addRelatedProducts(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'related_product_ids' => 'required|array|min:1',
            'related_product_ids.*' => 'exists:products,id',
            'relation_type' => 'in:related,upsell,cross_sell,alternative',
        ]);

        $relationType = $validated['relation_type'] ?? 'related';
        $sortOrder = 0;

        foreach ($validated['related_product_ids'] as $relatedProductId) {
            // Don't allow self-relation
            if ($relatedProductId == $product->id) {
                continue;
            }

            // Check if relation already exists
            $exists = $product->relatedProducts()
                ->where('related_product_id', $relatedProductId)
                ->exists();

            if (!$exists) {
                $product->relatedProducts()->attach($relatedProductId, [
                    'relation_type' => $relationType,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        // Log activity
        ActivityLog::log(
            'related_products_added',
            'Product',
            $product->id,
            "Added related products to: {$product->name}",
            ['related_product_ids' => $validated['related_product_ids']]
        );

        return response()->json([
            'message' => 'Related products added successfully',
            'product' => $product->load('relatedProducts.images'),
        ]);
    }

    /**
     * Admin: Remove a related product.
     */
    public function removeRelatedProduct(string $id, string $relatedProductId): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->relatedProducts()->detach($relatedProductId);

        // Log activity
        ActivityLog::log(
            'related_product_removed',
            'Product',
            $product->id,
            "Removed related product from: {$product->name}",
            ['related_product_id' => $relatedProductId]
        );

        return response()->json([
            'message' => 'Related product removed successfully',
        ]);
    }

    /**
     * Admin: Update sort order of related products.
     */
    public function updateRelatedProductsOrder(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'related_products' => 'required|array',
            'related_products.*.id' => 'required|exists:products,id',
            'related_products.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['related_products'] as $relatedProduct) {
            $product->relatedProducts()->updateExistingPivot(
                $relatedProduct['id'],
                ['sort_order' => $relatedProduct['sort_order']]
            );
        }

        return response()->json([
            'message' => 'Sort order updated successfully',
        ]);
    }
}
