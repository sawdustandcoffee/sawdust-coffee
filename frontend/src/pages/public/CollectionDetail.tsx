import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Collection, Product } from '../../types';
import { Button, Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import { useCart } from '../../context/CartContext';
import SEO from '../../components/SEO';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/public/collections/${slug}`);
        setCollection(response.data);
      } catch (err: any) {
        console.error('Failed to load collection', err);
        setError('Collection not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !collection) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link to="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const headerImage = collection.image_path
    ? `${import.meta.env.VITE_API_URL}/storage/${collection.image_path}`
    : null;

  return (
    <PublicLayout>
      <SEO
        title={`${collection.name} Collection`}
        description={collection.description || `Shop our ${collection.name} collection`}
      />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Shop', path: '/shop' },
              { label: 'Collections', path: '/collections' },
              { label: collection.name },
            ]}
          />

          {/* Collection Header */}
          <div className="mb-8">
            {headerImage && (
              <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                <img
                  src={headerImage}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                  <div className="px-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {collection.name}
                    </h1>
                    {collection.description && (
                      <p className="text-lg text-white/90 max-w-2xl">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!headerImage && (
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-coffee-dark mb-2">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {collection.description}
                  </p>
                )}
              </div>
            )}

            <div className="text-center text-gray-600">
              {collection.product_count} {collection.product_count === 1 ? 'Product' : 'Products'}
            </div>
          </div>

          {/* Products Grid */}
          {collection.products && collection.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collection.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <Link to={`/shop/${product.slug}`}>
                    <div className="aspect-square bg-gray-200 relative">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].path}
                          alt={product.images[0].alt_text || product.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {product.sale_price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Sale
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Star Rating */}
                    {product.average_rating !== undefined && product.average_rating > 0 && (
                      <div className="mb-3">
                        <StarRating
                          rating={product.average_rating}
                          readonly
                          size="sm"
                          showCount
                          count={product.review_count}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      {product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-green-600">
                            ${parseFloat(product.sale_price).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-coffee">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {product.inventory > 0 ? (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => addToCart(product, 1)}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" disabled>
                        Out of Stock
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No products in this collection yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
