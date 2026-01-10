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
            'image_path' => 'nullable|string|max:500',
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
            'image_path' => 'nullable|string|max:500',
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

    /**
     * Upload an image for a gallery item.
     */
    public function uploadImage(Request $request, string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        // Delete old image if it exists
        if ($item->image_path && \Storage::disk('public')->exists($item->image_path)) {
            \Storage::disk('public')->delete($item->image_path);
        }

        // Store the new image
        $path = $request->file('image')->store('gallery', 'public');

        // Update the gallery item
        $item->update(['image_path' => $path]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Delete the image for a gallery item.
     */
    public function deleteImage(string $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        if (!$item->image_path) {
            return response()->json([
                'message' => 'No image to delete',
            ], 400);
        }

        // Delete the image file
        if (\Storage::disk('public')->exists($item->image_path)) {
            \Storage::disk('public')->delete($item->image_path);
        }

        // Clear the image path
        $item->update(['image_path' => null]);

        return response()->json([
            'message' => 'Image deleted successfully',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Bulk upload gallery images.
     */
    public function bulkUpload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max each
            'category' => 'nullable|string|max:100',
            'featured' => 'nullable|boolean',
        ]);

        $uploaded = [];
        $errors = [];

        foreach ($request->file('images') as $index => $file) {
            try {
                // Store the image
                $path = $file->store('gallery', 'public');

                // Create gallery item
                $item = GalleryItem::create([
                    'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'description' => null,
                    'category' => $validated['category'] ?? null,
                    'image_path' => $path,
                    'featured' => $validated['featured'] ?? false,
                    'sort_order' => 0,
                ]);

                $uploaded[] = $item;
            } catch (\Exception $e) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => count($uploaded) . ' image(s) uploaded successfully',
            'uploaded' => $uploaded,
            'errors' => $errors,
            'total' => count($uploaded),
        ]);
    }
}
