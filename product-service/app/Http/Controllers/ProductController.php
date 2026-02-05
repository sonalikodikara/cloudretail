<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * List all products
     */
    public function index()
    {
        return response()->json(Product::all());
    }

    /**
     * Create a new product (Admin)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string',
            'stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        // Get user info from middleware
        $user = $request->user;

        // Optional: check admin role
        if (($user['role'] ?? 'USER') !== 'ADMIN') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $product = Product::create($request->only('name', 'stock', 'price'));

        return response()->json($product, 201);
    }

    /**
     * Update product (Admin)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'  => 'sometimes|required|string',
            'stock' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
        ]);

        $user = $request->user;

        if (($user['role'] ?? 'USER') !== 'ADMIN') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $product = Product::findOrFail($id);
        $product->update($request->only('name', 'stock', 'price'));

        return response()->json($product);
    }

    /**
     * Deduct stock (for order-service)
     */
    public function updateStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        $product->stock -= $request->quantity;
        $product->save();

        return response()->json([
            'message' => 'Stock updated',
            'product' => $product
        ]);
    }

    /**
     * Login route for admin/user to get Sanctum token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ]);
    }
}