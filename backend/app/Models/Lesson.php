<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        "module_id",
        "title",
        "description",
        "type",
        "content",
        "video_url",
        "audio_url",
        "image_url",
        "quiz_id",
        "randomize_questions",
        "num_questions_to_show",
        "order",
        "duration_minutes",
        "status",
    ];

    protected $casts = [
        "is_published" => "boolean",
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
