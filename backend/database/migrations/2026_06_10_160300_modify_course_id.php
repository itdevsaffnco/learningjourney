<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modify the column to be nullable using raw SQL
        DB::statement('ALTER TABLE modules MODIFY course_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        // No rollback needed
    }
};
