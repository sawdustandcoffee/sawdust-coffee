<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Get the authenticated user's wishlist.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $wishlistItems = WishlistItem::where('user_id', $user->id)
            ->with('product.images')
            ->latest()
            ->get();

        return response()->json($wishlistItems);
    }

    /**
     * Add a product to the wishlist.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        // Check if already in wishlist
        $existing = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Product is already in your wishlist.',
                'wishlist_item' => $existing,
            ], 200);
        }

        // Add to wishlist
        $wishlistItem = WishlistItem::create([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        $wishlistItem->load('product.images');

        return response()->json([
            'message' => 'Product added to wishlist.',
            'wishlist_item' => $wishlistItem,
        ], 201);
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy(Request $request, string $productId): JsonResponse
    {
        $user = Auth::user();

        $wishlistItem = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if (!$wishlistItem) {
            return response()->json([
                'message' => 'Product not found in wishlist.',
            ], 404);
        }

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Product removed from wishlist.',
        ]);
    }

    /**
     * Check if a product is in the user's wishlist.
     */
    public function check(Request $request, string $productId): JsonResponse
    {
        $user = Auth::user();

        $inWishlist = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'in_wishlist' => $inWishlist,
        ]);
    }
}
