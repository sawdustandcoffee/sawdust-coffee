import { Link } from 'react-router-dom';
import { ProductBundle } from '../types';

interface BundleCardProps {
  bundle: ProductBundle;
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const imagePath = bundle.image_path
    ? `${import.meta.env.VITE_API_URL}/storage/${bundle.image_path}`
    : '/placeholder-product.jpg';

  return (
    <Link
      to={`/bundles/${bundle.slug}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
    >
      {/* Bundle Image */}
      <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
        <img
          src={imagePath}
          alt={bundle.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
        />
        {/* Bundle Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-coffee text-white px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md">
            Bundle
          </span>
        </div>
        {/* Savings Badge */}
        {bundle.savings_percentage > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md">
              Save {bundle.savings_percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Bundle Details */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-coffee-dark mb-2 group-hover:text-coffee transition">
          {bundle.name}
        </h3>

        {bundle.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {bundle.description}
          </p>
        )}

        {/* Product Count */}
        {bundle.products && bundle.products.length > 0 && (
          <p className="text-xs text-gray-500 mb-3">
            {bundle.products.length} {bundle.products.length === 1 ? 'item' : 'items'} included
          </p>
        )}

        {/* Pricing */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-coffee">
              ${parseFloat(bundle.bundle_price).toFixed(2)}
            </span>
            {bundle.savings_amount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ${bundle.regular_price.toFixed(2)}
              </span>
            )}
          </div>

          {bundle.savings_amount > 0 && (
            <p className="text-sm font-semibold text-green-600">
              You save ${bundle.savings_amount.toFixed(2)}
            </p>
          )}
        </div>

        {/* View Details Button */}
        <button className="mt-4 w-full bg-coffee text-white py-2 px-4 rounded-lg hover:bg-coffee-dark transition duration-300 font-medium">
          View Bundle
        </button>
      </div>
    </Link>
  );
}
