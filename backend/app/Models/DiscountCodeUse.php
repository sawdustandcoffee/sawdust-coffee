<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCodeUse extends Model
{
    protected $fillable = [
        'discount_code_id',
        'order_id',
        'user_email',
        'discount_amount',
        'used_at',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'used_at' => 'datetime',
    ];

    /**
     * Get the discount code that was used.
     */
    public function discountCode(): BelongsTo
    {
        return $this->belongsTo(DiscountCode::class);
    }

    /**
     * Get the order that used this discount code.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
