<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'long_description',
        'price',
        'inventory',
        'active',
        'featured',
        'sku',
        'sale_price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'inventory' => 'integer',
        'active' => 'boolean',
        'featured' => 'boolean',
    ];

    /**
     * Get the categories for the product.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category');
    }

    /**
     * Get the images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the options for the product.
     */
    public function options(): HasMany
    {
        return $this->hasMany(ProductOption::class)->orderBy('sort_order');
    }

    /**
     * Get the variants for the product.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get the active variants for the product.
     */
    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('active', true);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Get the approved reviews for the product.
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    /**
     * Get the related products.
     */
    public function relatedProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_relations',
            'product_id',
            'related_product_id'
        )
            ->withPivot('relation_type', 'sort_order')
            ->withTimestamps()
            ->orderBy('sort_order');
    }

    /**
     * Get products that reference this product as related.
     */
    public function referencedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_relations',
            'related_product_id',
            'product_id'
        )
            ->withPivot('relation_type', 'sort_order')
            ->withTimestamps()
            ->orderBy('sort_order');
    }

    /**
     * Get related products by type.
     */
    public function getRelatedByType(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->relatedProducts()->wherePivot('relation_type', $type)->get();
    }

    /**
     * Get the effective price (sale price if available, otherwise regular price).
     */
    public function getEffectivePriceAttribute(): string
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Check if the product is on sale.
     */
    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }

    /**
     * Check if the product is in stock.
     */
    public function getIsInStockAttribute(): bool
    {
        return $this->inventory > 0;
    }

    /**
     * Get the average rating for the product.
     */
    public function getAverageRatingAttribute(): float
    {
        return (float) $this->approvedReviews()->avg('rating') ?? 0;
    }

    /**
     * Get the review count for the product.
     */
    public function getReviewCountAttribute(): int
    {
        return $this->approvedReviews()->count();
    }
}
