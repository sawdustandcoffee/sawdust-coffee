import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { ContactFormSubmission, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Select, Textarea } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Contact() {
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    admin_notes: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<ContactFormSubmission>>(
        `/admin/contact-submissions?page=${page}&per_page=20&sort_by=created_at&sort_dir=desc`
      );
      setSubmissions(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (submissionId: number) => {
    try {
      const response = await api.get<ContactFormSubmission>(`/admin/contact-submissions/${submissionId}`);
      setSelectedSubmission(response.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load submission details');
    }
  };

  const openUpdateModal = (submission: ContactFormSubmission) => {
    setSelectedSubmission(submission);
    setUpdateData({
      status: submission.status,
      admin_notes: submission.admin_notes || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubmission) return;

    try {
      setUpdating(true);
      await api.put(`/admin/contact-submissions/${selectedSubmission.id}`, updateData);
      setIsUpdateModalOpen(false);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update submission');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (submission: ContactFormSubmission) => {
    if (!confirm(`Are you sure you want to delete this message from ${submission.name}?`)) return;

    try {
      await api.delete(`/admin/contact-submissions/${submission.id}`);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete submission');
    }
  };

  const handleMarkAsRead = async (submission: ContactFormSubmission) => {
    try {
      await api.put(`/admin/contact-submissions/${submission.id}`, {
        status: 'read',
      });
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update submission');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/admin/contact-submissions-export/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contact_submissions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export contact submissions');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
      new: 'warning',
      read: 'info',
      responded: 'success',
      archived: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
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
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No contact messages found. Messages will appear here when visitors submit the contact form.
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
                        Message Preview
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
                    {submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          submission.status === 'new' ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {submission.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{submission.email}</div>
                            {submission.phone && (
                              <div className="text-gray-500">{submission.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 max-w-md truncate">
                            {submission.message}
                          </p>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openDetailModal(submission.id)}
                            >
                              View
                            </Button>
                            {submission.status === 'new' && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkAsRead(submission)}
                              >
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openUpdateModal(submission)}
                            >
                              Update
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(submission)}
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

      {/* Message Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Contact Message"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Name</p>
                <p className="text-sm text-gray-900">{selectedSubmission.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedSubmission.email}
                </a>
              </div>
              {selectedSubmission.phone && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Phone</p>
                  <a
                    href={`tel:${selectedSubmission.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedSubmission.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-700">Status</p>
                {getStatusBadge(selectedSubmission.status)}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Message</p>
              <div className="bg-gray-50 p-4 rounded border text-sm text-gray-900 whitespace-pre-wrap">
                {selectedSubmission.message}
              </div>
            </div>

            {selectedSubmission.admin_notes && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Admin Notes</p>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-gray-900">
                  {selectedSubmission.admin_notes}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Submitted: {new Date(selectedSubmission.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Submission Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Contact Message"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Select
            label="Status"
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            options={[
              { value: 'new', label: 'New' },
              { value: 'read', label: 'Read' },
              { value: 'responded', label: 'Responded' },
              { value: 'archived', label: 'Archived' },
            ]}
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
              {updating ? 'Updating...' : 'Update Message'}
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
