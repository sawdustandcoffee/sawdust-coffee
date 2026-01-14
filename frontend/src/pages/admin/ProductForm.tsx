import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Product, ProductCategory } from '../../types';
import { Button, Input, Textarea, Card } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';
import ImageUpload from '../../components/admin/ImageUpload';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    price: '',
    sale_price: '',
    inventory: '0',
    sku: '',
    active: true,
    featured: false,
    category_ids: [] as number[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get<{ data: ProductCategory[] } | ProductCategory[]>('/admin/categories?per_page=100');
      const categoriesData = Array.isArray(response.data) ? response.data : response.data.data;
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ product: Product }>(`/admin/products/${id}`);
      const productData = response.data.product || response.data;

      setProduct(productData);
      setFormData({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || '',
        long_description: productData.long_description || '',
        price: productData.price,
        sale_price: productData.sale_price || '',
        inventory: productData.inventory.toString(),
        sku: productData.sku || '',
        active: productData.active,
        featured: productData.featured,
        category_ids: productData.categories?.map((c) => c.id) || [],
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setLoading(true);

      const payload = {
        ...formData,
        inventory: parseInt(formData.inventory) || 0,
      };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      navigate('/admin/products');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={errors.name?.[0]}
              />

              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                helperText="Leave blank to auto-generate from name"
                error={errors.slug?.[0]}
              />

              <Input
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                error={errors.price?.[0]}
              />

              <Input
                label="Sale Price"
                name="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={handleChange}
                helperText="Leave blank if not on sale"
                error={errors.sale_price?.[0]}
              />

              <Input
                label="Inventory"
                name="inventory"
                type="number"
                value={formData.inventory}
                onChange={handleChange}
                required
                error={errors.inventory?.[0]}
              />

              <Input
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                helperText="Stock Keeping Unit (optional)"
                error={errors.sku?.[0]}
              />
            </div>

            <Textarea
              label="Short Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              helperText="Brief description for product listings"
              error={errors.description?.[0]}
            />

            <Textarea
              label="Long Description"
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              rows={6}
              helperText="Detailed description for product page"
              error={errors.long_description?.[0]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded text-coffee focus:ring-coffee"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="rounded text-coffee focus:ring-coffee"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded text-coffee focus:ring-coffee"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Product
                </span>
              </label>
            </div>

            {/* Image Upload - Only show when editing */}
            {isEdit && product && (
              <div className="pt-6 border-t border-gray-200">
                <ImageUpload
                  productId={product.id}
                  images={product.images || []}
                  onImagesChange={fetchProduct}
                />
              </div>
            )}

            {!isEdit && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can upload images after creating the product.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
