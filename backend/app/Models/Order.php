<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_email',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'city',
        'state',
        'zip',
        'status',
        'subtotal',
        'discount',
        'discount_code',
        'tax',
        'shipping',
        'total',
        'stripe_session_id',
        'stripe_payment_intent',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the discount code usage for this order.
     */
    public function discountCodeUse(): HasOne
    {
        return $this->hasOne(DiscountCodeUse::class);
    }

    /**
     * Check if the order is paid.
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->paid_at !== null;
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'SC';
        $timestamp = now()->format('ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));

        return $prefix . $timestamp . $random;
    }
}
