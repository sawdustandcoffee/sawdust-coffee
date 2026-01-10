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
        Schema::create('product_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('related_product_id')->constrained('products')->onDelete('cascade');
            $table->enum('relation_type', ['related', 'upsell', 'cross_sell', 'alternative'])->default('related');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Prevent duplicate relations
            $table->unique(['product_id', 'related_product_id']);

            // Index for faster lookups
            $table->index(['product_id', 'relation_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_relations');
    }
};
