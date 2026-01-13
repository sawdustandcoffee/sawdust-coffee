import { useEffect, useState } from 'react';
import { getProductImageUrl } from '../lib/imageUtils';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Product } from '../types';
import { Button, Spinner } from './ui';
import { useCart } from '../context/CartContext';

interface RelatedProductsProps {
  productId: number;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/products/${productId}/related`);
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load related products', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* Image */}
            <Link to={`/shop/${product.slug}`} className="block">
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.images[0].alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
                {product.sale_price && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Sale
                  </div>
                )}
                {product.inventory === 0 && (
                  <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                    Sold Out
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="p-3">
              <Link to={`/shop/${product.slug}`}>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-coffee transition line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              {/* Price */}
              <div className="mb-2">
                {product.sale_price ? (
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-green-600">
                      ${parseFloat(product.sale_price).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-coffee">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              {product.inventory > 0 ? (
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                >
                  Add to Cart
                </Button>
              ) : (
                <Button size="sm" className="w-full text-xs" disabled>
                  Out of Stock
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
