import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import api from '../../lib/axios';

interface OrderItem {
  id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
  product?: {
    id: number;
    slug: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  tracking_number?: string;
  admin_notes?: string;
  items: OrderItem[];
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customer/orders/${id}`);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order');
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

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading order details...</div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !order) {
    return (
      <CustomerLayout>
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            to="/customer/orders"
            className="text-coffee hover:text-coffee-dark font-medium"
          >
            ← Back to Orders
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-dark">
            Order #{order.order_number}
          </h1>
          <p className="mt-1 text-gray-600">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="flex items-center gap-2 mt-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        {item.variant_name && (
                          <p className="text-sm text-gray-500">Variant: {item.variant_name}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Information
                  </h2>
                </div>
                <div className="p-6">
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                  <p className="text-gray-600 mt-2">{order.shipping_address}</p>
                  <p className="text-gray-600">
                    {order.city}, {order.state} {order.zip}
                  </p>
                  {order.customer_phone && (
                    <p className="text-gray-600 mt-2">Phone: {order.customer_phone}</p>
                  )}
                  {order.tracking_number && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Tracking Number
                      </p>
                      <p className="text-blue-700 font-mono mt-1">
                        {order.tracking_number}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>
              <div className="p-6 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Email:</span>{' '}
                  {order.customer_email}
                </p>
                {order.customer_phone && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Phone:</span>{' '}
                    {order.customer_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-coffee-light rounded-lg shadow p-6">
              <h3 className="font-semibold text-coffee-dark mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Have questions about your order? We're here to help!
              </p>
              <Link
                to="/contact"
                className="block w-full text-center px-4 py-2 bg-coffee text-white rounded-lg hover:bg-coffee-dark transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
