<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'title',
        'description',
        'instructions',
        'module_id',
        'due_date',
        'max_score',
        'mc_weight',
        'show_score_to_staff',
        'duration_minutes',
        'requires_camera',
        'requires_location',
        'status',
        'created_by',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'requires_camera' => 'boolean',
        'requires_location' => 'boolean',
        'show_score_to_staff' => 'boolean',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function questions()
    {
        return $this->hasMany(AssignmentQuestion::class, 'assignment_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
