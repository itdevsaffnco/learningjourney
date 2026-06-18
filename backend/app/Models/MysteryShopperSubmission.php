<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MysteryShopperSubmission extends Model
{
    protected $fillable = ['user_id', 'submitter_name', 'submitter_email', 'store_location', 'evaluated_staff_name', 'notes'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(MysteryShopperAnswer::class, 'submission_id');
    }
}
