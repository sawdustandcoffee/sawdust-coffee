<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductReviewController extends Controller
{
    /**
     * Get approved reviews for a product (public).
     */
    public function index(Request $request, string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $reviews = ProductReview::where('product_id', $productId)
            ->where('is_approved', true)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => $product->average_rating,
            'review_count' => $product->review_count,
        ]);
    }

    /**
     * Store a new review (requires authentication).
     */
    public function store(Request $request, string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $user = Auth::user();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        // Check if user has already reviewed this product
        $existingReview = ProductReview::where('product_id', $productId)
            ->where('user_id', $user?->id)
            ->where('reviewer_email', $user?->email ?? $request->ip())
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
            ], 422);
        }

        // Check if this is a verified purchase
        $isVerifiedPurchase = false;
        if ($user) {
            $isVerifiedPurchase = Order::where('customer_email', $user->email)
                ->where('paid_at', '!=', null)
                ->whereHas('items', function ($query) use ($productId) {
                    $query->where('product_id', $productId);
                })
                ->exists();
        }

        $review = ProductReview::create([
            'product_id' => $productId,
            'user_id' => $user?->id,
            'reviewer_name' => $user?->name ?? 'Guest',
            'reviewer_email' => $user?->email ?? $request->ip(),
            'rating' => $validated['rating'],
            'review_text' => $validated['review_text'],
            'is_verified_purchase' => $isVerifiedPurchase,
            'is_approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'message' => 'Thank you for your review! It will be published after approval.',
            'review' => $review,
        ], 201);
    }

    /**
     * Get all reviews for admin (includes unapproved).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ProductReview::with(['product:id,name', 'user:id,name']);

        // Filter by approval status
        if ($request->has('approved')) {
            $query->where('is_approved', $request->boolean('approved'));
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Update review (admin approval/rejection).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);

        $validated = $request->validate([
            'is_approved' => 'sometimes|boolean',
        ]);

        if (isset($validated['is_approved'])) {
            $review->is_approved = $validated['is_approved'];
            $review->approved_at = $validated['is_approved'] ? now() : null;
        }

        $review->save();

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review,
        ]);
    }

    /**
     * Delete review (admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }
}
