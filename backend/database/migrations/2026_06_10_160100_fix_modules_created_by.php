<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key if it exists and recreate it properly
        Schema::table('modules', function (Blueprint $table) {
            try {
                $table->dropForeign(['created_by']);
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }
        });

        Schema::table('modules', function (Blueprint $table) {
            // Modify the created_by column to be a simple integer without constraint first
            if (Schema::hasColumn('modules', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        // No rollback needed
    }
};
