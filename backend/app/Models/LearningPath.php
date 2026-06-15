<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningPath extends Model
{
    protected $fillable = [
        'title',
        'description',
        'target_division',
        'target_role',
        'duration',
        'created_by',
        'status',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'learning_path_modules')->withPivot('order');
    }
}
