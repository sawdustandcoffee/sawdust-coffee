import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import AdminLayout from '../../layouts/AdminLayout';
import { Card, Spinner } from '../../components/ui';
import RevenueChart from '../../components/admin/RevenueChart';
import OrderStatusChart from '../../components/admin/OrderStatusChart';

interface DashboardStats {
  products: {
    total: number;
    active: number;
    out_of_stock: number;
    low_stock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    total_revenue: number;
    this_month_revenue: number;
  };
  engagement: {
    new_contact_submissions: number;
    new_quote_requests: number;
    total_contact_submissions: number;
    total_quote_requests: number;
  };
  gallery: {
    total_items: number;
    featured_items: number;
  };
  recent_orders: any[];
  recent_contacts: any[];
  recent_quotes: any[];
  top_products: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardStats(true); // Silent refresh
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboardStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardStats();
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">Failed to load dashboard statistics</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to Sawdust & Coffee Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Updated {formatLastUpdated()}
            </div>
            <button
              onClick={handleManualRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Refresh dashboard"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-coffee focus:ring-coffee"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-coffee mt-2">
                  ${stats.orders.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This month: ${stats.orders.this_month_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-coffee mt-2">{stats.orders.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.orders.pending} pending
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>

          {/* Active Products */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-3xl font-bold text-coffee mt-2">{stats.products.active}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.products.total} total
                </p>
              </div>
              <div className="text-4xl">🪵</div>
            </div>
          </Card>

          {/* New Inquiries */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                <p className="text-3xl font-bold text-coffee mt-2">
                  {stats.engagement.new_contact_submissions + stats.engagement.new_quote_requests}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.engagement.new_quote_requests} quotes, {stats.engagement.new_contact_submissions} contacts
                </p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h2>
            <RevenueChart />
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Distribution</h2>
            <OrderStatusChart />
          </Card>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {stats.products.low_stock > 0 && (
            <Card>
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
                  <p className="text-gray-600 mt-1">
                    {stats.products.low_stock} product(s) are running low on inventory
                  </p>
                  <Link to="/admin/products" className="text-coffee hover:underline text-sm mt-2 inline-block">
                    Manage Products →
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Out of Stock */}
          {stats.products.out_of_stock > 0 && (
            <Card>
              <div className="flex items-start gap-4">
                <div className="text-3xl">🚫</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Out of Stock</h3>
                  <p className="text-gray-600 mt-1">
                    {stats.products.out_of_stock} product(s) are currently out of stock
                  </p>
                  <Link to="/admin/products" className="text-coffee hover:underline text-sm mt-2 inline-block">
                    Restock Products →
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-coffee hover:underline text-sm">
                View All
              </Link>
            </div>
            {stats.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-coffee">${parseFloat(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </Card>

          {/* Top Products */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
              <Link to="/admin/products" className="text-coffee hover:underline text-sm">
                View All
              </Link>
            </div>
            {stats.top_products.length > 0 ? (
              <div className="space-y-3">
                {stats.top_products.map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-coffee text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-coffee">{product.total_sold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data yet</p>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quote Requests */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Quote Requests</h2>
              <Link to="/admin/quotes" className="text-coffee hover:underline text-sm">
                View All
              </Link>
            </div>
            {stats.recent_quotes.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_quotes.map((quote) => (
                  <div key={quote.id} className="py-3 border-b last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{quote.name}</p>
                        <p className="text-sm text-gray-600">{quote.project_type || 'General inquiry'}</p>
                        <p className="text-xs text-gray-500 mt-1">{quote.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        quote.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent quote requests</p>
            )}
          </Card>

          {/* Recent Contact Submissions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Contact Submissions</h2>
              <Link to="/admin/contact-submissions" className="text-coffee hover:underline text-sm">
                View All
              </Link>
            </div>
            {stats.recent_contacts.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_contacts.map((contact) => (
                  <div key={contact.id} className="py-3 border-b last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{contact.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent contact submissions</p>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-coffee hover:bg-coffee/5 transition"
            >
              <div className="text-3xl mb-2">➕</div>
              <p className="font-medium text-gray-900">Add Product</p>
            </Link>
            <Link
              to="/admin/gallery"
              className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-coffee hover:bg-coffee/5 transition"
            >
              <div className="text-3xl mb-2">🖼️</div>
              <p className="font-medium text-gray-900">Manage Gallery</p>
            </Link>
            <Link
              to="/admin/orders"
              className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-coffee hover:bg-coffee/5 transition"
            >
              <div className="text-3xl mb-2">📋</div>
              <p className="font-medium text-gray-900">View Orders</p>
            </Link>
            <Link
              to="/admin/categories"
              className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-coffee hover:bg-coffee/5 transition"
            >
              <div className="text-3xl mb-2">🏷️</div>
              <p className="font-medium text-gray-900">Manage Categories</p>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
