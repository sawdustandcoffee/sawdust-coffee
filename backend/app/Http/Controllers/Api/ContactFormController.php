<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewContactSubmission;
use App\Models\ContactFormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;

class ContactFormController extends Controller
{
    /**
     * Display a listing of contact form submissions (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactFormSubmission::query();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
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
        $submissions = $query->paginate($perPage);

        return response()->json($submissions);
    }

    /**
     * Store a newly created contact form submission (public).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:5000',
        ]);

        // Set default status
        $validated['status'] = 'new';

        $submission = ContactFormSubmission::create($validated);

        // Send email notification to admin
        try {
            $adminEmail = env('ADMIN_EMAIL', 'info@sawdustandcoffee.com');
            Mail::to($adminEmail)
                ->send(new NewContactSubmission($submission));
            Log::info('Contact form notification sent to admin', ['submission_id' => $submission->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send contact form notification', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Thank you for your message! We will get back to you soon.',
            'submission' => $submission,
        ], 201);
    }

    /**
     * Display the specified contact form submission.
     */
    public function show(string $id): JsonResponse
    {
        $submission = ContactFormSubmission::findOrFail($id);

        return response()->json($submission);
    }

    /**
     * Update the specified contact form submission (admin).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $submission = ContactFormSubmission::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|in:new,read,responded,archived',
            'admin_notes' => 'nullable|string',
        ]);

        $submission->update($validated);

        return response()->json([
            'message' => 'Contact form submission updated successfully',
            'submission' => $submission,
        ]);
    }

    /**
     * Remove the specified contact form submission.
     */
    public function destroy(string $id): JsonResponse
    {
        $submission = ContactFormSubmission::findOrFail($id);
        $submission->delete();

        return response()->json([
            'message' => 'Contact form submission deleted successfully',
        ]);
    }

    /**
     * Get contact form statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_submissions' => ContactFormSubmission::count(),
            'new_submissions' => ContactFormSubmission::where('status', 'new')->count(),
            'unread_submissions' => ContactFormSubmission::where('status', 'new')->count(),
            'recent_submissions' => ContactFormSubmission::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Export contact form submissions to CSV.
     */
    public function exportCsv(Request $request)
    {
        $query = ContactFormSubmission::query();

        // Apply same filters as index
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
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

        $submissions = $query->get();

        // Generate CSV
        $filename = 'contact_submissions_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        // CSV Headers
        fputcsv($handle, [
            'ID',
            'Date',
            'Name',
            'Email',
            'Phone',
            'Message',
            'Status',
            'Admin Notes',
        ]);

        // CSV Data
        foreach ($submissions as $submission) {
            fputcsv($handle, [
                $submission->id,
                $submission->created_at->format('Y-m-d H:i:s'),
                $submission->name,
                $submission->email,
                $submission->phone ?? '',
                $submission->message,
                $submission->status,
                $submission->admin_notes ?? '',
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
