<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Collection extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_path',
        'type',
        'active',
        'featured',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['product_count'];

    /**
     * Get the products in this collection.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'collection_product')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderBy('collection_product.sort_order');
    }

    /**
     * Get products for this collection, including auto-collections.
     */
    public function getProductsAttribute()
    {
        // For manual collections, return the manually added products
        if ($this->type === 'manual') {
            return $this->products()->with(['primaryImage', 'categories'])->get();
        }

        // For auto collections, dynamically fetch products based on type
        $query = Product::with(['primaryImage', 'categories'])
            ->where('active', true);

        switch ($this->type) {
            case 'auto_new':
                $query->orderBy('created_at', 'desc')->limit(12);
                break;
            case 'auto_featured':
                $query->where('featured', true)->orderBy('sort_order');
                break;
            case 'auto_sale':
                $query->whereNotNull('sale_price')->orderBy('created_at', 'desc');
                break;
            default:
                return collect();
        }

        return $query->get();
    }

    /**
     * Get the product count for this collection.
     */
    public function getProductCountAttribute(): int
    {
        if ($this->type === 'manual') {
            return $this->products()->count();
        }

        // For auto collections, count based on type
        $query = Product::where('active', true);

        switch ($this->type) {
            case 'auto_new':
                return $query->count();
            case 'auto_featured':
                return $query->where('featured', true)->count();
            case 'auto_sale':
                return $query->whereNotNull('sale_price')->count();
            default:
                return 0;
        }
    }

    /**
     * Scope to get only active collections.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get only featured collections.
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
     * Boot method to auto-generate slug.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            if (empty($collection->slug)) {
                $collection->slug = Str::slug($collection->name);
            }
        });

        static::updating(function ($collection) {
            if ($collection->isDirty('name') && empty($collection->slug)) {
                $collection->slug = Str::slug($collection->name);
            }
        });
    }
}
