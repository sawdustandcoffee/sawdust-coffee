<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class ProductBundle extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'long_description',
        'image_path',
        'bundle_price',
        'discount_percentage',
        'active',
        'featured',
        'sort_order',
    ];

    protected $casts = [
        'bundle_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'active' => 'boolean',
        'featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['regular_price', 'savings_amount'];

    /**
     * Get the products in this bundle.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'bundle_items')
            ->withPivot('quantity', 'sort_order')
            ->withTimestamps()
            ->orderBy('bundle_items.sort_order');
    }

    /**
     * Scope to get only active bundles.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get only featured bundles.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    /**
     * Calculate the regular price (sum of individual products).
     */
    public function getRegularPriceAttribute(): float
    {
        return $this->products->sum(function ($product) {
            $price = $product->sale_price ?? $product->price;
            $quantity = $product->pivot->quantity ?? 1;
            return floatval($price) * $quantity;
        });
    }

    /**
     * Calculate the savings amount.
     */
    public function getSavingsAmountAttribute(): float
    {
        return max(0, $this->regular_price - floatval($this->bundle_price));
    }

    /**
     * Calculate the savings percentage.
     */
    public function getSavingsPercentageAttribute(): float
    {
        if ($this->regular_price <= 0) {
            return 0;
        }
        return round(($this->savings_amount / $this->regular_price) * 100, 2);
    }

    /**
     * Boot method to auto-generate slug.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bundle) {
            if (empty($bundle->slug)) {
                $bundle->slug = Str::slug($bundle->name);
            }
        });

        static::updating(function ($bundle) {
            if ($bundle->isDirty('name') && empty($bundle->slug)) {
                $bundle->slug = Str::slug($bundle->name);
            }
        });
    }
}
