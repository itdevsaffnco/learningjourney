<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (!Schema::hasColumn('lessons', 'randomize_questions')) {
                $table->boolean('randomize_questions')->default(false)->after('quiz_id');
            }
            if (!Schema::hasColumn('lessons', 'num_questions_to_show')) {
                $table->unsignedInteger('num_questions_to_show')->nullable()->after('randomize_questions');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['randomize_questions', 'num_questions_to_show']);
        });
    }
};
