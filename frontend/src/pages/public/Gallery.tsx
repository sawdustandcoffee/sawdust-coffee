import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { GalleryItem, PaginatedResponse } from '../../types';
import { Button, Spinner, Modal } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import SEO from '../../components/SEO';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/gallery/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = `/public/gallery?page=${page}&per_page=12`;

      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await api.get<PaginatedResponse<GalleryItem>>(url);
      setItems(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    setLightboxOpen(true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <PublicLayout>
      <SEO
        title="Gallery"
        description="View our portfolio of custom woodworking projects. See examples of live edge furniture, CNC signs, epoxy designs, and more from Sawdust & Coffee Woodworking."
        keywords="woodworking gallery, custom furniture examples, live edge portfolio, CNC sign examples, woodworking projects"
      />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-coffee-dark mb-2">Gallery</h1>
            <p className="text-lg text-gray-600">
              See our recent work and custom creations
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === ''
                    ? 'bg-coffee text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCategory === category
                      ? 'bg-coffee text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No gallery items found. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={item.image_path}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.category && (
                          <span className="inline-block bg-white/20 px-2 py-1 rounded text-xs mt-2">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
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
        </div>
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={selectedItem?.title || ''}
        size="xl"
      >
        {selectedItem && (
          <div>
            <img
              src={selectedItem.image_path}
              alt={selectedItem.title}
              className="w-full rounded-lg"
              loading="lazy"
            />
            {selectedItem.description && (
              <p className="mt-4 text-gray-700">{selectedItem.description}</p>
            )}
            {selectedItem.category && (
              <span className="inline-block bg-coffee text-white px-3 py-1 rounded-full text-sm mt-4">
                {selectedItem.category}
              </span>
            )}
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
