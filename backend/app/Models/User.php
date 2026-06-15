<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'division_id',
        'role_id',
        'avatar_url',
        'bio',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function progress()
    {
        return $this->hasMany(UserProgress::class);
    }

    public function quizAnswers()
    {
        return $this->hasMany(QuizAnswer::class);
    }

    public function assignments()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function points()
    {
        return $this->hasOne(Points::class);
    }

    public function rewards()
    {
        return $this->belongsToMany(Reward::class, 'user_rewards');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }
}
