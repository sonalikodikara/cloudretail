<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE orders MODIFY COLUMN status "
            . "ENUM('PLACED','CREATED','CONFIRMED','SHIPPED','DELIVERED','CANCELLED') "
            . "NOT NULL DEFAULT 'CREATED'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE orders MODIFY COLUMN status "
            . "ENUM('PLACED','CONFIRMED','SHIPPED','CANCELLED') "
            . "NOT NULL DEFAULT 'PLACED'"
        );
    }
};
