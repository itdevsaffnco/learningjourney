<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            if (!Schema::hasColumn('assignments', 'instructions')) {
                $table->text('instructions')->nullable();
            }
            if (!Schema::hasColumn('assignments', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            }
            $table->unsignedBigInteger('module_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('instructions');
            $table->dropForeignKeyIfExists(['created_by_foreign']);
            $table->dropColumn('created_by');
            $table->unsignedBigInteger('module_id')->nullable(false)->change();
        });
    }
};
