import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../lib/imageUtils';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { Button } from './ui';
import { useCart } from '../context/CartContext';

interface RecentlyViewedProps {
  limit?: number;
  showTitle?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export default function RecentlyViewed({
  limit = 8,
  showTitle = true,
  orientation = 'horizontal',
}: RecentlyViewedProps) {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();

  const displayedProducts = recentlyViewed.slice(0, limit);

  if (displayedProducts.length === 0) {
    return null;
  }

  const gridClass =
    orientation === 'horizontal'
      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'space-y-4';

  return (
    <div className="py-4">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Clear History
          </button>
        </div>
      )}

      <div className={gridClass}>
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className={`group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden ${
              orientation === 'vertical' ? 'flex gap-3' : ''
            }`}
          >
            {/* Image */}
            <Link
              to={`/shop/${product.slug}`}
              className={orientation === 'vertical' ? 'flex-shrink-0' : 'block'}
            >
              <div
                className={`bg-gray-200 relative overflow-hidden ${
                  orientation === 'vertical' ? 'w-24 h-24' : 'aspect-square'
                }`}
              >
                {product.images && product.images[0] ? (
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.images[0].alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                {product.sale_price && orientation === 'horizontal' && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                    Sale
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className={orientation === 'vertical' ? 'flex-1 py-2 pr-3' : 'p-3'}>
              <Link to={`/shop/${product.slug}`}>
                <h3
                  className={`font-semibold text-gray-900 group-hover:text-coffee transition ${
                    orientation === 'vertical' ? 'text-sm line-clamp-2' : 'text-sm mb-1 line-clamp-2'
                  }`}
                >
                  {product.name}
                </h3>
              </Link>

              {/* Price */}
              <div className="mb-2">
                {product.sale_price ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-green-600">
                      ${parseFloat(product.sale_price).toFixed(2)}
                    </span>
                    {orientation === 'horizontal' && (
                      <span className="text-xs text-gray-500 line-through">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-coffee">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              {orientation === 'horizontal' && (
                <>
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
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
