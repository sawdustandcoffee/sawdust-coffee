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

        // Product image management
        Route::post('/products/{id}/images', [\App\Http\Controllers\Api\ProductController::class, 'uploadImage']);
        Route::put('/products/{productId}/images/{imageId}', [\App\Http\Controllers\Api\ProductController::class, 'updateImage']);
        Route::delete('/products/{productId}/images/{imageId}', [\App\Http\Controllers\Api\ProductController::class, 'deleteImage']);

        Route::apiResource('categories', \App\Http\Controllers\Api\ProductCategoryController::class);
        Route::apiResource('gallery', \App\Http\Controllers\Api\GalleryItemController::class);
        Route::post('/gallery/{id}/upload-image', [\App\Http\Controllers\Api\GalleryItemController::class, 'uploadImage']);
        Route::delete('/gallery/{id}/delete-image', [\App\Http\Controllers\Api\GalleryItemController::class, 'deleteImage']);
        Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class)->only(['index', 'show', 'update']);
        Route::get('/orders-export/csv', [\App\Http\Controllers\Api\OrderController::class, 'exportCsv']);

        Route::apiResource('quotes', \App\Http\Controllers\Api\QuoteRequestController::class);
        Route::get('/quotes-export/csv', [\App\Http\Controllers\Api\QuoteRequestController::class, 'exportCsv']);

        Route::apiResource('content', \App\Http\Controllers\Api\SiteContentController::class);

        Route::apiResource('contact-submissions', \App\Http\Controllers\Api\ContactFormController::class)->except(['store']);
        Route::get('/contact-submissions-export/csv', [\App\Http\Controllers\Api\ContactFormController::class, 'exportCsv']);

        // Stats endpoints
        Route::get('/stats/orders', [\App\Http\Controllers\Api\OrderController::class, 'stats']);
        Route::get('/stats/quotes', [\App\Http\Controllers\Api\QuoteRequestController::class, 'stats']);
        Route::get('/stats/contact', [\App\Http\Controllers\Api\ContactFormController::class, 'stats']);

        // Activity logs
        Route::get('/activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);

        // Additional routes
        Route::get('/gallery/categories', [\App\Http\Controllers\Api\GalleryItemController::class, 'categories']);
        Route::get('/content/group/{group}', [\App\Http\Controllers\Api\SiteContentController::class, 'publicGroup']);
    });
});

// Public API routes (no auth required)
Route::prefix('public')->group(function () {
    // Read operations - higher rate limit
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'publicIndex']);
        Route::get('/products/{slug}', [\App\Http\Controllers\Api\ProductController::class, 'publicShow']);
        Route::get('/categories', [\App\Http\Controllers\Api\ProductCategoryController::class, 'publicIndex']);
        Route::get('/gallery', [\App\Http\Controllers\Api\GalleryItemController::class, 'publicIndex']);
        Route::get('/content', [\App\Http\Controllers\Api\SiteContentController::class, 'publicIndex']);
    });

    // Write operations - stricter rate limit
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/contact', [\App\Http\Controllers\Api\ContactFormController::class, 'store']);
        Route::post('/quotes', [\App\Http\Controllers\Api\QuoteRequestController::class, 'store']);
        Route::post('/checkout', [\App\Http\Controllers\StripeCheckoutController::class, 'createCheckoutSession']);
    });
});

// Stripe webhook (no CSRF protection needed)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handleWebhook']);
