import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PaginatedResponse } from '../../types';
import { Button, Card, Spinner } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  model_type: string;
  model_id: number | null;
  description: string;
  properties: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    model_type: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '50',
        sort_by: 'created_at',
        sort_dir: 'desc',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.action) params.append('action', filters.action);
      if (filters.model_type) params.append('model_type', filters.model_type);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await api.get<PaginatedResponse<ActivityLog>>(
        `/admin/activity-logs?${params}`
      );
      setLogs(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      action: '',
      model_type: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (action.includes('deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('bulk')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const openDetailModal = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Description
                </label>
                <input
                  type="text"
                  placeholder="Search in descriptions..."
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
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => {
                    setFilters({ ...filters, action: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="bulk_delete">Bulk Delete</option>
                  <option value="bulk_activate">Bulk Activate</option>
                  <option value="bulk_deactivate">Bulk Deactivate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Type
                </label>
                <select
                  value={filters.model_type}
                  onChange={(e) => {
                    setFilters({ ...filters, model_type: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">All Types</option>
                  <option value="Product">Product</option>
                  <option value="Order">Order</option>
                  <option value="Category">Category</option>
                  <option value="Quote">Quote</option>
                  <option value="Contact">Contact</option>
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
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No activity logs found.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetailModal(log)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-xs text-gray-500">{log.model_type}</span>
                        {log.model_id && (
                          <span className="text-xs text-gray-400">#{log.model_id}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          {log.user ? log.user.name : 'System'}
                        </span>
                        <span>
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        {log.ip_address && <span>{log.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Activity Details</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Action</label>
                <p className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{selectedLog.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Model</label>
                <p className="mt-1 text-gray-900">
                  {selectedLog.model_type}
                  {selectedLog.model_id && ` #${selectedLog.model_id}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-gray-900">
                  {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'System'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
              {selectedLog.ip_address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">IP Address</label>
                  <p className="mt-1 text-gray-900">{selectedLog.ip_address}</p>
                </div>
              )}
              {selectedLog.user_agent && (
                <div>
                  <label className="text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-600 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
              {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Additional Data</label>
                  <pre className="mt-1 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
