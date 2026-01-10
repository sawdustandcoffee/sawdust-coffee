<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StockNotificationController extends Controller
{
    /**
     * Subscribe to stock notifications for a product.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Check if product is actually out of stock
        $product = Product::findOrFail($validated['product_id']);
        if ($product->inventory > 0) {
            return response()->json([
                'message' => 'This product is currently in stock.',
            ], 400);
        }

        // Check if already subscribed
        $existing = StockNotification::where('product_id', $validated['product_id'])
            ->where('email', $validated['email'])
            ->whereNull('notified_at')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You are already subscribed to notifications for this product.',
            ], 200);
        }

        // Create or update notification subscription
        StockNotification::updateOrCreate(
            [
                'product_id' => $validated['product_id'],
                'email' => $validated['email'],
            ],
            [
                'notified_at' => null, // Reset notification status
            ]
        );

        return response()->json([
            'message' => 'You will be notified when this product is back in stock.',
        ], 201);
    }

    /**
     * Unsubscribe from stock notifications.
     */
    public function unsubscribe(Request $request, int $productId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $notification = StockNotification::where('product_id', $productId)
            ->where('email', $request->email)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Notification subscription not found.',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'message' => 'You have been unsubscribed from notifications for this product.',
        ]);
    }

    /**
     * Check if an email is subscribed to notifications for a product.
     */
    public function check(Request $request, int $productId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $isSubscribed = StockNotification::where('product_id', $productId)
            ->where('email', $request->email)
            ->whereNull('notified_at')
            ->exists();

        return response()->json([
            'is_subscribed' => $isSubscribed,
        ]);
    }

    /**
     * Admin: Get all stock notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockNotification::with('product')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->pending();
            } elseif ($request->status === 'notified') {
                $query->whereNotNull('notified_at');
            }
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->forProduct($request->product_id);
        }

        // Search by email
        if ($request->has('search') && $request->search) {
            $query->where('email', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->input('per_page', 20);
        $notifications = $query->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Admin: Delete a stock notification.
     */
    public function destroy(int $id): JsonResponse
    {
        $notification = StockNotification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Stock notification deleted successfully.',
        ]);
    }

    /**
     * Admin: Get statistics about stock notifications.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => StockNotification::count(),
            'pending' => StockNotification::pending()->count(),
            'notified' => StockNotification::whereNotNull('notified_at')->count(),
            'unique_products' => StockNotification::pending()->distinct('product_id')->count('product_id'),
        ];

        return response()->json($stats);
    }
}
