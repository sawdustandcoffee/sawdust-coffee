<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductTagController extends Controller
{
    /**
     * Get all active tags for public display.
     */
    public function publicIndex(): JsonResponse
    {
        $tags = ProductTag::active()
            ->ordered()
            ->withCount('products')
            ->get();

        return response()->json($tags);
    }

    /**
     * Get all tags (admin).
     */
    public function index(): JsonResponse
    {
        $tags = ProductTag::withCount('products')
            ->ordered()
            ->get();

        return response()->json($tags);
    }

    /**
     * Store a new tag.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_tags,name',
            'slug' => 'nullable|string|max:255|unique:product_tags,slug',
            'color' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $tag = ProductTag::create($validated);

        return response()->json($tag, 201);
    }

    /**
     * Update a tag.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tag = ProductTag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:product_tags,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:product_tags,slug,' . $id,
            'color' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $tag->update($validated);

        return response()->json($tag);
    }

    /**
     * Delete a tag.
     */
    public function destroy(string $id): JsonResponse
    {
        $tag = ProductTag::findOrFail($id);
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
