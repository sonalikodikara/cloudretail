<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name'  => 'Wireless Mouse',
            'stock' => 100,
            'price' => 25.99,
        ]);

        Product::create([
            'name'  => 'Mechanical Keyboard',
            'stock' => 50,
            'price' => 89.99,
        ]);
        
    }
}
