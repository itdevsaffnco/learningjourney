<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Division;

class CreateTestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create roles
        $staffRole = Role::firstOrCreate(['name' => 'Staff']);
        $trainerRole = Role::firstOrCreate(['name' => 'Trainer']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        // Get or create divisions
        $salesDiv = Division::firstOrCreate(['name' => 'Sales']);
        $marketingDiv = Division::firstOrCreate(['name' => 'Marketing']);
        $hqDiv = Division::firstOrCreate(['name' => 'HQ']);

        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@saffnco.com',
            'password' => bcrypt('password123'),
            'role_id' => $adminRole->id,
            'division_id' => $hqDiv->id,
            'email_verified_at' => now(),
        ]);

        // Create Trainer Users
        User::create([
            'name' => 'Trainer Sales',
            'email' => 'trainer@saffnco.com',
            'password' => bcrypt('password123'),
            'role_id' => $trainerRole->id,
            'division_id' => $salesDiv->id,
            'email_verified_at' => now(),
        ]);

        // Create Staff Users
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@saffnco.com',
            'password' => bcrypt('password123'),
            'role_id' => $staffRole->id,
            'division_id' => $salesDiv->id,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Test users created!');
        $this->command->info('Staff: staff@saffnco.com / password123');
        $this->command->info('Trainer: trainer@saffnco.com / password123');
        $this->command->info('Admin: admin@saffnco.com / password123');
    }
}
