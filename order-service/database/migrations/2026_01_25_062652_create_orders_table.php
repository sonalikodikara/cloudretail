<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Reference to user-service
            $table->unsignedBigInteger('user_id');

            // Reference to product-service
            $table->unsignedBigInteger('product_id');

            $table->integer('quantity');

            $table->enum('status', [
                'PLACED',
                'CONFIRMED',
                'SHIPPED',
                'CANCELLED'
            ])->default('PLACED');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
