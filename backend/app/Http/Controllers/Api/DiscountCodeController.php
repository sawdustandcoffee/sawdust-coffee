<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiscountCodeController extends Controller
{
    /**
     * Get all discount codes (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = DiscountCode::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $discountCodes = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($discountCodes);
    }

    /**
     * Create a new discount code (admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:discount_codes,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        // Convert code to uppercase for consistency
        $validated['code'] = strtoupper($validated['code']);

        // Validate percentage value
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return response()->json([
                'message' => 'Percentage discount cannot exceed 100%',
                'errors' => ['value' => ['Percentage discount cannot exceed 100%']]
            ], 422);
        }

        $discountCode = DiscountCode::create($validated);

        return response()->json([
            'message' => 'Discount code created successfully',
            'discount_code' => $discountCode,
        ], 201);
    }

    /**
     * Get a single discount code (admin).
     */
    public function show(string $id): JsonResponse
    {
        $discountCode = DiscountCode::with('uses.order')->findOrFail($id);

        return response()->json($discountCode);
    }

    /**
     * Update a discount code (admin).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $discountCode = DiscountCode::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('discount_codes')->ignore($discountCode->id)],
            'type' => 'sometimes|required|in:percentage,fixed',
            'value' => 'sometimes|required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        // Convert code to uppercase if provided
        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        // Validate percentage value if type is percentage
        if (isset($validated['type']) && $validated['type'] === 'percentage' && isset($validated['value']) && $validated['value'] > 100) {
            return response()->json([
                'message' => 'Percentage discount cannot exceed 100%',
                'errors' => ['value' => ['Percentage discount cannot exceed 100%']]
            ], 422);
        }

        $discountCode->update($validated);

        return response()->json([
            'message' => 'Discount code updated successfully',
            'discount_code' => $discountCode,
        ]);
    }

    /**
     * Delete a discount code (admin).
     */
    public function destroy(string $id): JsonResponse
    {
        $discountCode = DiscountCode::findOrFail($id);
        $discountCode->delete();

        return response()->json([
            'message' => 'Discount code deleted successfully',
        ]);
    }

    /**
     * Validate a discount code (public/customer).
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'email' => 'required|email',
        ]);

        $code = strtoupper($request->code);
        $subtotal = (float) $request->subtotal;
        $email = $request->email;

        $discountCode = DiscountCode::where('code', $code)->first();

        if (!$discountCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid discount code.',
            ], 404);
        }

        $validation = $discountCode->validate($subtotal, $email);

        if (!$validation['valid']) {
            return response()->json($validation, 422);
        }

        $discountAmount = $discountCode->calculateDiscount($subtotal);

        return response()->json([
            'valid' => true,
            'discount_code' => [
                'id' => $discountCode->id,
                'code' => $discountCode->code,
                'type' => $discountCode->type,
                'value' => $discountCode->value,
                'discount_amount' => $discountAmount,
            ],
        ]);
    }
}
