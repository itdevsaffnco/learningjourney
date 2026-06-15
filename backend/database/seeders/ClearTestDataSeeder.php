<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Clear all test data - keep structure, clear activity
        DB::table('user_progress')->truncate();
        DB::table('assignment_submissions')->truncate();
        DB::table('quiz_answers')->truncate();
        DB::table('quiz_submissions')->truncate();
        DB::table('certificates')->truncate();
        DB::table('points')->truncate();

        // Reset points to 0 for all users
        DB::table('points')->insert(
            \App\Models\User::where('role_id', '!=', 1)->pluck('id')->map(function ($userId) {
                return [
                    'user_id' => $userId,
                    'total_points' => 0,
                    'quiz_points' => 0,
                    'assignment_points' => 0,
                    'streak_bonus' => 0,
                    'daily_streak' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray()
        );

        $this->command->info('✅ All test data cleared! Database is fresh.');
    }
}
