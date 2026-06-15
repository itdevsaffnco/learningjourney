<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'name',
        'description',
        'thumbnail_url',
        'duration_hours',
        'level',
        'division_id',
        'order',
        'status',
    ];

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }
}
