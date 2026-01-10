import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { DiscountCode, PaginatedResponse } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function DiscountCodes() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order_amount: '',
    max_uses: '',
    max_uses_per_user: '',
    start_date: '',
    end_date: '',
    active: true,
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscountCodes();
  }, [page, activeFilter]);

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      let url = `/admin/discount-codes?page=${page}`;

      if (activeFilter !== '') {
        url += `&active=${activeFilter}`;
      }

      const response = await api.get<PaginatedResponse<DiscountCode>>(url);
      setDiscountCodes(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load discount codes', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      min_order_amount: '',
      max_uses: '',
      max_uses_per_user: '',
      start_date: '',
      end_date: '',
      active: true,
      description: '',
    });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (discountCode: DiscountCode) => {
    setFormData({
      code: discountCode.code,
      type: discountCode.type,
      value: discountCode.value,
      min_order_amount: discountCode.min_order_amount || '',
      max_uses: discountCode.max_uses?.toString() || '',
      max_uses_per_user: discountCode.max_uses_per_user?.toString() || '',
      start_date: discountCode.start_date || '',
      end_date: discountCode.end_date || '',
      active: discountCode.active,
      description: discountCode.description || '',
    });
    setEditingId(discountCode.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload: any = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      max_uses_per_user: formData.max_uses_per_user ? parseInt(formData.max_uses_per_user) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/admin/discount-codes/${editingId}`, payload);
      } else {
        await api.post('/admin/discount-codes', payload);
      }
      resetForm();
      fetchDiscountCodes();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save discount code');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      await api.delete(`/admin/discount-codes/${id}`);
      fetchDiscountCodes();
    } catch (err) {
      alert('Failed to delete discount code');
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Discount Codes - Admin</title>
      </Helmet>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
            <p className="text-gray-600 mt-2">
              Manage promotional discount codes for your store
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              Create Discount Code
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Discount Code' : 'Create Discount Code'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SUMMER2024"
                  required
                />
                {formErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.code[0]}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.type === 'percentage' ? '10' : '5.00'}
                  required
                />
                {formErrors.value && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.value[0]}</p>
                )}
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Order Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Total Uses
                </label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unlimited"
                />
              </div>

              {/* Max Uses Per User */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Uses Per Customer
                </label>
                <input
                  type="number"
                  value={formData.max_uses_per_user}
                  onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unlimited"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Internal)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Internal notes about this discount code..."
              />
            </div>

            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Codes</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : discountCodes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-xl text-gray-600">No discount codes found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discountCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{code.code}</div>
                        {code.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {code.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {code.type === 'percentage'
                            ? `${code.value}%`
                            : `$${parseFloat(code.value).toFixed(2)}`}
                        </div>
                        {code.min_order_amount && (
                          <div className="text-sm text-gray-500">
                            Min: ${parseFloat(code.min_order_amount).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {code.used_count} {code.max_uses ? `/ ${code.max_uses}` : ''}
                        </div>
                        {code.max_uses_per_user && (
                          <div className="text-sm text-gray-500">
                            {code.max_uses_per_user} per customer
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {code.start_date && (
                          <div>From: {new Date(code.start_date).toLocaleDateString()}</div>
                        )}
                        {code.end_date && (
                          <div>To: {new Date(code.end_date).toLocaleDateString()}</div>
                        )}
                        {!code.start_date && !code.end_date && (
                          <div className="text-gray-400">Always</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {code.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(code)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(code.id)}>
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
