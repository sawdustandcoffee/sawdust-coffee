import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Product, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get<PaginatedResponse<Product>>(
        `/admin/products?${params}`
      );

      setProducts(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}`, {
        active: !product.active,
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, productId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== productId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    if (selectedIds.length === 0) {
      alert('Please select at least one product');
      return;
    }

    const actionLabels: Record<string, string> = {
      delete: 'delete',
      activate: 'activate',
      deactivate: 'deactivate',
      feature: 'mark as featured',
      unfeature: 'unmark as featured',
    };

    if (!confirm(`Are you sure you want to ${actionLabels[bulkAction]} ${selectedIds.length} product(s)?`)) {
      return;
    }

    try {
      await api.post('/admin/products/bulk-action', {
        action: bulkAction,
        product_ids: selectedIds,
      });
      setSelectedIds([]);
      setBulkAction('');
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <Link to="/admin/products/create">
            <Button>+ Add Product</Button>
          </Link>
        </div>

        <Card>
          <div className="mb-4 space-y-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
            />

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.length} product(s) selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">Select action...</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="feature">Mark as Featured</option>
                  <option value="unfeature">Unmark as Featured</option>
                  <option value="delete">Delete</option>
                </select>
                <Button size="sm" onClick={handleBulkAction}>
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products found. Click "Add Product" to create your first product.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === products.length && products.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded text-coffee focus:ring-coffee"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Inventory
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                            className="rounded text-coffee focus:ring-coffee"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              ${parseFloat(product.price).toFixed(2)}
                            </div>
                            {product.sale_price && (
                              <div className="text-sm text-green-600">
                                Sale: ${parseFloat(product.sale_price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              product.inventory > 0
                                ? 'text-gray-900'
                                : 'text-red-600 font-medium'
                            }
                          >
                            {product.inventory}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Badge
                              variant={product.active ? 'success' : 'default'}
                            >
                              {product.active ? 'Active' : 'Inactive'}
                            </Badge>
                            {product.featured && (
                              <Badge variant="info">Featured</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Button size="sm" variant="secondary">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant={product.active ? 'secondary' : 'success'}
                              onClick={() => handleToggleActive(product)}
                            >
                              {product.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(product.id)}
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
    </AdminLayout>
  );
}
