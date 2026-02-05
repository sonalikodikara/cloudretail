<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function notify(Request $request)
    {
        // Simulating AWS Lambda / Cloud Function execution
        Log::info('Notification triggered', $request->all());

        return response()->json([
            'sent' => true,
            'message' => 'Notification processed successfully'
        ]);
    }
}
