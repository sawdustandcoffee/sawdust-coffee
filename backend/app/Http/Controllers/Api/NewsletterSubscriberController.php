<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NewsletterSubscriberController extends Controller
{
    /**
     * Get all newsletter subscribers (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterSubscriber::query();

        // Filter by status
        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true);
                    break;
                case 'unsubscribed':
                    $query->where('is_active', false);
                    break;
                case 'confirmed':
                    $query->where('is_confirmed', true);
                    break;
                case 'pending':
                    $query->where('is_confirmed', false);
                    break;
            }
        }

        // Search by email or name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'LIKE', "%{$search}%")
                    ->orWhere('name', 'LIKE', "%{$search}%");
            });
        }

        $subscribers = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($subscribers);
    }

    /**
     * Subscribe to newsletter (public).
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
        ]);

        // Check if already subscribed
        $existing = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($existing) {
            // If they're unsubscribed, allow resubscribing
            if (!$existing->is_active) {
                $existing->resubscribe();

                // Send new confirmation email
                $existing->update([
                    'confirmation_token' => NewsletterSubscriber::generateConfirmationToken(),
                    'is_confirmed' => false,
                    'confirmed_at' => null,
                ]);

                try {
                    Mail::to($existing->email)->send(new NewsletterConfirmationMail($existing));
                } catch (\Exception $e) {
                    Log::error('Failed to send newsletter confirmation email', [
                        'email' => $existing->email,
                        'error' => $e->getMessage(),
                    ]);
                }

                return response()->json([
                    'message' => 'Welcome back! Please check your email to confirm your subscription.',
                ]);
            }

            // Already subscribed and active
            if ($existing->is_confirmed) {
                return response()->json([
                    'message' => 'You are already subscribed to our newsletter.',
                ], 200);
            }

            // Pending confirmation
            return response()->json([
                'message' => 'Please check your email to confirm your subscription.',
            ], 200);
        }

        // Create new subscriber
        $subscriber = NewsletterSubscriber::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'source' => $validated['source'] ?? 'website',
            'confirmation_token' => NewsletterSubscriber::generateConfirmationToken(),
            'unsubscribe_token' => NewsletterSubscriber::generateUnsubscribeToken(),
            'is_confirmed' => false,
            'is_active' => true,
        ]);

        // Send confirmation email
        try {
            Mail::to($subscriber->email)->send(new NewsletterConfirmationMail($subscriber));
        } catch (\Exception $e) {
            Log::error('Failed to send newsletter confirmation email', [
                'email' => $subscriber->email,
                'error' => $e->getMessage(),
            ]);
            // Don't fail the subscription if email fails
        }

        return response()->json([
            'message' => 'Thank you for subscribing! Please check your email to confirm your subscription.',
        ], 201);
    }

    /**
     * Confirm newsletter subscription (public).
     */
    public function confirm(Request $request, string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('confirmation_token', $token)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid confirmation token.',
            ], 404);
        }

        if ($subscriber->is_confirmed) {
            return response()->json([
                'message' => 'Your subscription is already confirmed.',
            ], 200);
        }

        $subscriber->confirm();

        return response()->json([
            'message' => 'Thank you! Your subscription has been confirmed.',
        ]);
    }

    /**
     * Unsubscribe from newsletter (public).
     */
    public function unsubscribe(Request $request, string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $token)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid unsubscribe token.',
            ], 404);
        }

        if (!$subscriber->is_active) {
            return response()->json([
                'message' => 'You are already unsubscribed.',
            ], 200);
        }

        $subscriber->unsubscribe();

        return response()->json([
            'message' => 'You have been unsubscribed from our newsletter.',
        ]);
    }

    /**
     * Delete a subscriber (admin).
     */
    public function destroy(string $id): JsonResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully.',
        ]);
    }

    /**
     * Export subscribers as CSV (admin).
     */
    public function exportCsv(Request $request)
    {
        $query = NewsletterSubscriber::mailingList();

        $subscribers = $query->get();

        $filename = 'newsletter-subscribers-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($subscribers) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, ['Email', 'Name', 'Confirmed At', 'Subscribed At', 'Source']);

            // Data rows
            foreach ($subscribers as $subscriber) {
                fputcsv($file, [
                    $subscriber->email,
                    $subscriber->name ?? '',
                    $subscriber->confirmed_at ? $subscriber->confirmed_at->format('Y-m-d H:i:s') : '',
                    $subscriber->created_at->format('Y-m-d H:i:s'),
                    $subscriber->source,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
