import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Product } from '../types';
import { Button } from './ui';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';

interface CartRecommendationsProps {
  cartProductIds: number[];
}

export default function CartRecommendations({ cartProductIds }: CartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (cartProductIds.length > 0) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [cartProductIds]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.post('/public/recommendations/cart', {
        product_ids: cartProductIds,
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error('Failed to load cart recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-coffee-dark mb-2">
          Complete Your Purchase
        </h3>
        <p className="text-gray-600">
          Customers who bought items in your cart also purchased these
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => {
          const imagePath = product.images?.[0]?.path || '/placeholder-product.jpg';

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <Link to={`/shop/${product.slug}`}>
                <div className="aspect-square bg-gray-100">
                  <img
                    src={imagePath}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/shop/${product.slug}`}>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-2">
                    {product.name}
                  </h4>
                </Link>

                {product.average_rating !== undefined && product.average_rating > 0 && (
                  <div className="mb-2">
                    <StarRating
                      rating={product.average_rating}
                      readonly
                      size="sm"
                    />
                  </div>
                )}

                <div className="mb-3">
                  {product.sale_price ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-green-600">
                        ${parseFloat(product.sale_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-coffee">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {product.inventory > 0 ? (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => addToCart(product, 1)}
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
          );
        })}
      </div>
    </div>
  );
}
