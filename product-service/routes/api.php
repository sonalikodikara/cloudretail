<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

// Public
Route::post('/login', [ProductController::class, 'login']);

// Protected by USER SERVICE
Route::middleware(['auth.user'])->group(function () {

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);

    // Internal service-to-service
    Route::post('/inventory/update', [ProductController::class, 'updateStock']);
});
