<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductOption extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'type',
        'required',
        'sort_order',
    ];

    protected $casts = [
        'required' => 'boolean',
    ];

    /**
     * Get the product that owns this option
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the values for this option
     */
    public function values(): HasMany
    {
        return $this->hasMany(ProductOptionValue::class)->orderBy('sort_order');
    }
}
