<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductOptionValue extends Model
{
    protected $fillable = [
        'product_option_id',
        'value',
        'price_modifier',
        'sort_order',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
    ];

    /**
     * Get the option that owns this value
     */
    public function option(): BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id');
    }
}
