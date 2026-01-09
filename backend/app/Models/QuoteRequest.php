<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'project_type',
        'description',
        'budget_range',
        'timeline',
        'reference_files',
        'status',
        'admin_notes',
        'responded_at',
    ];

    protected $casts = [
        'reference_files' => 'array',
        'responded_at' => 'datetime',
    ];
}
