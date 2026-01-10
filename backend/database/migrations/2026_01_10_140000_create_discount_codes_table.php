<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('value', 10, 2); // Percentage (e.g., 10.00 for 10%) or fixed amount
            $table->decimal('min_order_amount', 10, 2)->nullable(); // Minimum order amount to apply
            $table->integer('max_uses')->nullable(); // Total times code can be used (null = unlimited)
            $table->integer('used_count')->default(0); // Track how many times used
            $table->integer('max_uses_per_user')->nullable(); // Limit per customer (null = unlimited)
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->boolean('active')->default(true);
            $table->text('description')->nullable(); // Admin notes
            $table->timestamps();

            $table->index('code');
            $table->index('active');
        });

        // Track discount code usage per user
        Schema::create('discount_code_uses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discount_code_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('user_email'); // Track by email since guests can use codes
            $table->decimal('discount_amount', 10, 2); // Amount saved
            $table->timestamp('used_at');
            $table->timestamps();

            $table->index(['discount_code_id', 'user_email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_code_uses');
        Schema::dropIfExists('discount_codes');
    }
};
