<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

// Public token validation endpoint (for internal service-to-service calls)
Route::get('/validate-token', function (Request $request) {
    $token = $request->bearerToken();
    if (!$token) {
        return response()->json(['error' => 'No token provided'], 401);
    }

    try {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role ?? 'USER',
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Invalid token'], 401);
    }
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
});

Route::get('/up', function () {
    return response()->json(['status' => 'user-service-ok']);
});
