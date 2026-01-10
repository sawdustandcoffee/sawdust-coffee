<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            // Verify webhook signature
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Stripe webhook invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe webhook invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleCheckoutSessionCompleted($session);
                break;

            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentIntentSucceeded($paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handlePaymentIntentFailed($paymentIntent);
                break;

            default:
                Log::info('Unhandled Stripe webhook event type: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    private function handleCheckoutSessionCompleted($session)
    {
        Log::info('Processing checkout session completed', ['session_id' => $session->id]);

        // Check if order already exists (idempotency)
        $existingOrder = Order::where('stripe_session_id', $session->id)->first();
        if ($existingOrder) {
            Log::info('Order already exists for session', ['session_id' => $session->id]);
            return;
        }

        try {
            // Retrieve full session with line items
            $stripeSession = \Stripe\Checkout\Session::retrieve([
                'id' => $session->id,
                'expand' => ['line_items', 'line_items.data.price.product'],
            ]);

            // Extract metadata
            $metadata = $session->metadata;

            // Calculate totals
            $subtotal = $stripeSession->amount_subtotal / 100; // Convert from cents
            $tax = $stripeSession->total_details->amount_tax / 100;
            $shipping = $stripeSession->total_details->amount_shipping / 100;
            $total = $stripeSession->amount_total / 100;

            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $metadata->customer_name ?? $stripeSession->customer_details->name,
                'customer_email' => $metadata->customer_email ?? $stripeSession->customer_details->email,
                'customer_phone' => $metadata->customer_phone ?? $stripeSession->customer_details->phone,
                'shipping_address' => $metadata->shipping_address ?? '',
                'city' => $metadata->shipping_city ?? '',
                'state' => $metadata->shipping_state ?? '',
                'zip' => $metadata->shipping_zip ?? '',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'paid_at' => now(),
                'stripe_session_id' => $session->id,
                'stripe_payment_intent' => $session->payment_intent,
            ]);

            // Create order items from line items
            foreach ($stripeSession->line_items->data as $lineItem) {
                // Extract product name and variant from line item description
                $productName = $lineItem->description;

                // Try to find the product by name (this is a simplified approach)
                // In production, you'd want to include product_id in metadata
                $product = Product::where('name', 'LIKE', '%' . explode(' - ', $productName)[0] . '%')->first();

                if ($product) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_variant_id' => null, // Would need to be passed in metadata for accurate tracking
                        'product_name' => $lineItem->description,
                        'variant_name' => null,
                        'quantity' => $lineItem->quantity,
                        'price_at_purchase' => $lineItem->amount_total / $lineItem->quantity / 100,
                        'subtotal' => $lineItem->amount_total / 100,
                    ]);
                }
            }

            Log::info('Order created successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
            ]);

            // Send order confirmation email to customer
            try {
                // Load order items for email
                $order->load('items.product');
                Mail::to($order->customer_email)
                    ->send(new OrderConfirmationMail($order));
                Log::info('Order confirmation email sent', ['order_id' => $order->id]);
            } catch (\Exception $emailError) {
                Log::error('Failed to send order confirmation email', [
                    'order_id' => $order->id,
                    'error' => $emailError->getMessage(),
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to create order from Stripe session', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Payment intent succeeded', ['payment_intent_id' => $paymentIntent->id]);

        // Update order payment status if needed
        $order = Order::where('stripe_payment_intent', $paymentIntent->id)->first();
        if ($order && !$order->paid_at) {
            $order->update(['paid_at' => now()]);
            Log::info('Order payment status updated to paid', ['order_id' => $order->id]);
        }
    }

    private function handlePaymentIntentFailed($paymentIntent)
    {
        Log::error('Payment intent failed', [
            'payment_intent_id' => $paymentIntent->id,
            'failure_message' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
        ]);

        // Mark order with payment failure note
        $order = Order::where('stripe_payment_intent', $paymentIntent->id)->first();
        if ($order) {
            $order->update([
                'status' => 'cancelled',
                'admin_notes' => 'Payment failed: ' . ($paymentIntent->last_payment_error->message ?? 'Unknown error'),
            ]);
            Log::info('Order marked as cancelled due to payment failure', ['order_id' => $order->id]);
        }
    }
}
