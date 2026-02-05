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

        // Step 2: Call Product Service to reduce stock
        $response = Http::withToken($request->bearerToken())
            ->post('http://api-gateway:3000/api/products/inventory/update', [
                'product_id' => $request->product_id,
                'quantity'   => $request->quantity,
            ]);

        // Step 3: If Product Service fails → STOP transaction
        if ($response->failed()) {
            return response()->json([
                'message' => 'Order failed. Insufficient stock or product service error.'
            ], 400);
        }
            

        // stock update succeeds
        $order = Order::create([
            'product_id' => $request->product_id,
            'quantity'   => $request->quantity,
            'status'     => 'PLACED',
        ]);

        // Notify Notification Service        
        Http::post('http://notification-service:8004/api/notify', [
            'order_id' => $order->id,
            'status'   => $order->status,
        ]);
        

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
        $order = Order::with('product')->findOrFail($id);
        return response()->json($order);
    }
}