import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { StockNotification, PaginatedResponse } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function StockNotifications() {
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    unique_products: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = `/admin/stock-notifications?page=${page}`;

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await api.get<PaginatedResponse<StockNotification>>(url);
      setNotifications(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load stock notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stock-notifications/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await api.delete(`/admin/stock-notifications/${id}`);
      fetchNotifications();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete notification', err);
      alert('Failed to delete notification');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Stock Notifications - Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Stock Notifications</h1>
        <p className="text-gray-600 mt-2">
          Manage back-in-stock notification subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Total Subscriptions</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Pending</div>
          <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Notified</div>
          <div className="text-3xl font-bold text-green-600">{stats.notified}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Unique Products</div>
          <div className="text-3xl font-bold text-blue-600">{stats.unique_products}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search by Email
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search email..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
              />
              <Button type="submit">Search</Button>
              {search && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="notified">Notified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No stock notifications found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notified
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.product?.name || `Product #${notification.product_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.notified_at ? (
                          <Badge variant="success">Notified</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(notification.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {notification.notified_at
                          ? formatDate(notification.notified_at)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(notification.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
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
    </AdminLayout>
  );
}
