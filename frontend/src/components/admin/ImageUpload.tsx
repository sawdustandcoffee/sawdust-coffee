import { useState } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui';

interface ProductImage {
  id: number;
  path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageUploadProps {
  productId: number;
  images: ProductImage[];
  onImagesChange: () => void;
}

export default function ImageUpload({ productId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt_text', '');
      formData.append('is_primary', images.length === 0 ? 'true' : 'false');

      await api.post(`/admin/products/${productId}/images`, formData, {
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

      onImagesChange();
      e.target.value = ''; // Reset input
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/admin/products/${productId}/images/${imageId}`);
      onImagesChange();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await api.put(`/admin/products/${productId}/images/${imageId}`, {
        is_primary: true,
      });
      onImagesChange();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set primary image');
    }
  };

  const handleUpdateAltText = async (imageId: number, alt_text: string) => {
    try {
      await api.put(`/admin/products/${productId}/images/${imageId}`, {
        alt_text,
      });
      onImagesChange();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update alt text');
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}/storage/${path}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload images for this product. The first image will be set as the primary image by default.
        </p>
      </div>

      {/* Upload Button */}
      <div>
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
                <span>Upload Image</span>
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
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative border-2 rounded-lg overflow-hidden ${
                image.is_primary ? 'border-coffee' : 'border-gray-200'
              }`}
            >
              {/* Primary Badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-coffee text-white text-xs px-2 py-1 rounded z-10">
                  Primary
                </div>
              )}

              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={getImageUrl(image.path)}
                  alt={image.alt_text}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="p-2 bg-white space-y-2">
                <input
                  type="text"
                  placeholder="Alt text..."
                  defaultValue={image.alt_text}
                  onBlur={(e) => handleUpdateAltText(image.id, e.target.value)}
                  className="w-full text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-coffee"
                />
                <div className="flex gap-1">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
