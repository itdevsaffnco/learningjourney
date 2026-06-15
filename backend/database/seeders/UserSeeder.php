<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Division;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create roles
        $adminRole = Role::where('name', 'Admin')->first();
        $trainerRole = Role::where('name', 'Trainer')->first();
        $staffRole = Role::where('name', 'Staff')->first();

        // Get or create divisions
        $salesDivision = Division::firstOrCreate(['name' => 'Sales']);
        $marketingDivision = Division::firstOrCreate(['name' => 'Marketing']);
        $hqDivision = Division::firstOrCreate(['name' => 'HQ']);
        $rdDivision = Division::firstOrCreate(['name' => 'R&D']);
        $retailDivision = Division::firstOrCreate(['name' => 'Retail BA']);

        // Create Admin User
        User::firstOrCreate(
            ['email' => 'admin@saffnco.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'division_id' => $hqDivision->id,
            ]
        );

        // Create Trainer User
        User::firstOrCreate(
            ['email' => 'trainer@saffnco.com'],
            [
                'name' => 'Trainer User',
                'password' => Hash::make('password'),
                'role_id' => $trainerRole->id,
                'division_id' => $salesDivision->id,
            ]
        );

        // Create Staff User
        User::firstOrCreate(
            ['email' => 'staff@saffnco.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
                'role_id' => $staffRole->id,
                'division_id' => $salesDivision->id,
            ]
        );

        $this->command->info('Test users created successfully!');
    }
}
