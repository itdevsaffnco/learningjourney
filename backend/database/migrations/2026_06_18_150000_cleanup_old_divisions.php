<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $old = ['Sales', 'Marketing', 'HQ'];
        $new = ['Beauty Advisor', 'Host Live', 'Customer Service'];

        // Re-assign users from old divisions to null before deleting
        foreach ($old as $name) {
            $division = DB::table('divisions')->where('name', $name)->first();
            if ($division) {
                DB::table('users')->where('division_id', $division->id)->update(['division_id' => null]);
                DB::table('divisions')->where('id', $division->id)->delete();
            }
        }

        // Ensure correct divisions exist
        foreach ($new as $name) {
            DB::table('divisions')->updateOrInsert(['name' => $name], ['name' => $name]);
        }
    }

    public function down(): void
    {
        // no rollback needed
    }
};
