<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'title',
        'description',
        'module_id',
        'passing_score',
        'time_limit_minutes',
        'created_by',
        'status',
        'total_questions',
        'shuffle_questions',
    ];

    protected $casts = [
        'passing_score' => 'integer',
        'time_limit_minutes' => 'integer',
    ];

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions()
    {
        return $this->hasMany(QuizSubmission::class);
    }
}
