<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mystery_shopper_submissions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('submitter_name')->nullable()->after('user_id');
            $table->string('submitter_email')->nullable()->after('submitter_name');
        });
    }

    public function down(): void
    {
        Schema::table('mystery_shopper_submissions', function (Blueprint $table) {
            $table->dropColumn(['submitter_name', 'submitter_email']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
