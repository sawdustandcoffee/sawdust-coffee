import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { NewsletterSubscriber, PaginatedResponse } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [page, statusFilter, searchQuery]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      let url = `/admin/newsletter-subscribers?page=${page}`;

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await api.get<PaginatedResponse<NewsletterSubscriber>>(url);
      setSubscribers(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load newsletter subscribers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      await api.delete(`/admin/newsletter-subscribers/${id}`);
      fetchSubscribers();
    } catch (err) {
      alert('Failed to delete subscriber');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/newsletter-subscribers-export/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export subscribers');
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Newsletter Subscribers - Admin</title>
      </Helmet>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
            <p className="text-gray-600 mt-2">
              Manage your email newsletter subscribers
            </p>
          </div>
          <Button onClick={handleExport}>
            Export Mailing List (CSV)
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by email or name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Button type="button" variant="secondary" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </div>
        </form>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subscribers</option>
            <option value="active">Active & Confirmed</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Confirmation</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-xl text-gray-600">No subscribers found</p>
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscriber.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {subscriber.is_active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="default">Unsubscribed</Badge>
                          )}
                          {subscriber.is_confirmed ? (
                            <Badge variant="info">Confirmed</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </div>
                        {subscriber.confirmed_at && (
                          <div className="text-xs text-gray-500">
                            Confirmed: {new Date(subscriber.confirmed_at).toLocaleDateString()}
                          </div>
                        )}
                        {subscriber.unsubscribed_at && (
                          <div className="text-xs text-gray-500">
                            Unsubscribed: {new Date(subscriber.unsubscribed_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(subscriber.id)}
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
