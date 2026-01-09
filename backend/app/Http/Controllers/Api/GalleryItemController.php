<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryItemController extends Controller
{
    /**
     * Display a listing of gallery items (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::query();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->input('per_page', 20);
        $items = $query->paginate($perPage);

        return response()->json($items);
    }

    /**
     * Store a newly created gallery item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'image_path' => 'required|string|max:500',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $item = GalleryItem::create($validated);

        return response()->json([
            'message' => 'Gallery item created successfully',
            'item' => $item,
        ], 201);
    }

    /**
     * Display the specified gallery item.
     */
    public function show(string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        return response()->json($item);
    }

    /**
     * Update the specified gallery item.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'image_path' => 'sometimes|required|string|max:500',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Gallery item updated successfully',
            'item' => $item,
        ]);
    }

    /**
     * Remove the specified gallery item.
     */
    public function destroy(string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);
        $item->delete();

        return response()->json([
            'message' => 'Gallery item deleted successfully',
        ]);
    }

    /**
     * Display a listing of gallery items for public use.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = GalleryItem::query();

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by featured
        if ($request->boolean('featured_only')) {
            $query->where('featured', true);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir)
            ->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 20);
        $items = $query->paginate($perPage);

        return response()->json($items);
    }

    /**
     * Get unique categories from gallery items.
     */
    public function categories(): JsonResponse
    {
        $categories = GalleryItem::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }
}
