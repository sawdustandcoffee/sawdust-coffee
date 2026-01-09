<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    /**
     * Get content by key.
     */
    public static function getByKey(string $key, mixed $default = null): mixed
    {
        $content = static::where('key', $key)->first();

        if (!$content) {
            return $default;
        }

        return match ($content->type) {
            'json' => json_decode($content->value, true),
            'boolean' => (bool) $content->value,
            'integer' => (int) $content->value,
            'float' => (float) $content->value,
            default => $content->value,
        };
    }

    /**
     * Set content by key.
     */
    public static function setByKey(string $key, mixed $value, string $type = 'text'): static
    {
        if ($type === 'json' && is_array($value)) {
            $value = json_encode($value);
        }

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }
}
