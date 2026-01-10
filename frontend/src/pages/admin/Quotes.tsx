import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { QuoteRequest, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Select, Textarea, Input } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Quotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    admin_notes: '',
    quoted_price: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [page]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<QuoteRequest>>(
        `/admin/quotes?page=${page}&per_page=20&sort_by=created_at&sort_dir=desc`
      );
      setQuotes(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quote requests');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (quoteId: number) => {
    try {
      const response = await api.get<QuoteRequest>(`/admin/quotes/${quoteId}`);
      setSelectedQuote(response.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load quote details');
    }
  };

  const openUpdateModal = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setUpdateData({
      status: quote.status,
      admin_notes: quote.admin_notes || '',
      quoted_price: quote.quoted_price || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuote) return;

    try {
      setUpdating(true);
      await api.put(`/admin/quotes/${selectedQuote.id}`, updateData);
      setIsUpdateModalOpen(false);
      fetchQuotes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update quote request');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (quote: QuoteRequest) => {
    if (!confirm(`Are you sure you want to delete this quote request from ${quote.name}?`)) return;

    try {
      await api.delete(`/admin/quotes/${quote.id}`);
      fetchQuotes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete quote request');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/admin/quotes-export/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quote_requests_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export quote requests');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
      new: 'warning',
      reviewed: 'info',
      quoted: 'info',
      accepted: 'success',
      declined: 'danger',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
          <Button variant="secondary" onClick={handleExportCsv}>
            Export to CSV
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No quote requests found. Quote requests will appear here when submitted via the website.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Project Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
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
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{quote.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{quote.email}</div>
                            {quote.phone && (
                              <div className="text-gray-500">{quote.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {quote.project_type || 'Not specified'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(quote.status)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openDetailModal(quote.id)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openUpdateModal(quote)}
                            >
                              Update
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(quote)}
                            >
                              Delete
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

      {/* Quote Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Quote Request Details"
        size="lg"
      >
        {selectedQuote && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Name</p>
                <p className="text-sm text-gray-900">{selectedQuote.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{selectedQuote.email}</p>
              </div>
              {selectedQuote.phone && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{selectedQuote.phone}</p>
                </div>
              )}
              {selectedQuote.project_type && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Project Type</p>
                  <p className="text-sm text-gray-900">{selectedQuote.project_type}</p>
                </div>
              )}
              {selectedQuote.budget_range && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Budget Range</p>
                  <p className="text-sm text-gray-900">{selectedQuote.budget_range}</p>
                </div>
              )}
              {selectedQuote.timeline && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Timeline</p>
                  <p className="text-sm text-gray-900">{selectedQuote.timeline}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                {selectedQuote.description}
              </p>
            </div>

            {selectedQuote.reference_files && selectedQuote.reference_files.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Reference Files</p>
                <ul className="list-disc list-inside text-sm text-gray-900">
                  {selectedQuote.reference_files.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedQuote.quoted_price && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Quoted Price</p>
                <p className="text-lg font-bold text-green-600">
                  ${parseFloat(selectedQuote.quoted_price).toFixed(2)}
                </p>
              </div>
            )}

            {selectedQuote.admin_notes && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Admin Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {selectedQuote.admin_notes}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(selectedQuote.status)}
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Submitted:</span>
                <span>{new Date(selectedQuote.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Quote Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Quote Request"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Select
            label="Status"
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            options={[
              { value: 'new', label: 'New' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'quoted', label: 'Quoted' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <Input
            label="Quoted Price"
            type="number"
            step="0.01"
            value={updateData.quoted_price}
            onChange={(e) =>
              setUpdateData({ ...updateData, quoted_price: e.target.value })
            }
            helperText="Enter the price you're quoting for this project"
          />

          <Textarea
            label="Admin Notes"
            value={updateData.admin_notes}
            onChange={(e) =>
              setUpdateData({ ...updateData, admin_notes: e.target.value })
            }
            helperText="Internal notes (not visible to customer)"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Quote'}
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
