<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'description' => 'Platform Administrator - Full system control, user management, and analytics',
                'permissions' => json_encode([
                    'users.manage',
                    'roles.manage',
                    'divisions.manage',
                    'content.moderate',
                    'analytics.view',
                    'system.settings',
                    'announcements.create',
                ])
            ],
            [
                'name' => 'Trainer',
                'description' => 'Content Creator & Instructor - Create courses, modules, quizzes, and manage learning paths',
                'permissions' => json_encode([
                    'courses.create',
                    'courses.edit',
                    'modules.create',
                    'modules.edit',
                    'lessons.create',
                    'lessons.edit',
                    'quizzes.create',
                    'quizzes.edit',
                    'assignments.create',
                    'assignments.edit',
                    'paths.create',
                    'paths.edit',
                    'submissions.grade',
                    'progress.view',
                    'announcements.create',
                ])
            ],
            [
                'name' => 'Staff',
                'description' => 'Learner - Complete courses, take quizzes, submit assignments, earn certificates',
                'permissions' => json_encode([
                    'courses.enroll',
                    'lessons.complete',
                    'quizzes.attempt',
                    'assignments.submit',
                    'certificates.view',
                    'leaderboard.view',
                    'progress.view',
                    'announcements.view',
                    'points.view',
                    'rewards.redeem',
                ])
            ],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::create($role);
        }
    }
}
