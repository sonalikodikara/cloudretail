<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Middleware\VerifyUserToken;

// Public login
Route::post('/login', [ProductController::class, 'login']);

// Protected routes via VerifyUserToken middleware
Route::middleware([VerifyUserToken::class])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Internal service-to-service route
    Route::post('/inventory/update', [ProductController::class, 'updateStock']);
});
