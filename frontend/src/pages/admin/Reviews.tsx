import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { ProductReview, PaginatedResponse } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Reviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [approvedFilter, setApprovedFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [page, approvedFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = `/admin/reviews?page=${page}`;

      if (approvedFilter !== '') {
        url += `&approved=${approvedFilter}`;
      }

      const response = await api.get<PaginatedResponse<ProductReview>>(url);
      setReviews(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      await api.put(`/admin/reviews/${id}`, {
        is_approved: true,
      });
      fetchReviews();
    } catch (err) {
      console.error('Failed to approve review', err);
      alert('Failed to approve review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setProcessingId(id);
      await api.put(`/admin/reviews/${id}`, {
        is_approved: false,
      });
      fetchReviews();
    } catch (err) {
      console.error('Failed to reject review', err);
      alert('Failed to reject review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setProcessingId(id);
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review', err);
      alert('Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Product Reviews - Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-gray-600 mt-2">
          Manage customer product reviews and ratings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval Status
            </label>
            <select
              value={approvedFilter}
              onChange={(e) => {
                setApprovedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Reviews</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-xl text-gray-600">No reviews found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(review as any).product?.name || `Product #${review.product_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{review.reviewer_name}</div>
                        <div className="text-sm text-gray-500">{review.reviewer_email}</div>
                        {review.is_verified_purchase && (
                          <Badge variant="success" className="text-xs mt-1">
                            Verified Purchase
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {review.review_text ? (
                            <p className="line-clamp-3">{review.review_text}</p>
                          ) : (
                            <span className="text-gray-400 italic">No text review</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.is_approved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {!review.is_approved ? (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              disabled={processingId === review.id}
                            >
                              {processingId === review.id ? 'Processing...' : 'Approve'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleReject(review.id)}
                              disabled={processingId === review.id}
                            >
                              {processingId === review.id ? 'Processing...' : 'Unapprove'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(review.id)}
                            disabled={processingId === review.id}
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
