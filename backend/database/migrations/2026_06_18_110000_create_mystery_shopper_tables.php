<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mystery_shopper_questions', function (Blueprint $table) {
            $table->id();
            $table->string('question_text');
            $table->enum('type', ['text', 'textarea', 'multiple_choice', 'checkbox', 'rating', 'yes_no'])->default('text');
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('mystery_shopper_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('store_location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('mystery_shopper_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('mystery_shopper_submissions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('mystery_shopper_questions')->onDelete('cascade');
            $table->text('answer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mystery_shopper_answers');
        Schema::dropIfExists('mystery_shopper_submissions');
        Schema::dropIfExists('mystery_shopper_questions');
    }
};
