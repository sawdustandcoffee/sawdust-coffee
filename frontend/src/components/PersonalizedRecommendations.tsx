import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Product } from '../types';
import { Button } from './ui';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

export default function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchRecommendations();
  }, [recentlyViewed]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const viewedIds = recentlyViewed.map((p) => p.id);
      const response = await api.post('/public/recommendations/personalized', {
        viewed_product_ids: viewedIds,
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error('Failed to load personalized recommendations', err);
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

  const title = recentlyViewed.length > 0
    ? 'Recommended For You'
    : 'Featured Products';

  const subtitle = recentlyViewed.length > 0
    ? 'Based on your browsing history'
    : 'Check out our handpicked favorites';

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-coffee-dark mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => {
          const imagePath = product.images?.[0]?.path || '/placeholder-product.jpg';

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
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
              <div className="p-4">
                <Link to={`/shop/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}

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

                <div className="mb-3">
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
          );
        })}
      </div>
    </div>
  );
}
