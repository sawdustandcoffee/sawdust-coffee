<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewQuoteRequest;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class QuoteRequestController extends Controller
{
    /**
     * Display a listing of quote requests (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = QuoteRequest::query();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('project_type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by project type
        if ($projectType = $request->input('project_type')) {
            $query->where('project_type', $projectType);
        }

        // Date range filter
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->input('per_page', 20);
        $quotes = $query->paginate($perPage);

        return response()->json($quotes);
    }

    /**
     * Store a newly created quote request (public).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'project_type' => 'nullable|string|max:100',
            'description' => 'required|string',
            'budget_range' => 'nullable|string|max:100',
            'timeline' => 'nullable|string|max:100',
            'reference_files' => 'nullable|array',
            'reference_files.*' => 'string',
        ]);

        // Set default status for new quote requests
        $validated['status'] = 'new';

        $quote = QuoteRequest::create($validated);

        // Send email notification to admin
        try {
            $adminEmail = env('ADMIN_EMAIL', 'info@sawdustandcoffee.com');
            Mail::to($adminEmail)
                ->send(new NewQuoteRequest($quote));
            Log::info('Quote request notification sent to admin', ['quote_id' => $quote->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send quote request notification', [
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Quote request submitted successfully. We will contact you soon!',
            'quote' => $quote,
        ], 201);
    }

    /**
     * Display the specified quote request.
     */
    public function show(string $id): JsonResponse
    {
        $quote = QuoteRequest::findOrFail($id);

        return response()->json($quote);
    }

    /**
     * Update the specified quote request (admin).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $quote = QuoteRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|in:new,reviewed,quoted,accepted,declined,completed',
            'admin_notes' => 'nullable|string',
            'quoted_price' => 'nullable|numeric|min:0',
        ]);

        $quote->update($validated);

        return response()->json([
            'message' => 'Quote request updated successfully',
            'quote' => $quote,
        ]);
    }

    /**
     * Remove the specified quote request.
     */
    public function destroy(string $id): JsonResponse
    {
        $quote = QuoteRequest::findOrFail($id);
        $quote->delete();

        return response()->json([
            'message' => 'Quote request deleted successfully',
        ]);
    }

    /**
     * Get quote request statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_quotes' => QuoteRequest::count(),
            'new_quotes' => QuoteRequest::where('status', 'new')->count(),
            'pending_quotes' => QuoteRequest::whereIn('status', ['new', 'reviewed', 'quoted'])->count(),
            'accepted_quotes' => QuoteRequest::where('status', 'accepted')->count(),
            'recent_quotes' => QuoteRequest::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }
}
