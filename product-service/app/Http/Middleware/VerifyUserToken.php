<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;

class VerifyUserToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Authorization token missing'], 401);
        }

        // Call user-service to validate token (use env to allow configuring host/port)
        try {
            $userService = env('USER_SERVICE_URL', 'http://localhost:8001');
            $response = Http::withToken($token)
                ->get($userService . '/api/validate-token'); // user-service validate endpoint

            if ($response->failed()) {
                // If user-service returns 401/403, propagate as unauthorized
                return response()->json(['error' => 'Invalid token'], 401);
            }

            // Optionally, set user info in request for controllers
            $request->merge(['user' => $response->json('user')]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User service unreachable'], 503);
        }

        return $next($request);
    }
}
