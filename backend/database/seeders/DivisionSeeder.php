<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            ['name' => 'Sales', 'description' => 'Sales Team', 'color' => '#3B82F6'],
            ['name' => 'Marketing', 'description' => 'Marketing Team', 'color' => '#8B5CF6'],
            ['name' => 'HQ', 'description' => 'Headquarters', 'color' => '#EC4899'],
            ['name' => 'R&D', 'description' => 'Research & Development', 'color' => '#10B981'],
            ['name' => 'Retail BA', 'description' => 'Retail Business Analyst', 'color' => '#F59E0B'],
        ];

        foreach ($divisions as $division) {
            \App\Models\Division::create($division);
        }
    }
}
