<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Step 1: Validate incoming request
        $request->validate([
            'product_id' => 'required|integer',
            'quantity'   => 'required|integer|min:1',
        ]);

        // Step 2: Verify token exists
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'Authorization required'], 401);
        }

        // Step 3: Call Product Service to reduce stock
        try {
            $productServiceUrl = env('PRODUCT_SERVICE_URL', 'http://localhost:8002');
            $response = Http::timeout(5)->withToken($token)
                ->post($productServiceUrl . '/api/inventory/update', [
                    'product_id' => $request->product_id,
                    'quantity'   => $request->quantity,
                ]);

            // Step 4: If Product Service fails → STOP transaction
            if ($response->failed()) {
                return response()->json([
                    'message' => 'Order failed. Insufficient stock or product service error.'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Product service call failed: ' . $e->getMessage());
            return response()->json(['error' => 'Product service unavailable'], 503);
        }

        // Step 5: Create order with user_id from authenticated user
        $user = $request->get('user');
        if (!$user || !isset($user['id'])) {
            return response()->json(['error' => 'User information not available'], 401);
        }

        $order = Order::create([
            'user_id'    => $user['id'],
            'product_id' => $request->product_id,
            'quantity'   => $request->quantity,
            'status'     => 'PLACED',
        ]);

        // Notify Notification Service asynchronously, but don't fail if it's unavailable
        try {
            $notificationServiceUrl = env('NOTIFICATION_SERVICE_URL', 'http://localhost:8004');
            Http::timeout(5)->post($notificationServiceUrl . '/api/notify', [
                'order_id' => $order->id,
                'status'   => $order->status,
            ]);
        } catch (\Exception $e) {
            // Log but don't fail the order creation
            \Log::warning('Notification service call failed: ' . $e->getMessage());
        }

        return response()->json($order, 201);
    }

    // Admin: Update order status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:CREATED,CONFIRMED,SHIPPED,DELIVERED,CANCELLED'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json($order);
    }

    // Customer/Admin: View order
    public function show($id)
    {
        $order = Order::findOrFail($id);
        return response()->json($order);
    }
}