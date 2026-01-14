import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { GalleryItem, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Input, Textarea } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image_path: '',
    featured: false,
    sort_order: '0',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<GalleryItem>>(
        `/admin/gallery?page=${page}&per_page=20&sort_by=sort_order`
      );
      setItems(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image_path: '',
      featured: false,
      sort_order: '0',
    });
    setFormErrors({});
    setSelectedFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      image_path: item.image_path,
      featured: item.featured,
      sort_order: item.sort_order.toString(),
    });
    setFormErrors({});
    setSelectedFile(null);
    setPreviewUrl(item.image_path || '');
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async (itemId: number) => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', selectedFile);

      await api.post(`/admin/gallery/${itemId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setSelectedFile(null);
      return true;
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image');
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/admin/gallery/${itemId}/delete-image`);
      setPreviewUrl('');
      setFormData({ ...formData, image_path: '' });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate that we have an image (either existing or new)
    if (!editingItem && !selectedFile) {
      setFormErrors({ image_path: ['Please select an image to upload'] });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
        // For new items without upload, use placeholder
        image_path: formData.image_path || 'placeholder',
      };

      let itemId: number;

      if (editingItem) {
        await api.put(`/admin/gallery/${editingItem.id}`, payload);
        itemId = editingItem.id;
      } else {
        const response = await api.post('/admin/gallery', payload);
        itemId = response.data.item.id;
      }

      // Upload the image if a file was selected
      if (selectedFile) {
        const uploadSuccess = await handleUploadImage(itemId);
        if (!uploadSuccess) {
          // If upload failed, still close modal but show items
          setIsModalOpen(false);
          fetchItems();
          return;
        }
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save gallery item');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      await api.delete(`/admin/gallery/${item.id}`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete gallery item');
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      await api.put(`/admin/gallery/${item.id}`, {
        featured: !item.featured,
      });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update gallery item');
    }
  };

  const getImageUrl = (path: string) => {
    if (!path || path === 'placeholder') return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}/storage/${path}`;
  };

  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 10) {
      alert('You can upload maximum 10 images at once');
      setBulkFiles(validFiles.slice(0, 10));
    } else {
      setBulkFiles(validFiles);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return;

    try {
      setBulkUploading(true);
      const formData = new FormData();

      bulkFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      if (bulkCategory) {
        formData.append('category', bulkCategory);
      }

      const response = await api.post('/admin/gallery/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
      setIsBulkUploadModalOpen(false);
      setBulkFiles([]);
      setBulkCategory('');
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setBulkUploading(false);
    }
  };

  const openBulkUploadModal = () => {
    setBulkFiles([]);
    setBulkCategory('');
    setIsBulkUploadModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openBulkUploadModal}>
              Bulk Upload
            </Button>
            <Button onClick={openCreateModal}>+ Add Image</Button>
          </div>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No gallery items found. Click "Add Image" to create your first gallery item.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {item.image_path && item.image_path !== 'placeholder' ? (
                        <img
                          src={getImageUrl(item.image_path)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        {item.featured && <Badge variant="info">Featured</Badge>}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <p className="text-xs text-gray-500 mb-3">
                          Category: {item.category}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={item.featured ? 'secondary' : 'success'}
                          onClick={() => handleToggleFeatured(item)}
                        >
                          {item.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </Button>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            error={formErrors.title?.[0]}
          />

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image {!editingItem && <span className="text-red-600">*</span>}
            </label>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-3 relative border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {editingItem && formData.image_path && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(editingItem.id)}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete Image
                  </button>
                )}
              </div>
            )}

            {/* Upload Button */}
            <label className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-coffee text-white rounded-lg hover:bg-coffee/90 transition">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{previewUrl ? 'Change Image' : 'Select Image'}</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported: JPEG, PNG, WebP. Max size: 5MB
            </p>
            {formErrors.image_path && (
              <p className="text-sm text-red-600 mt-1">{formErrors.image_path[0]}</p>
            )}
          </div>

          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            helperText="e.g., Live Edge, Epoxy, CNC Signs"
            error={formErrors.category?.[0]}
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
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded text-coffee focus:ring-coffee"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
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

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        title="Bulk Upload Images"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload multiple images to the gallery at once. Maximum 10 images per upload.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported: JPEG, PNG, WebP. Max size: 5MB each. Max 10 files.
            </p>
          </div>

          {bulkFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Files ({bulkFiles.length})
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {bulkFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Category (Optional)"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            placeholder="e.g., Live Edge, Epoxy, CNC Signs"
            helperText="Apply this category to all uploaded images"
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBulkUpload}
              disabled={bulkUploading || bulkFiles.length === 0}
            >
              {bulkUploading ? 'Uploading...' : `Upload ${bulkFiles.length} Image(s)`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBulkUploadModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
