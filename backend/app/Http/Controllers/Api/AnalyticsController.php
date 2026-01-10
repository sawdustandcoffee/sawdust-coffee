<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactFormSubmission;
use App\Models\Order;
use App\Models\Product;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get sales analytics data.
     */
    public function sales(Request $request): JsonResponse
    {
        $period = $request->input('period', '30'); // days
        $startDate = now()->subDays((int)$period);

        // Total sales
        $totalSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->sum('total');

        // Total orders
        $totalOrders = Order::where('created_at', '>=', $startDate)->count();

        // Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        // Sales by day
        $dailySales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Sales by status
        $ordersByStatus = Order::where('created_at', '>=', $startDate)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'summary' => [
                'total_sales' => round($totalSales, 2),
                'total_orders' => $totalOrders,
                'avg_order_value' => round($avgOrderValue, 2),
            ],
            'daily_sales' => $dailySales,
            'orders_by_status' => $ordersByStatus,
        ]);
    }

    /**
     * Get product performance analytics.
     */
    public function products(Request $request): JsonResponse
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays((int)$period);

        // Top selling products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Low stock products
        $lowStock = Product::where('inventory', '<=', 10)
            ->where('inventory', '>', 0)
            ->orderBy('inventory')
            ->limit(10)
            ->get(['id', 'name', 'inventory', 'sku']);

        // Out of stock products
        $outOfStock = Product::where('inventory', '=', 0)
            ->limit(10)
            ->get(['id', 'name', 'sku']);

        // Product category performance
        $categoryPerformance = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_product_category', 'order_items.product_id', '=', 'product_product_category.product_id')
            ->join('product_categories', 'product_product_category.product_category_id', '=', 'product_categories.id')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'product_categories.name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('product_categories.id', 'product_categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        return response()->json([
            'top_products' => $topProducts,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'category_performance' => $categoryPerformance,
        ]);
    }

    /**
     * Get customer engagement analytics.
     */
    public function engagement(Request $request): JsonResponse
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays((int)$period);

        // Quote requests by day
        $quotesByDay = QuoteRequest::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Quote status distribution
        $quotesByStatus = QuoteRequest::where('created_at', '>=', $startDate)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Contact submissions by day
        $contactsByDay = ContactFormSubmission::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Response rate
        $totalQuotes = QuoteRequest::where('created_at', '>=', $startDate)->count();
        $respondedQuotes = QuoteRequest::where('created_at', '>=', $startDate)
            ->where('status', 'responded')
            ->count();
        $quoteResponseRate = $totalQuotes > 0 ? round(($respondedQuotes / $totalQuotes) * 100, 1) : 0;

        $totalContacts = ContactFormSubmission::where('created_at', '>=', $startDate)->count();
        $respondedContacts = ContactFormSubmission::where('created_at', '>=', $startDate)
            ->where('status', 'responded')
            ->count();
        $contactResponseRate = $totalContacts > 0 ? round(($respondedContacts / $totalContacts) * 100, 1) : 0;

        return response()->json([
            'quotes_by_day' => $quotesByDay,
            'quotes_by_status' => $quotesByStatus,
            'contacts_by_day' => $contactsByDay,
            'response_rates' => [
                'quotes' => $quoteResponseRate,
                'contacts' => $contactResponseRate,
            ],
            'summary' => [
                'total_quotes' => $totalQuotes,
                'total_contacts' => $totalContacts,
            ],
        ]);
    }

    /**
     * Get overall analytics summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays((int)$period);

        // Compare with previous period
        $previousStartDate = now()->subDays((int)$period * 2);
        $previousEndDate = $startDate;

        $currentSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->sum('total');

        $previousSales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->sum('total');

        $salesChange = $previousSales > 0
            ? round((($currentSales - $previousSales) / $previousSales) * 100, 1)
            : 0;

        $currentOrders = Order::where('created_at', '>=', $startDate)->count();
        $previousOrders = Order::whereBetween('created_at', [$previousStartDate, $previousEndDate])->count();
        $ordersChange = $previousOrders > 0
            ? round((($currentOrders - $previousOrders) / $previousOrders) * 100, 1)
            : 0;

        return response()->json([
            'current_period' => [
                'sales' => round($currentSales, 2),
                'orders' => $currentOrders,
            ],
            'previous_period' => [
                'sales' => round($previousSales, 2),
                'orders' => $previousOrders,
            ],
            'changes' => [
                'sales_percent' => $salesChange,
                'orders_percent' => $ordersChange,
            ],
        ]);
    }
}
