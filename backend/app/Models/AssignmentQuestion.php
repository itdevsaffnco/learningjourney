<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignmentQuestion extends Model
{
    protected $fillable = [
        'assignment_id',
        'question',
        'type',
        'order',
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function options()
    {
        return $this->hasMany(AssignmentOption::class, 'assignment_question_id');
    }
}
