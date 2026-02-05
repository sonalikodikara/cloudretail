<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'product_id',
        'quantity',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(\App\Models\Product::class);
    }
}