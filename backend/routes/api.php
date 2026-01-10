<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);
        Route::get('/dashboard/revenue-chart', [\App\Http\Controllers\Api\DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/order-status-chart', [\App\Http\Controllers\Api\DashboardController::class, 'orderStatusChart']);
        Route::get('/dashboard/product-category-chart', [\App\Http\Controllers\Api\DashboardController::class, 'productCategoryChart']);

        Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);

        // Product bulk actions
        Route::post('/products/bulk-action', [\App\Http\Controllers\Api\ProductController::class, 'bulkAction']);

        // Product inventory management
        Route::post('/products/{id}/adjust-inventory', [\App\Http\Controllers\Api\ProductController::class, 'adjustInventory']);

        // Product image management
        Route::post('/products/{id}/images', [\App\Http\Controllers\Api\ProductController::class, 'uploadImage']);
        Route::put('/products/{productId}/images/{imageId}', [\App\Http\Controllers\Api\ProductController::class, 'updateImage']);
        Route::delete('/products/{productId}/images/{imageId}', [\App\Http\Controllers\Api\ProductController::class, 'deleteImage']);

        Route::apiResource('categories', \App\Http\Controllers\Api\ProductCategoryController::class);
        Route::apiResource('gallery', \App\Http\Controllers\Api\GalleryItemController::class);
        Route::post('/gallery/{id}/upload-image', [\App\Http\Controllers\Api\GalleryItemController::class, 'uploadImage']);
        Route::delete('/gallery/{id}/delete-image', [\App\Http\Controllers\Api\GalleryItemController::class, 'deleteImage']);
        Route::post('/gallery/bulk-upload', [\App\Http\Controllers\Api\GalleryItemController::class, 'bulkUpload']);
        Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class)->only(['index', 'show', 'update']);
        Route::get('/orders-export/csv', [\App\Http\Controllers\Api\OrderController::class, 'exportCsv']);

        Route::apiResource('quotes', \App\Http\Controllers\Api\QuoteRequestController::class);
        Route::get('/quotes-export/csv', [\App\Http\Controllers\Api\QuoteRequestController::class, 'exportCsv']);

        Route::apiResource('content', \App\Http\Controllers\Api\SiteContentController::class);

        Route::apiResource('contact-submissions', \App\Http\Controllers\Api\ContactFormController::class)->except(['store']);
        Route::get('/contact-submissions-export/csv', [\App\Http\Controllers\Api\ContactFormController::class, 'exportCsv']);

        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

        // Product reviews
        Route::get('/reviews', [\App\Http\Controllers\Api\ProductReviewController::class, 'adminIndex']);
        Route::put('/reviews/{id}', [\App\Http\Controllers\Api\ProductReviewController::class, 'update']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\ProductReviewController::class, 'destroy']);

        // Discount codes
        Route::apiResource('discount-codes', \App\Http\Controllers\Api\DiscountCodeController::class);

        // Newsletter subscribers
        Route::get('/newsletter-subscribers', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'index']);
        Route::delete('/newsletter-subscribers/{id}', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'destroy']);
        Route::get('/newsletter-subscribers-export/csv', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'exportCsv']);

        // Stats endpoints
        Route::get('/stats/orders', [\App\Http\Controllers\Api\OrderController::class, 'stats']);
        Route::get('/stats/quotes', [\App\Http\Controllers\Api\QuoteRequestController::class, 'stats']);
        Route::get('/stats/contact', [\App\Http\Controllers\Api\ContactFormController::class, 'stats']);

        // Activity logs
        Route::get('/activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);

        // Email preview/testing
        Route::get('/email-templates', [\App\Http\Controllers\Api\EmailPreviewController::class, 'index']);
        Route::get('/email-templates/{template}/preview', [\App\Http\Controllers\Api\EmailPreviewController::class, 'preview']);
        Route::post('/email-templates/{template}/send-test', [\App\Http\Controllers\Api\EmailPreviewController::class, 'sendTest']);

        // Analytics
        Route::get('/analytics/sales', [\App\Http\Controllers\Api\AnalyticsController::class, 'sales']);
        Route::get('/analytics/products', [\App\Http\Controllers\Api\AnalyticsController::class, 'products']);
        Route::get('/analytics/engagement', [\App\Http\Controllers\Api\AnalyticsController::class, 'engagement']);
        Route::get('/analytics/summary', [\App\Http\Controllers\Api\AnalyticsController::class, 'summary']);

        // Additional routes
        Route::get('/gallery/categories', [\App\Http\Controllers\Api\GalleryItemController::class, 'categories']);
        Route::get('/content/group/{group}', [\App\Http\Controllers\Api\SiteContentController::class, 'publicGroup']);
    });
});

// Customer authentication routes
Route::prefix('customer')->middleware('throttle:10,1')->group(function () {
    Route::post('/register', [\App\Http\Controllers\Api\CustomerAuthController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\CustomerAuthController::class, 'login']);
    Route::post('/logout', [\App\Http\Controllers\Api\CustomerAuthController::class, 'logout']);
    Route::get('/user', [\App\Http\Controllers\Api\CustomerAuthController::class, 'user']);
    Route::post('/forgot-password', [\App\Http\Controllers\Api\CustomerAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\CustomerAuthController::class, 'resetPassword']);

    // Protected customer routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::put('/profile', [\App\Http\Controllers\Api\CustomerAuthController::class, 'updateProfile']);
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'customerOrders']);
        Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'customerOrderDetail']);
        Route::post('/products/{productId}/reviews', [\App\Http\Controllers\Api\ProductReviewController::class, 'store']);
    });
});

// Public API routes (no auth required)
Route::prefix('public')->group(function () {
    // Read operations - higher rate limit
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'publicIndex']);
        Route::get('/products/{slug}', [\App\Http\Controllers\Api\ProductController::class, 'publicShow']);
        Route::get('/products/{productId}/reviews', [\App\Http\Controllers\Api\ProductReviewController::class, 'index']);
        Route::get('/categories', [\App\Http\Controllers\Api\ProductCategoryController::class, 'publicIndex']);
        Route::get('/gallery', [\App\Http\Controllers\Api\GalleryItemController::class, 'publicIndex']);
        Route::get('/content', [\App\Http\Controllers\Api\SiteContentController::class, 'publicIndex']);
    });

    // Write operations - stricter rate limit
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/contact', [\App\Http\Controllers\Api\ContactFormController::class, 'store']);
        Route::post('/quotes', [\App\Http\Controllers\Api\QuoteRequestController::class, 'store']);
        Route::post('/checkout', [\App\Http\Controllers\StripeCheckoutController::class, 'createCheckoutSession']);
        Route::post('/validate-discount', [\App\Http\Controllers\Api\DiscountCodeController::class, 'validate']);
        Route::post('/newsletter/subscribe', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'subscribe']);
    });

    // Newsletter confirmation and unsubscribe (no rate limit needed, token-based)
    Route::get('/newsletter/confirm/{token}', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'confirm']);
    Route::get('/newsletter/unsubscribe/{token}', [\App\Http\Controllers\Api\NewsletterSubscriberController::class, 'unsubscribe']);
});

// Stripe webhook (no CSRF protection needed)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handleWebhook']);
