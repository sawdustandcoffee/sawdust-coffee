<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscountCode extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'used_count',
        'max_uses_per_user',
        'start_date',
        'end_date',
        'active',
        'description',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'max_uses_per_user' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'active' => 'boolean',
    ];

    /**
     * Get the usage records for this discount code.
     */
    public function uses(): HasMany
    {
        return $this->hasMany(DiscountCodeUse::class);
    }

    /**
     * Validate if the discount code can be used.
     *
     * @param float $orderTotal The order subtotal
     * @param string $userEmail The user's email
     * @return array ['valid' => bool, 'message' => string|null]
     */
    public function validate(float $orderTotal, string $userEmail): array
    {
        // Check if code is active
        if (!$this->active) {
            return ['valid' => false, 'message' => 'This discount code is no longer active.'];
        }

        // Check if code has started
        if ($this->start_date && now()->isBefore($this->start_date)) {
            return ['valid' => false, 'message' => 'This discount code is not yet valid.'];
        }

        // Check if code has expired
        if ($this->end_date && now()->isAfter($this->end_date)) {
            return ['valid' => false, 'message' => 'This discount code has expired.'];
        }

        // Check minimum order amount
        if ($this->min_order_amount && $orderTotal < $this->min_order_amount) {
            return [
                'valid' => false,
                'message' => "Minimum order amount of $" . number_format($this->min_order_amount, 2) . " required."
            ];
        }

        // Check max total uses
        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return ['valid' => false, 'message' => 'This discount code has reached its usage limit.'];
        }

        // Check max uses per user
        if ($this->max_uses_per_user) {
            $userUseCount = $this->uses()
                ->where('user_email', $userEmail)
                ->count();

            if ($userUseCount >= $this->max_uses_per_user) {
                return ['valid' => false, 'message' => 'You have already used this discount code the maximum number of times.'];
            }
        }

        return ['valid' => true, 'message' => null];
    }

    /**
     * Calculate the discount amount for an order.
     *
     * @param float $subtotal The order subtotal
     * @return float The discount amount
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            return round(($subtotal * $this->value) / 100, 2);
        }

        // Fixed amount - don't exceed subtotal
        return min($this->value, $subtotal);
    }

    /**
     * Increment the used count.
     */
    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }

    /**
     * Scope to only get active codes.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }
}
