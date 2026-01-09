import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Card, Spinner } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';

interface DashboardStats {
  products: number;
  orders: number;
  quotes: number;
  contact: number;
  revenue: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    quotes: 0,
    contact: 0,
    revenue: '0.00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch stats from multiple endpoints
      const [productsRes, ordersRes, quotesRes, contactRes] = await Promise.all([
        api.get('/admin/products?per_page=1'),
        api.get('/admin/stats/orders'),
        api.get('/admin/stats/quotes'),
        api.get('/admin/stats/contact'),
      ]);

      setStats({
        products: productsRes.data.total || 0,
        orders: ordersRes.data.total_orders || 0,
        quotes: quotesRes.data.new_quotes || 0,
        contact: contactRes.data.new_submissions || 0,
        revenue: ordersRes.data.total_revenue || '0.00',
      });
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Products',
      value: stats.products,
      link: '/admin/products',
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      link: '/admin/orders',
      icon: '🛒',
      color: 'bg-green-500',
    },
    {
      label: 'New Quote Requests',
      value: stats.quotes,
      link: '/admin/quotes',
      icon: '💬',
      color: 'bg-purple-500',
    },
    {
      label: 'New Messages',
      value: stats.contact,
      link: '/admin/contact',
      icon: '✉️',
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      label: 'Add Product',
      link: '/admin/products/create',
      icon: '➕',
      description: 'Create a new product listing',
    },
    {
      label: 'View Orders',
      link: '/admin/orders',
      icon: '📋',
      description: 'Manage customer orders',
    },
    {
      label: 'Gallery',
      link: '/admin/gallery',
      icon: '🖼️',
      description: 'Manage gallery images',
    },
    {
      label: 'Site Content',
      link: '/admin/content',
      icon: '📝',
      description: 'Edit website content',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your admin panel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Link key={index} to={stat.link}>
                  <Card className="hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`${stat.color} text-white p-4 rounded-lg text-3xl`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Revenue Card */}
            <Card>
              <div className="flex items-center gap-4">
                <div className="bg-green-500 text-white p-4 rounded-lg text-3xl">
                  💰
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${parseFloat(stats.revenue).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <div className="p-4 border-2 border-coffee rounded-lg hover:bg-coffee hover:text-white transition cursor-pointer group">
                      <div className="text-3xl mb-2">{action.icon}</div>
                      <div className="font-semibold mb-1">{action.label}</div>
                      <div className="text-sm opacity-75">{action.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Getting Started */}
            <Card title="Getting Started">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-medium">Database is configured</p>
                    <p className="text-sm text-gray-600">
                      Make sure to run migrations: <code className="bg-gray-100 px-2 py-1 rounded">php artisan migrate</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-medium">Authentication is working</p>
                    <p className="text-sm text-gray-600">
                      You're logged in and ready to manage your site
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">ℹ️</span>
                  <div>
                    <p className="font-medium">Next step: Add your first product</p>
                    <p className="text-sm text-gray-600">
                      Click "Add Product" above to create your first product listing
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
