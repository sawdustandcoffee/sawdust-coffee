<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeCheckoutController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_zip' => 'required|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_code' => 'nullable|string',
        ]);

        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        // Build line items for Stripe
        $lineItems = [];
        $subtotal = 0;
        $metadata = [
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? '',
            'shipping_address' => $validated['shipping_address'],
            'shipping_city' => $validated['shipping_city'],
            'shipping_state' => $validated['shipping_state'],
            'shipping_zip' => $validated['shipping_zip'],
        ];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $variant = $item['variant_id'] ? ProductVariant::findOrFail($item['variant_id']) : null;

            // Calculate price
            $price = $product->sale_price ?? $product->price;
            if ($variant) {
                $price += $variant->price_modifier;
            }

            // Convert price to cents for Stripe
            $priceInCents = (int) ($price * 100);

            // Build product name with variant if applicable
            $productName = $product->name;
            if ($variant) {
                $productName .= ' - ' . $variant->name;
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $productName,
                        'description' => $product->description ?? '',
                        'images' => $product->images->isNotEmpty()
                            ? [url($product->images->first()->path)]
                            : [],
                    ],
                    'unit_amount' => $priceInCents,
                ],
                'quantity' => $item['quantity'],
            ];

            // Track subtotal
            $subtotal += $price * $item['quantity'];
        }

        // Handle discount code if provided
        $discountAmount = 0;
        $discountCode = null;
        if (!empty($validated['discount_code'])) {
            $code = strtoupper($validated['discount_code']);
            $discountCode = DiscountCode::where('code', $code)->first();

            if ($discountCode) {
                $validation = $discountCode->validate($subtotal, $validated['customer_email']);

                if ($validation['valid']) {
                    $discountAmount = $discountCode->calculateDiscount($subtotal);

                    // Add discount as metadata
                    $metadata['discount_code'] = $discountCode->code;
                    $metadata['discount_amount'] = $discountAmount;
                    $metadata['discount_code_id'] = $discountCode->id;

                    // Add discount as a line item (negative amount)
                    $lineItems[] = [
                        'price_data' => [
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => "Discount: {$discountCode->code}",
                                'description' => $discountCode->type === 'percentage'
                                    ? "{$discountCode->value}% off"
                                    : "$" . number_format($discountCode->value, 2) . " off",
                            ],
                            'unit_amount' => -1 * (int)($discountAmount * 100), // Negative amount for discount
                        ],
                        'quantity' => 1,
                    ];
                }
            }
        }

        try {
            // Create Stripe Checkout Session
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/order/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/cart',
                'customer_email' => $validated['customer_email'],
                'metadata' => $metadata,
                'shipping_address_collection' => [
                    'allowed_countries' => ['US'],
                ],
                'phone_number_collection' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'url' => $session->url,
                'session_id' => $session->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create checkout session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
