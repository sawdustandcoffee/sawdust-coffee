<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    /**
     * Get product recommendations based on a specific product.
     */
    public function forProduct(int $productId): JsonResponse
    {
        $product = Product::with(['categories', 'tags'])->findOrFail($productId);

        // Get frequently bought together (products purchased in same orders)
        $frequentlyBoughtTogether = $this->getFrequentlyBoughtTogether($productId);

        // Get similar products (same categories/tags)
        $similarProducts = $this->getSimilarProducts($product);

        return response()->json([
            'frequently_bought_together' => $frequentlyBoughtTogether,
            'similar_products' => $similarProducts,
        ]);
    }

    /**
     * Get personalized recommendations for cart page.
     */
    public function forCart(Request $request): JsonResponse
    {
        $cartProductIds = $request->input('product_ids', []);

        if (empty($cartProductIds)) {
            return response()->json([]);
        }

        // Get products frequently bought with items in cart
        $recommendations = OrderItem::select('order_items.product_id', DB::raw('COUNT(*) as frequency'))
            ->join('order_items as oi2', 'order_items.order_id', '=', 'oi2.order_id')
            ->whereIn('oi2.product_id', $cartProductIds)
            ->whereNotIn('order_items.product_id', $cartProductIds)
            ->groupBy('order_items.product_id')
            ->orderByDesc('frequency')
            ->limit(8)
            ->get()
            ->pluck('product_id');

        $products = Product::with(['primaryImage', 'categories'])
            ->whereIn('id', $recommendations)
            ->where('active', true)
            ->where('inventory', '>', 0)
            ->get();

        return response()->json($products);
    }

    /**
     * Get personalized recommendations based on browsing history.
     */
    public function personalized(Request $request): JsonResponse
    {
        $viewedProductIds = $request->input('viewed_product_ids', []);

        if (empty($viewedProductIds)) {
            // If no history, return featured products
            return response()->json(
                Product::with(['primaryImage', 'categories'])
                    ->where('active', true)
                    ->where('featured', true)
                    ->where('inventory', '>', 0)
                    ->limit(8)
                    ->get()
            );
        }

        // Get categories and tags from viewed products
        $viewedProducts = Product::with(['categories', 'tags'])
            ->whereIn('id', $viewedProductIds)
            ->get();

        $categoryIds = $viewedProducts->pluck('categories.*.id')->flatten()->unique();
        $tagIds = $viewedProducts->pluck('tags.*.id')->flatten()->unique();

        // Find similar products
        $recommendations = Product::with(['primaryImage', 'categories'])
            ->where('active', true)
            ->where('inventory', '>', 0)
            ->whereNotIn('id', $viewedProductIds)
            ->where(function ($query) use ($categoryIds, $tagIds) {
                if ($categoryIds->isNotEmpty()) {
                    $query->whereHas('categories', function ($q) use ($categoryIds) {
                        $q->whereIn('product_categories.id', $categoryIds);
                    });
                }
                if ($tagIds->isNotEmpty()) {
                    $query->orWhereHas('tags', function ($q) use ($tagIds) {
                        $q->whereIn('product_tags.id', $tagIds);
                    });
                }
            })
            ->limit(8)
            ->get();

        return response()->json($recommendations);
    }

    /**
     * Get products frequently bought together with the given product.
     */
    private function getFrequentlyBoughtTogether(int $productId): array
    {
        $frequentlyBought = OrderItem::select('order_items.product_id', DB::raw('COUNT(*) as frequency'))
            ->join('order_items as oi2', 'order_items.order_id', '=', 'oi2.order_id')
            ->where('oi2.product_id', $productId)
            ->where('order_items.product_id', '!=', $productId)
            ->groupBy('order_items.product_id')
            ->orderByDesc('frequency')
            ->limit(4)
            ->get()
            ->pluck('product_id');

        if ($frequentlyBought->isEmpty()) {
            return [];
        }

        return Product::with(['primaryImage', 'categories'])
            ->whereIn('id', $frequentlyBought)
            ->where('active', true)
            ->where('inventory', '>', 0)
            ->get()
            ->toArray();
    }

    /**
     * Get similar products based on categories and tags.
     */
    private function getSimilarProducts(Product $product): array
    {
        $categoryIds = $product->categories->pluck('id');
        $tagIds = $product->tags->pluck('id');

        $query = Product::with(['primaryImage', 'categories'])
            ->where('active', true)
            ->where('inventory', '>', 0)
            ->where('id', '!=', $product->id);

        // Score products based on matching categories and tags
        $query->select('products.*')
            ->selectRaw('
                (SELECT COUNT(*) FROM product_category
                 WHERE product_category.product_id = products.id
                 AND product_category.product_category_id IN (?)) as category_matches
            ', [$categoryIds->isEmpty() ? [0] : $categoryIds->toArray()])
            ->selectRaw('
                (SELECT COUNT(*) FROM product_product_tag
                 WHERE product_product_tag.product_id = products.id
                 AND product_product_tag.product_tag_id IN (?)) as tag_matches
            ', [$tagIds->isEmpty() ? [0] : $tagIds->toArray()])
            ->having(DB::raw('category_matches + tag_matches'), '>', 0)
            ->orderByDesc(DB::raw('category_matches + tag_matches'))
            ->limit(6);

        return $query->get()->toArray();
    }
}
