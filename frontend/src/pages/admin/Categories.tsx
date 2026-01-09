import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { ProductCategory } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Input, Textarea } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Categories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: '0',
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories?per_page=100&sort_by=sort_order');
      setCategories(response.data.data || response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: '0',
      active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order.toString(),
      active: category.active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSaving(true);
      const payload = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save category');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      await api.delete(`/admin/categories/${category.id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: ProductCategory) => {
    try {
      await api.put(`/admin/categories/${category.id}`, {
        active: !category.active,
      });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
          <Button onClick={openCreateModal}>+ Add Category</Button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No categories found. Click "Add Category" to create your first category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Order
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Products
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
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{category.sort_order}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-gray-500 max-w-md truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {category.products_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={category.active ? 'success' : 'default'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditModal(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={category.active ? 'secondary' : 'success'}
                            onClick={() => handleToggleActive(category)}
                          >
                            {category.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(category)}
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
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={formErrors.name?.[0]}
          />

          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            helperText="Leave blank to auto-generate from name"
            error={formErrors.slug?.[0]}
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description?.[0]}
          />

          <Input
            label="Sort Order"
            name="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
            helperText="Lower numbers appear first"
            error={formErrors.sort_order?.[0]}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded text-coffee focus:ring-coffee"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
