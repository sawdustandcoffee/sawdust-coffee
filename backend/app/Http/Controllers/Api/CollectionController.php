<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CollectionController extends Controller
{
    /**
     * Get all active collections for public display.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Collection::where('active', true);

        // Filter by featured
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $collections = $query->ordered()->get();

        return response()->json($collections);
    }

    /**
     * Get a single collection by slug for public display.
     */
    public function publicShow(string $slug): JsonResponse
    {
        $collection = Collection::where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        // Load products based on collection type
        if ($collection->type === 'manual') {
            $collection->load(['products' => function ($query) {
                $query->with(['primaryImage', 'categories', 'tags']);
            }]);
        } else {
            // For auto collections, get products dynamically
            $products = $collection->products;
            $collection->setRelation('products', $products);
        }

        return response()->json($collection);
    }

    /**
     * Get all collections for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Collection::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $collections = $query->ordered()->paginate(15);

        return response()->json($collections);
    }

    /**
     * Store a new collection.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:collections,slug',
            'description' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'type' => 'required|in:manual,auto_new,auto_featured,auto_sale',
            'active' => 'boolean',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.sort_order' => 'integer',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $collectionData = collect($validated)->except('products')->toArray();
        $collection = Collection::create($collectionData);

        // Attach products if manual collection
        if ($collection->type === 'manual' && isset($validated['products'])) {
            $products = collect($validated['products'])->mapWithKeys(function ($item) {
                return [$item['product_id'] => [
                    'sort_order' => $item['sort_order'] ?? 0,
                ]];
            });

            $collection->products()->attach($products);
        }

        return response()->json($collection->load('products'), 201);
    }

    /**
     * Get a single collection by ID for admin.
     */
    public function show(int $id): JsonResponse
    {
        $collection = Collection::with(['products' => function ($query) {
            $query->with(['primaryImage', 'categories']);
        }])
            ->findOrFail($id);

        return response()->json($collection);
    }

    /**
     * Update a collection.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $collection = Collection::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('collections', 'slug')->ignore($collection->id),
            ],
            'description' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'type' => 'sometimes|required|in:manual,auto_new,auto_featured,auto_sale',
            'active' => 'boolean',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.sort_order' => 'integer',
        ]);

        // Update collection data
        $collectionData = collect($validated)->except('products')->toArray();
        $collection->update($collectionData);

        // Update products if manual collection and products provided
        if ($collection->type === 'manual' && isset($validated['products'])) {
            $products = collect($validated['products'])->mapWithKeys(function ($item) {
                return [$item['product_id'] => [
                    'sort_order' => $item['sort_order'] ?? 0,
                ]];
            });

            $collection->products()->sync($products);
        }

        return response()->json($collection->load('products'));
    }

    /**
     * Delete a collection.
     */
    public function destroy(int $id): JsonResponse
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
