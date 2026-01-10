<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->boolean('is_confirmed')->default(false);
            $table->string('confirmation_token')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('unsubscribe_token')->unique();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('source')->default('website'); // website, checkout, etc.
            $table->timestamps();

            $table->index('email');
            $table->index('is_active');
            $table->index('is_confirmed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
