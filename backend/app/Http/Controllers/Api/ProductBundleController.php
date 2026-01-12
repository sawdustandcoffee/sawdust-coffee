<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductBundleController extends Controller
{
    /**
     * Get all active bundles for public display.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = ProductBundle::with(['products' => function ($query) {
            $query->with('primaryImage');
        }])
            ->where('active', true);

        // Filter by featured
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        // Sort
        $sortBy = $request->input('sort', 'ordered');
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('bundle_price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('bundle_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->ordered();
        }

        $bundles = $query->get();

        return response()->json($bundles);
    }

    /**
     * Get a single bundle by slug for public display.
     */
    public function publicShow(string $slug): JsonResponse
    {
        $bundle = ProductBundle::with(['products' => function ($query) {
            $query->with(['primaryImage', 'images', 'categories']);
        }])
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return response()->json($bundle);
    }

    /**
     * Get all bundles for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProductBundle::with(['products']);

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        // Filter by featured status
        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->input('sort', 'ordered');
        switch ($sortBy) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'price_low':
                $query->orderBy('bundle_price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('bundle_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->ordered();
        }

        $bundles = $query->paginate(15);

        return response()->json($bundles);
    }

    /**
     * Store a new bundle.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_bundles,slug',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'bundle_price' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'active' => 'boolean',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'required|array|min:2',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.sort_order' => 'integer',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $bundleData = collect($validated)->except('products')->toArray();
        $bundle = ProductBundle::create($bundleData);

        // Attach products with pivot data
        $products = collect($validated['products'])->mapWithKeys(function ($item) {
            return [$item['product_id'] => [
                'quantity' => $item['quantity'],
                'sort_order' => $item['sort_order'] ?? 0,
            ]];
        });

        $bundle->products()->attach($products);

        return response()->json($bundle->load('products'), 201);
    }

    /**
     * Get a single bundle by ID for admin.
     */
    public function show(int $id): JsonResponse
    {
        $bundle = ProductBundle::with(['products' => function ($query) {
            $query->with(['primaryImage', 'categories']);
        }])
            ->findOrFail($id);

        return response()->json($bundle);
    }

    /**
     * Update a bundle.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $bundle = ProductBundle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_bundles', 'slug')->ignore($bundle->id),
            ],
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'bundle_price' => 'sometimes|required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'active' => 'boolean',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'sometimes|array|min:2',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.sort_order' => 'integer',
        ]);

        // Update bundle data
        $bundleData = collect($validated)->except('products')->toArray();
        $bundle->update($bundleData);

        // Update products if provided
        if (isset($validated['products'])) {
            $products = collect($validated['products'])->mapWithKeys(function ($item) {
                return [$item['product_id'] => [
                    'quantity' => $item['quantity'],
                    'sort_order' => $item['sort_order'] ?? 0,
                ]];
            });

            $bundle->products()->sync($products);
        }

        return response()->json($bundle->load('products'));
    }

    /**
     * Delete a bundle.
     */
    public function destroy(int $id): JsonResponse
    {
        $bundle = ProductBundle::findOrFail($id);
        $bundle->delete();

        return response()->json(['message' => 'Bundle deleted successfully']);
    }
}
