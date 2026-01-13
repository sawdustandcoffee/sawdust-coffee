import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../lib/imageUtils';
import { useComparison } from '../context/ComparisonContext';

export default function ComparisonDrawer() {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();

  if (comparisonProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-coffee z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Product count and thumbnails */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-coffee"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="font-semibold text-gray-900">
                Compare ({comparisonProducts.length}/4)
              </span>
            </div>

            {/* Product thumbnails */}
            <div className="hidden md:flex items-center gap-2">
              {comparisonProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden group"
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Img</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition"
                    title="Remove from comparison"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Clear All
            </button>
            <Link
              to="/compare"
              className="px-6 py-2 bg-coffee text-white rounded-lg hover:bg-coffee-dark transition font-semibold"
            >
              Compare Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
