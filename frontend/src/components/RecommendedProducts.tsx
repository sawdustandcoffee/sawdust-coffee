import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Product } from '../types';
import { Button } from './ui';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';

interface RecommendedProductsProps {
  productId: number;
}

export default function RecommendedProducts({ productId }: RecommendedProductsProps) {
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/recommendations/product/${productId}`);
      setFrequentlyBought(response.data.frequently_bought_together || []);
      setSimilarProducts(response.data.similar_products || []);
    } catch (err) {
      console.error('Failed to load recommendations', err);
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

  const hasRecommendations = frequentlyBought.length > 0 || similarProducts.length > 0;

  if (!hasRecommendations) {
    return null;
  }

  const renderProductCard = (product: Product) => {
    const imagePath = product.images?.[0]?.path || '/placeholder-product.jpg';

    return (
      <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
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
            <h4 className="font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-2">
              {product.name}
            </h4>
          </Link>

          {product.average_rating !== undefined && product.average_rating > 0 && (
            <div className="mb-2">
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
                <span className="font-bold text-green-600">
                  ${parseFloat(product.sale_price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-coffee">
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
  };

  return (
    <div className="space-y-12">
      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-coffee-dark mb-2">
              Frequently Bought Together
            </h3>
            <p className="text-gray-600">
              Customers who bought this item also bought
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBought.map(renderProductCard)}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-coffee-dark mb-2">
              You May Also Like
            </h3>
            <p className="text-gray-600">
              Similar products you might be interested in
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.map(renderProductCard)}
          </div>
        </div>
      )}
    </div>
  );
}
