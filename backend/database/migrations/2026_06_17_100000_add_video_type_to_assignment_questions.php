<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE assignment_questions MODIFY COLUMN type ENUM('multiple_choice', 'essay', 'video') NOT NULL DEFAULT 'multiple_choice'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE assignment_questions MODIFY COLUMN type ENUM('multiple_choice', 'essay') NOT NULL DEFAULT 'multiple_choice'");
    }
};
