<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewQuoteRequest;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;

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

    /**
     * Export quote requests to CSV.
     */
    public function exportCsv(Request $request)
    {
        $query = QuoteRequest::query();

        // Apply same filters as index
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('project_type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($projectType = $request->input('project_type')) {
            $query->where('project_type', $projectType);
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $quotes = $query->get();

        // Generate CSV
        $filename = 'quote_requests_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        // CSV Headers
        fputcsv($handle, [
            'ID',
            'Date',
            'Name',
            'Email',
            'Phone',
            'Project Type',
            'Description',
            'Budget Range',
            'Timeline',
            'Status',
            'Quoted Price',
            'Admin Notes',
            'Responded At',
        ]);

        // CSV Data
        foreach ($quotes as $quote) {
            fputcsv($handle, [
                $quote->id,
                $quote->created_at->format('Y-m-d H:i:s'),
                $quote->name,
                $quote->email,
                $quote->phone ?? '',
                $quote->project_type ?? '',
                $quote->description,
                $quote->budget_range ?? '',
                $quote->timeline ?? '',
                $quote->status,
                $quote->quoted_price ? '$' . number_format($quote->quoted_price, 2) : '',
                $quote->admin_notes ?? '',
                $quote->responded_at ? $quote->responded_at->format('Y-m-d H:i:s') : '',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
