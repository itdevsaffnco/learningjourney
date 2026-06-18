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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'division_id')) {
                $table->foreignId('division_id')->nullable()->constrained('divisions')->onDelete('set null');
            }
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null');
            }
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignIdFor('division');
            $table->dropForeignIdFor('role');
            $table->dropColumn(['avatar_url', 'bio', 'last_login_at']);
        });
    }
};
