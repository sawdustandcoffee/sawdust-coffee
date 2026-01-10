<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products (Admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['categories', 'images', 'variants']);

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
        $product = Product::with(['categories', 'images', 'variants'])->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

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
        $product->delete();

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
        $product = Product::with(['categories', 'images', 'activeVariants'])
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return response()->json($product);
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

        return response()->json([
            'message' => $message,
            'count' => $count,
        ]);
    }
}
