<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MysteryShopperQuestion extends Model
{
    protected $fillable = ['question_text', 'type', 'options', 'is_required', 'sort_order'];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
    ];

    public function answers()
    {
        return $this->hasMany(MysteryShopperAnswer::class, 'question_id');
    }
}
