<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'type',
        'price_modifier',
        'inventory',
        'active',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
        'inventory' => 'integer',
        'active' => 'boolean',
    ];

    /**
     * Get the product that owns the variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the order items for the variant.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the calculated price for this variant.
     */
    public function getCalculatedPriceAttribute(): string
    {
        $basePrice = $this->product->effective_price;
        return bcadd($basePrice, $this->price_modifier, 2);
    }
}
