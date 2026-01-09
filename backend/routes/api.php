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

    // Products (Admin)
    Route::prefix('admin')->group(function () {
        Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);
        Route::apiResource('categories', \App\Http\Controllers\Api\ProductCategoryController::class);
        Route::apiResource('gallery', \App\Http\Controllers\Api\GalleryItemController::class);
        Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class)->only(['index', 'show', 'update']);
        Route::apiResource('quotes', \App\Http\Controllers\Api\QuoteRequestController::class);
        Route::apiResource('content', \App\Http\Controllers\Api\SiteContentController::class);
    });
});

// Public API routes (no auth required)
Route::prefix('public')->group(function () {
    Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'publicIndex']);
    Route::get('/products/{slug}', [\App\Http\Controllers\Api\ProductController::class, 'publicShow']);
    Route::get('/categories', [\App\Http\Controllers\Api\ProductCategoryController::class, 'publicIndex']);
    Route::get('/gallery', [\App\Http\Controllers\Api\GalleryItemController::class, 'publicIndex']);
    Route::get('/content', [\App\Http\Controllers\Api\SiteContentController::class, 'publicIndex']);
    Route::post('/contact', [\App\Http\Controllers\Api\ContactFormController::class, 'store']);
    Route::post('/quotes', [\App\Http\Controllers\Api\QuoteRequestController::class, 'store']);
});
