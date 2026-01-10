<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockNotification extends Model
{
    protected $fillable = [
        'product_id',
        'email',
        'notified_at',
    ];

    protected $casts = [
        'notified_at' => 'datetime',
    ];

    /**
     * Get the product for this notification.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if this notification has been sent.
     */
    public function hasBeenNotified(): bool
    {
        return !is_null($this->notified_at);
    }

    /**
     * Mark this notification as sent.
     */
    public function markAsNotified(): void
    {
        $this->update(['notified_at' => now()]);
    }

    /**
     * Scope to get pending notifications (not yet sent).
     */
    public function scopePending($query)
    {
        return $query->whereNull('notified_at');
    }

    /**
     * Scope to get notifications for a specific product.
     */
    public function scopeForProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }
}
