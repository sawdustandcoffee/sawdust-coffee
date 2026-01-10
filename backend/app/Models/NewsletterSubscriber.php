<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'name',
        'is_confirmed',
        'confirmation_token',
        'confirmed_at',
        'is_active',
        'unsubscribe_token',
        'unsubscribed_at',
        'source',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
        'confirmed_at' => 'datetime',
        'is_active' => 'boolean',
        'unsubscribed_at' => 'datetime',
    ];

    /**
     * Generate a unique confirmation token.
     */
    public static function generateConfirmationToken(): string
    {
        return Str::random(64);
    }

    /**
     * Generate a unique unsubscribe token.
     */
    public static function generateUnsubscribeToken(): string
    {
        return Str::random(64);
    }

    /**
     * Mark the subscriber as confirmed.
     */
    public function confirm(): void
    {
        $this->update([
            'is_confirmed' => true,
            'confirmed_at' => now(),
            'confirmation_token' => null,
        ]);
    }

    /**
     * Mark the subscriber as unsubscribed.
     */
    public function unsubscribe(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }

    /**
     * Resubscribe an inactive subscriber.
     */
    public function resubscribe(): void
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
        ]);
    }

    /**
     * Scope to only get active subscribers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to only get confirmed subscribers.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('is_confirmed', true);
    }

    /**
     * Scope to get active and confirmed subscribers (mailing list).
     */
    public function scopeMailingList($query)
    {
        return $query->where('is_active', true)
            ->where('is_confirmed', true);
    }
}
