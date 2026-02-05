<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Http;

class EventController extends Controller
{
    public function handle(Request $request)
    {
        if ($request->type === 'OrderPlaced') {
            Http::post('http://product-service/api/inventory/update', [
                'product_id' => $request->data['product_id'],
                'quantity' => $request->data['quantity']
            ]);

            Http::post('http://notification-service:8004/api/notify', $request->data);
        }

        return response()->json(['status' => 'processed']);
    }
}
