<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductQuestionController extends Controller
{
    /**
     * Get published questions for a product.
     */
    public function index(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $questions = $product->publishedQuestions()
            ->with(['customer', 'answeredBy'])
            ->paginate($request->get('per_page', 10));

        return response()->json($questions);
    }

    /**
     * Ask a question about a product.
     */
    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'customer_name' => 'required_without:customer_id|string|max:255',
            'customer_email' => 'required_without:customer_id|email|max:255',
        ]);

        $questionData = [
            'product_id' => $product->id,
            'question' => $validated['question'],
            'is_published' => false, // Requires admin approval
        ];

        // If authenticated customer
        if (Auth::guard('customer')->check()) {
            $questionData['customer_id'] = Auth::guard('customer')->id();
            $questionData['customer_email'] = Auth::guard('customer')->user()->email;
        } else {
            // Guest question
            $questionData['customer_name'] = $validated['customer_name'];
            $questionData['customer_email'] = $validated['customer_email'];
        }

        $question = ProductQuestion::create($questionData);

        return response()->json([
            'message' => 'Your question has been submitted and will be published after review.',
            'question' => $question,
        ], 201);
    }

    /**
     * Mark a question as helpful.
     */
    public function markHelpful(Request $request, $questionId)
    {
        $question = ProductQuestion::findOrFail($questionId);
        $question->increment('helpful_count');

        return response()->json([
            'message' => 'Thank you for your feedback!',
            'helpful_count' => $question->helpful_count,
        ]);
    }
}
