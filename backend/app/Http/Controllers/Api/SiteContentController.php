<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    /**
     * Display a listing of site content (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = SiteContent::query();

        // Filter by group
        if ($group = $request->input('group')) {
            $query->where('group', $group);
        }

        // Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('value', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'group');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir)
            ->orderBy('key', 'asc');

        $perPage = $request->input('per_page', 100);
        $content = $query->paginate($perPage);

        return response()->json($content);
    }

    /**
     * Store a newly created site content item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:site_content,key',
            'value' => 'required',
            'type' => 'required|in:text,html,json,boolean,integer,float',
            'group' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        // Handle JSON type
        if ($validated['type'] === 'json' && is_array($validated['value'])) {
            $validated['value'] = json_encode($validated['value']);
        }

        $content = SiteContent::create($validated);

        return response()->json([
            'message' => 'Content created successfully',
            'content' => $content,
        ], 201);
    }

    /**
     * Display the specified site content item.
     */
    public function show(string $id): JsonResponse
    {
        $content = SiteContent::findOrFail($id);

        // Decode JSON values for easier frontend handling
        if ($content->type === 'json') {
            $content->decoded_value = json_decode($content->value, true);
        }

        return response()->json($content);
    }

    /**
     * Update the specified site content item.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $content = SiteContent::findOrFail($id);

        $validated = $request->validate([
            'value' => 'sometimes|required',
            'type' => 'sometimes|required|in:text,html,json,boolean,integer,float',
            'group' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        // Handle JSON type
        if (isset($validated['type']) && $validated['type'] === 'json' && is_array($validated['value'])) {
            $validated['value'] = json_encode($validated['value']);
        } elseif ($content->type === 'json' && isset($validated['value']) && is_array($validated['value'])) {
            $validated['value'] = json_encode($validated['value']);
        }

        $content->update($validated);

        return response()->json([
            'message' => 'Content updated successfully',
            'content' => $content,
        ]);
    }

    /**
     * Remove the specified site content item.
     */
    public function destroy(string $id): JsonResponse
    {
        $content = SiteContent::findOrFail($id);
        $content->delete();

        return response()->json([
            'message' => 'Content deleted successfully',
        ]);
    }

    /**
     * Get all site content for public use (grouped by key).
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $content = SiteContent::all();

        // Convert to key-value pairs for easier frontend access
        $contentMap = [];
        foreach ($content as $item) {
            $value = $item->value;

            // Decode based on type
            switch ($item->type) {
                case 'json':
                    $value = json_decode($item->value, true);
                    break;
                case 'boolean':
                    $value = (bool) $item->value;
                    break;
                case 'integer':
                    $value = (int) $item->value;
                    break;
                case 'float':
                    $value = (float) $item->value;
                    break;
            }

            $contentMap[$item->key] = $value;
        }

        return response()->json($contentMap);
    }

    /**
     * Get content by group (public).
     */
    public function publicGroup(string $group): JsonResponse
    {
        $content = SiteContent::where('group', $group)->get();

        $contentMap = [];
        foreach ($content as $item) {
            $value = $item->value;

            // Decode based on type
            switch ($item->type) {
                case 'json':
                    $value = json_decode($item->value, true);
                    break;
                case 'boolean':
                    $value = (bool) $item->value;
                    break;
                case 'integer':
                    $value = (int) $item->value;
                    break;
                case 'float':
                    $value = (float) $item->value;
                    break;
            }

            $contentMap[$item->key] = $value;
        }

        return response()->json($contentMap);
    }
}
