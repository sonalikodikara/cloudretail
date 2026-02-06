<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Http;

class EventController extends Controller
{
    public function handle(Request $request)
    {
        // Validate incoming event data
        $request->validate([
            'type' => 'required|string',
            'data' => 'required|array',
        ]);

        $eventType = $request->type;
        $eventData = $request->data;

        if ($eventType === 'OrderPlaced') {
            // Validate required data
            if (!isset($eventData['order_id'])) {
                return response()->json(['error' => 'Missing order_id'], 400);
            }

            try {
                // Only send notifications - do NOT update inventory here
                // OrderController already handles inventory deduction
                Http::timeout(5)->post('http://notification-service:8004/api/notify', $eventData);
            } catch (\Exception $e) {
                \Log::error('Event processing failed: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to process event'], 500);
            }
        }

        return response()->json(['status' => 'processed']);
    }
}
