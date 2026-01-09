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
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'hero_title', 'about_text', 'contact_email'
            $table->text('value');
            $table->string('type')->default('text'); // text, html, image, json
            $table->string('group')->nullable(); // home, about, services, etc.
            $table->text('description')->nullable(); // Help text for admins
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_content');
    }
};
