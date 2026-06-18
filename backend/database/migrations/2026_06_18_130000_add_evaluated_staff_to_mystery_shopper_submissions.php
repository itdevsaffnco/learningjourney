<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mystery_shopper_submissions', function (Blueprint $table) {
            $table->string('evaluated_staff_name')->nullable()->after('store_location');
        });
    }

    public function down(): void
    {
        Schema::table('mystery_shopper_submissions', function (Blueprint $table) {
            $table->dropColumn('evaluated_staff_name');
        });
    }
};
