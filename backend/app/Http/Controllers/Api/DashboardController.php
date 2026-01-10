<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactFormSubmission;
use App\Models\GalleryItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics and overview data.
     */
    public function index(): JsonResponse
    {
        $stats = [
            // Product Statistics
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('active', true)->count(),
                'out_of_stock' => Product::where('inventory', 0)->count(),
                'low_stock' => Product::where('inventory', '>', 0)->where('inventory', '<=', 5)->count(),
            ],

            // Order Statistics
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'completed' => Order::where('status', 'completed')->count(),
                'total_revenue' => Order::where('payment_status', 'paid')->sum('total'),
                'this_month_revenue' => Order::where('payment_status', 'paid')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('total'),
            ],

            // Customer Engagement
            'engagement' => [
                'new_contact_submissions' => ContactFormSubmission::where('status', 'new')->count(),
                'new_quote_requests' => QuoteRequest::where('status', 'new')->count(),
                'total_contact_submissions' => ContactFormSubmission::count(),
                'total_quote_requests' => QuoteRequest::count(),
            ],

            // Gallery
            'gallery' => [
                'total_items' => GalleryItem::count(),
                'featured_items' => GalleryItem::where('featured', true)->count(),
            ],

            // Recent Activity
            'recent_orders' => Order::with('items.product')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),

            'recent_contacts' => ContactFormSubmission::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),

            'recent_quotes' => QuoteRequest::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),

            // Top Selling Products (based on order items)
            'top_products' => DB::table('order_items')
                ->select('product_id', DB::raw('SUM(quantity) as total_sold'), 'products.name')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->groupBy('product_id', 'products.name')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get revenue chart data for the last 12 months.
     */
    public function revenueChart(): JsonResponse
    {
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json($monthlyRevenue);
    }

    /**
     * Get order status distribution.
     */
    public function orderStatusChart(): JsonResponse
    {
        $statusDistribution = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json($statusDistribution);
    }

    /**
     * Get product category distribution.
     */
    public function productCategoryChart(): JsonResponse
    {
        $categoryDistribution = DB::table('category_product')
            ->join('product_categories', 'category_product.category_id', '=', 'product_categories.id')
            ->selectRaw('product_categories.name, COUNT(*) as count')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->get();

        return response()->json($categoryDistribution);
    }
}
