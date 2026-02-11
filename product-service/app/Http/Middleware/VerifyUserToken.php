<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyUserToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Authorization token missing'], 401);
        }

        try {
            $userService = getenv('USER_SERVICE_URL') ?: env('USER_SERVICE_URL', 'http://localhost:8001');
            $response = Http::timeout(5)->acceptJson()->withToken($token)
                ->get($userService . '/api/validate-token');

            if ($response->failed()) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            // Merge user into request
            $request->merge(['user' => $response->json('user')]);
        } catch (\Exception $e) {
            \Log::error('User service validation call failed: ' . $e->getMessage());
            return response()->json(['error' => 'User service unreachable'], 503);
        }

        return $next($request);
    }
}
