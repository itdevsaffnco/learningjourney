<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Points extends Model
{
    protected $fillable = ['user_id', 'total_points', 'quiz_points', 'assignment_points', 'streak_bonus', 'daily_streak', 'last_activity_date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
