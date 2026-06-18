<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MysteryShopperAnswer extends Model
{
    protected $fillable = ['submission_id', 'question_id', 'answer'];

    public function question()
    {
        return $this->belongsTo(MysteryShopperQuestion::class, 'question_id');
    }

    public function submission()
    {
        return $this->belongsTo(MysteryShopperSubmission::class, 'submission_id');
    }
}
