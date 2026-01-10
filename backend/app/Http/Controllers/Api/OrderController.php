<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderShippedMail;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of orders (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with('items');

        // Search by order number, customer name, or email
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by payment status
        if ($request->has('paid_only')) {
            $query->where('payment_status', 'paid');
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
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with(['items.product', 'items.variant'])
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update the specified order (admin can update status, add notes).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,processing,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
        ]);

        // Check if status is being changed to "shipped"
        $statusChangedToShipped = isset($validated['status']) &&
                                   $validated['status'] === 'shipped' &&
                                   $order->status !== 'shipped';

        $order->update($validated);

        // Send shipped notification email
        if ($statusChangedToShipped) {
            try {
                $order->load('items');
                Mail::to($order->customer_email)
                    ->send(new OrderShippedMail($order));
                \Log::info('Order shipped email sent', ['order_id' => $order->id]);
            } catch (\Exception $e) {
                \Log::error('Failed to send order shipped email', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->fresh()->load('items'),
        ]);
    }

    /**
     * Get order statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total'),
            'revenue_this_month' => Order::where('payment_status', 'paid')
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('total'),
            'recent_orders' => Order::with('items')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Export orders to CSV.
     */
    public function exportCsv(Request $request)
    {
        $query = Order::query()->with('items.product');

        // Apply same filters as index
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->has('paid_only')) {
            $query->where('payment_status', 'paid');
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

        $orders = $query->get();

        // Generate CSV
        $filename = 'orders_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        // CSV Headers
        fputcsv($handle, [
            'Order Number',
            'Date',
            'Customer Name',
            'Customer Email',
            'Customer Phone',
            'Status',
            'Payment Status',
            'Items',
            'Subtotal',
            'Tax',
            'Shipping',
            'Total',
            'Shipping Address',
            'City',
            'State',
            'ZIP',
            'Tracking Number',
            'Admin Notes',
        ]);

        // CSV Data
        foreach ($orders as $order) {
            $items = $order->items->map(function ($item) {
                return $item->quantity . 'x ' . $item->product_name .
                    ($item->variant_name ? ' (' . $item->variant_name . ')' : '');
            })->implode('; ');

            fputcsv($handle, [
                $order->order_number,
                $order->created_at->format('Y-m-d H:i:s'),
                $order->customer_name,
                $order->customer_email,
                $order->customer_phone ?? '',
                $order->status,
                $order->payment_status,
                $items,
                '$' . number_format($order->subtotal, 2),
                '$' . number_format($order->tax, 2),
                '$' . number_format($order->shipping, 2),
                '$' . number_format($order->total, 2),
                $order->shipping_address ?? '',
                $order->city ?? '',
                $order->state ?? '',
                $order->zip ?? '',
                $order->tracking_number ?? '',
                $order->admin_notes ?? '',
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

    /**
     * Get customer's own orders.
     */
    public function customerOrders(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('customer_email', $user->email)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Get customer's specific order detail.
     */
    public function customerOrderDetail(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $order = Order::with(['items.product'])
            ->where('id', $id)
            ->where('customer_email', $user->email)
            ->firstOrFail();

        return response()->json($order);
    }
}
