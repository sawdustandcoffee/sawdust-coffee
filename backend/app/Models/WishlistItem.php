<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
    ];

    /**
     * Get the user who owns this wishlist item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product in this wishlist item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
