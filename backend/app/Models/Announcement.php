<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'created_by', 'status', 'published_at', 'start_date', 'end_date'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
