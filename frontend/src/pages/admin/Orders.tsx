import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Order, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Select, Textarea } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tracking_number: '',
    admin_notes: '',
  });
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        sort_by: 'created_at',
        sort_dir: 'desc',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus === 'paid') params.append('paid_only', 'true');
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await api.get<PaginatedResponse<Order>>(
        `/admin/orders?${params}`
      );
      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (orderId: number) => {
    try {
      const response = await api.get<Order>(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load order details');
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      tracking_number: order.tracking_number || '',
      admin_notes: order.admin_notes || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      setUpdating(true);
      await api.put(`/admin/orders/${selectedOrder.id}`, updateData);
      setIsUpdateModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus === 'paid') params.append('paid_only', 'true');
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await api.get(`/admin/orders-export/csv?${params}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export orders');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
      refunded: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button variant="secondary" onClick={handleExportCsv}>
              Export to CSV
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Order #, customer name or email..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => {
                    setFilters({ ...filters, paymentStatus: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">All Payments</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters({ ...filters, startDate: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters({ ...filters, endDate: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                />
              </div>

              <div className="flex items-end">
                <Button variant="secondary" onClick={handleClearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No orders found. Orders will appear here when customers make purchases.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Order #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <code className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer_email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">
                            ${parseFloat(order.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4">
                          {getPaymentBadge(order.payment_status)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openDetailModal(order.id)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openUpdateModal(order)}
                            >
                              Update
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Customer Info</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedOrder.customer_name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {selectedOrder.customer_email}
                </p>
                {selectedOrder.customer_phone && (
                  <p className="text-sm">
                    <strong>Phone:</strong> {selectedOrder.customer_phone}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.shipping_address}</p>
                <p className="text-sm">
                  {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-left py-2 px-3">Quantity</th>
                      <th className="text-right py-2 px-3">Price</th>
                      <th className="text-right py-2 px-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2 px-3">
                          {item.product_name}
                          {item.variant_name && (
                            <span className="text-gray-500"> ({item.variant_name})</span>
                          )}
                        </td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="text-right py-2 px-3">
                          ${parseFloat(item.price_at_purchase).toFixed(2)}
                        </td>
                        <td className="text-right py-2 px-3">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end space-y-1">
                <div className="w-64">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${parseFloat(selectedOrder.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>${parseFloat(selectedOrder.shipping).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t mt-2 pt-2">
                    <span>Total:</span>
                    <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.admin_notes && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Admin Notes</h3>
                <p className="text-sm text-gray-600">{selectedOrder.admin_notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Order Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Order"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Select
            label="Order Status"
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              value={updateData.tracking_number}
              onChange={(e) =>
                setUpdateData({ ...updateData, tracking_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
            />
          </div>

          <Textarea
            label="Admin Notes"
            value={updateData.admin_notes}
            onChange={(e) =>
              setUpdateData({ ...updateData, admin_notes: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Order'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
