import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../layouts/CustomerLayout';
import api from '../../lib/axios';

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  items_count?: number;
}

export default function CustomerDashboard() {
  const { user } = useCustomerAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/orders?per_page=5');
      setRecentOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-dark">My Account</h1>
          <p className="mt-1 text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-coffee-dark">
              {loading ? '...' : recentOrders.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Account Email</h3>
            <p className="mt-2 text-lg font-medium text-gray-900 truncate">
              {user?.email}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/customer/orders"
            className="bg-coffee text-white rounded-lg shadow p-6 hover:bg-coffee-dark transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">Order History</h3>
              <p className="text-sm text-coffee-light mt-1">View all orders</p>
            </div>
            <span className="text-3xl">📦</span>
          </Link>

          <Link
            to="/customer/settings"
            className="bg-white border-2 border-coffee text-coffee rounded-lg shadow p-6 hover:bg-coffee-light hover:text-coffee-dark transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">Account Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Update profile</p>
            </div>
            <span className="text-3xl">⚙️</span>
          </Link>

          <Link
            to="/products"
            className="bg-white border-2 border-coffee text-coffee rounded-lg shadow p-6 hover:bg-coffee-light hover:text-coffee-dark transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">Continue Shopping</h3>
              <p className="text-sm text-gray-600 mt-1">Browse products</p>
            </div>
            <span className="text-3xl">🛒</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              {recentOrders.length > 0 && (
                <Link
                  to="/customer/orders"
                  className="text-sm font-medium text-coffee hover:text-coffee-dark"
                >
                  View all →
                </Link>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <Link
                  to="/products"
                  className="inline-block px-6 py-2 bg-coffee text-white rounded-lg hover:bg-coffee-dark transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-coffee transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Link
                          to={`/customer/orders/${order.id}`}
                          className="text-lg font-semibold text-coffee hover:text-coffee-dark"
                        >
                          Order #{order.order_number}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
