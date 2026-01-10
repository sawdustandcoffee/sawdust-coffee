<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductQuestionController extends Controller
{
    /**
     * Get all product questions (for admin).
     */
    public function index(Request $request)
    {
        $query = ProductQuestion::with(['product', 'customer', 'answeredBy']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'unanswered') {
                $query->unanswered();
            } elseif ($request->status === 'answered') {
                $query->answered();
            } elseif ($request->status === 'published') {
                $query->published();
            } elseif ($request->status === 'unpublished') {
                $query->where('is_published', false);
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $questions = $query->paginate($request->get('per_page', 20));

        return response()->json($questions);
    }

    /**
     * Get a single question.
     */
    public function show($id)
    {
        $question = ProductQuestion::with(['product', 'customer', 'answeredBy'])
            ->findOrFail($id);

        return response()->json($question);
    }

    /**
     * Answer a question.
     */
    public function answer(Request $request, $id)
    {
        $question = ProductQuestion::findOrFail($id);

        $validated = $request->validate([
            'answer' => 'required|string|max:2000',
            'is_published' => 'boolean',
        ]);

        $question->update([
            'answer' => $validated['answer'],
            'answered_by' => Auth::id(),
            'answered_at' => now(),
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return response()->json([
            'message' => 'Answer submitted successfully.',
            'question' => $question->load(['product', 'customer', 'answeredBy']),
        ]);
    }

    /**
     * Toggle publish status.
     */
    public function togglePublish($id)
    {
        $question = ProductQuestion::findOrFail($id);
        $question->is_published = !$question->is_published;
        $question->save();

        return response()->json([
            'message' => 'Question ' . ($question->is_published ? 'published' : 'unpublished') . ' successfully.',
            'question' => $question,
        ]);
    }

    /**
     * Delete a question.
     */
    public function destroy($id)
    {
        $question = ProductQuestion::findOrFail($id);
        $question->delete();

        return response()->json([
            'message' => 'Question deleted successfully.',
        ]);
    }
}
