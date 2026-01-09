<?php

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
Route::post('/login', function () {
    return response()->json(['message' => 'Login endpoint']);
});

Route::post('/register', function () {
    return response()->json(['message' => 'Register endpoint']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', function () {
        return response()->json(['message' => 'Logout endpoint']);
    });
});
