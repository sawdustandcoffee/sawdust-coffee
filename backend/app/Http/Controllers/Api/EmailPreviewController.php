<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewContactSubmission;
use App\Mail\NewQuoteRequest;
use App\Mail\OrderConfirmation;
use App\Models\ContactFormSubmission;
use App\Models\Order;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailPreviewController extends Controller
{
    /**
     * Get list of available email templates.
     */
    public function index(): JsonResponse
    {
        $templates = [
            [
                'id' => 'order-confirmation',
                'name' => 'Order Confirmation',
                'description' => 'Email sent to customers when they place an order',
                'requires_data' => true,
            ],
            [
                'id' => 'new-quote-request',
                'name' => 'New Quote Request',
                'description' => 'Email sent to admin when a new quote request is submitted',
                'requires_data' => true,
            ],
            [
                'id' => 'new-contact-submission',
                'name' => 'New Contact Submission',
                'description' => 'Email sent to admin when contact form is submitted',
                'requires_data' => true,
            ],
        ];

        return response()->json($templates);
    }

    /**
     * Preview an email template.
     */
    public function preview(Request $request, string $template): JsonResponse
    {
        try {
            $mailable = $this->getMailable($template);

            if (!$mailable) {
                return response()->json([
                    'message' => 'Template not found',
                ], 404);
            }

            $html = $mailable->render();

            return response()->json([
                'html' => $html,
                'subject' => $mailable->envelope()->subject,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to preview email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send a test email.
     */
    public function sendTest(Request $request, string $template): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $mailable = $this->getMailable($template);

            if (!$mailable) {
                return response()->json([
                    'message' => 'Template not found',
                ], 404);
            }

            Mail::to($validated['email'])->send($mailable);

            return response()->json([
                'message' => 'Test email sent successfully to ' . $validated['email'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a mailable instance for the given template.
     */
    private function getMailable(string $template)
    {
        return match ($template) {
            'order-confirmation' => $this->getOrderConfirmationMailable(),
            'new-quote-request' => $this->getNewQuoteRequestMailable(),
            'new-contact-submission' => $this->getNewContactSubmissionMailable(),
            default => null,
        };
    }

    /**
     * Get a sample OrderConfirmation mailable.
     */
    private function getOrderConfirmationMailable()
    {
        // Get the most recent order, or create a fake one
        $order = Order::with('items.product')->latest()->first();

        if (!$order) {
            // Create a mock order for preview
            $order = new Order([
                'id' => 1,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'customer_name' => 'John Doe',
                'customer_email' => 'customer@example.com',
                'customer_phone' => '(555) 123-4567',
                'shipping_address' => '123 Main St, Anytown, ST 12345',
                'subtotal' => 150.00,
                'tax' => 12.00,
                'shipping' => 10.00,
                'total' => 172.00,
                'payment_intent_id' => 'pi_test123',
                'payment_status' => 'paid',
                'status' => 'pending',
                'notes' => null,
                'created_at' => now(),
            ]);
            $order->id = 1;
        }

        return new OrderConfirmation($order);
    }

    /**
     * Get a sample NewQuoteRequest mailable.
     */
    private function getNewQuoteRequestMailable()
    {
        // Get the most recent quote, or create a fake one
        $quote = QuoteRequest::latest()->first();

        if (!$quote) {
            // Create a mock quote for preview
            $quote = new QuoteRequest([
                'id' => 1,
                'name' => 'Jane Smith',
                'email' => 'customer@example.com',
                'phone' => '(555) 987-6543',
                'project_type' => 'Custom Table',
                'description' => 'I would like to get a quote for a custom walnut dining table, 72" x 36", with live edge and epoxy river.',
                'budget' => '$2000-$3000',
                'timeline' => 'Within 2 months',
                'status' => 'new',
                'created_at' => now(),
            ]);
            $quote->id = 1;
        }

        return new NewQuoteRequest($quote);
    }

    /**
     * Get a sample NewContactSubmission mailable.
     */
    private function getNewContactSubmissionMailable()
    {
        // Get the most recent contact submission, or create a fake one
        $submission = ContactFormSubmission::latest()->first();

        if (!$submission) {
            // Create a mock submission for preview
            $submission = new ContactFormSubmission([
                'id' => 1,
                'name' => 'Bob Johnson',
                'email' => 'customer@example.com',
                'phone' => '(555) 456-7890',
                'message' => 'Hello! I saw your work at the local craft fair and was wondering if you take custom orders. I\'m interested in a custom coffee table.',
                'status' => 'new',
                'created_at' => now(),
            ]);
            $submission->id = 1;
        }

        return new NewContactSubmission($submission);
    }
}
