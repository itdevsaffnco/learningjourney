<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('modules', 'title')) {
                $table->string('title')->after('id')->nullable();
            }
            if (!Schema::hasColumn('modules', 'objectives')) {
                $table->text('objectives')->after('description')->nullable();
            }
            if (!Schema::hasColumn('modules', 'duration')) {
                $table->string('duration')->after('objectives')->nullable();
            }
            if (!Schema::hasColumn('modules', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('duration');
            }
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            if (Schema::hasColumn('modules', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('modules', 'objectives')) {
                $table->dropColumn('objectives');
            }
            if (Schema::hasColumn('modules', 'duration')) {
                $table->dropColumn('duration');
            }
            if (Schema::hasColumn('modules', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
        });
    }
};
