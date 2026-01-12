<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Autocomplete search suggestions.
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // Search products
        $products = Product::where('active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'slug', 'price', 'sale_price')
            ->with('primaryImage')
            ->limit(5)
            ->get();

        // Search categories
        $categories = ProductCategory::where('active', true)
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'slug')
            ->limit(3)
            ->get();

        // Search tags
        $tags = ProductTag::where('active', true)
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'slug')
            ->limit(3)
            ->get();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    /**
     * Full search with faceted filtering.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 24);

        $productsQuery = Product::with(['primaryImage', 'categories', 'tags'])
            ->where('active', true);

        // Full-text search
        if (!empty($query)) {
            $productsQuery->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('long_description', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%");
            });
        }

        // Category filter
        if ($request->has('categories')) {
            $categoryIds = explode(',', $request->input('categories'));
            $productsQuery->whereHas('categories', function ($q) use ($categoryIds) {
                $q->whereIn('product_categories.id', $categoryIds);
            });
        }

        // Tag filter
        if ($request->has('tags')) {
            $tagIds = explode(',', $request->input('tags'));
            $productsQuery->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('product_tags.id', $tagIds);
            });
        }

        // Price range filter
        if ($request->has('price_min')) {
            $productsQuery->where('price', '>=', $request->input('price_min'));
        }
        if ($request->has('price_max')) {
            $productsQuery->where('price', '<=', $request->input('price_max'));
        }

        // In stock filter
        if ($request->boolean('in_stock')) {
            $productsQuery->where('inventory', '>', 0);
        }

        // On sale filter
        if ($request->boolean('on_sale')) {
            $productsQuery->whereNotNull('sale_price');
        }

        // Featured filter
        if ($request->boolean('featured')) {
            $productsQuery->where('featured', true);
        }

        // Sorting
        $sortBy = $request->input('sort', 'relevance');
        switch ($sortBy) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'newest':
                $productsQuery->orderBy('created_at', 'desc');
                break;
            case 'name':
                $productsQuery->orderBy('name', 'asc');
                break;
            default:
                // Relevance sorting (products with query in name first)
                if (!empty($query)) {
                    $productsQuery->orderByRaw("CASE WHEN name LIKE ? THEN 1 ELSE 2 END", ["%{$query}%"]);
                }
                $productsQuery->orderBy('featured', 'desc')
                    ->orderBy('created_at', 'desc');
        }

        $products = $productsQuery->paginate($perPage, ['*'], 'page', $page);

        // Get facets for filtering
        $facets = $this->getFacets($query);

        return response()->json([
            'products' => $products,
            'facets' => $facets,
            'query' => $query,
        ]);
    }

    /**
     * Get search facets (available filters).
     */
    private function getFacets(string $query): array
    {
        // Get active categories with product count
        $categories = ProductCategory::where('active', true)
            ->withCount(['products' => function ($q) use ($query) {
                $q->where('active', true);
                if (!empty($query)) {
                    $q->where(function ($subQ) use ($query) {
                        $subQ->where('name', 'like', "%{$query}%")
                            ->orWhere('description', 'like', "%{$query}%");
                    });
                }
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // Get active tags with product count
        $tags = ProductTag::where('active', true)
            ->withCount(['products' => function ($q) use ($query) {
                $q->where('active', true);
                if (!empty($query)) {
                    $q->where(function ($subQ) use ($query) {
                        $subQ->where('name', 'like', "%{$query}%")
                            ->orWhere('description', 'like', "%{$query}%");
                    });
                }
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'color']);

        // Get price range
        $priceStats = Product::where('active', true)
            ->when(!empty($query), function ($q) use ($query) {
                $q->where(function ($subQ) use ($query) {
                    $subQ->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return [
            'categories' => $categories,
            'tags' => $tags,
            'price_range' => [
                'min' => $priceStats ? floor($priceStats->min_price) : 0,
                'max' => $priceStats ? ceil($priceStats->max_price) : 1000,
            ],
        ];
    }

    /**
     * Get popular searches.
     */
    public function popularSearches(): JsonResponse
    {
        // This would typically come from a search_logs table
        // For now, return some example popular searches
        $popularSearches = [
            'coffee table',
            'live edge',
            'cutting board',
            'custom sign',
            'desk',
        ];

        return response()->json($popularSearches);
    }
}
