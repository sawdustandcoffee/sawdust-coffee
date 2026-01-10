<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductQuestion extends Model
{
    protected $fillable = [
        'product_id',
        'customer_id',
        'customer_name',
        'customer_email',
        'question',
        'answer',
        'answered_by',
        'answered_at',
        'is_published',
        'helpful_count',
    ];

    protected $casts = [
        'answered_at' => 'datetime',
        'is_published' => 'boolean',
        'helpful_count' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function answeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeAnswered($query)
    {
        return $query->whereNotNull('answer');
    }

    public function scopeUnanswered($query)
    {
        return $query->whereNull('answer');
    }
}
