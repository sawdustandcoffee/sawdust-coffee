import { Link } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { useCart } from '../../context/CartContext';
import PublicLayout from '../../layouts/PublicLayout';
import { Button } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';
import SEO from '../../components/SEO';

export default function ProductComparison() {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();

  if (comparisonProducts.length === 0) {
    return (
      <PublicLayout>
        <SEO
          title="Product Comparison"
          description="Compare products side by side to make an informed decision."
        />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 mx-auto text-gray-400 mb-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                No Products to Compare
              </h1>
              <p className="text-gray-600 mb-8">
                Add products from the shop to start comparing them side by side.
              </p>
              <Link to="/shop">
                <Button size="lg">Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const comparisonRows = [
    { label: 'Product', key: 'name' },
    { label: 'Image', key: 'image' },
    { label: 'Price', key: 'price' },
    { label: 'Description', key: 'description' },
    { label: 'Categories', key: 'categories' },
    { label: 'Availability', key: 'inventory' },
    { label: 'Actions', key: 'actions' },
  ];

  return (
    <PublicLayout>
      <SEO
        title="Product Comparison"
        description="Compare products side by side to make an informed decision."
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Shop', path: '/shop' },
              { label: 'Compare' },
            ]}
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-coffee-dark">
                  Product Comparison
                </h1>
                <p className="text-gray-600 mt-1">
                  Comparing {comparisonProducts.length} product
                  {comparisonProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/shop">
                  <Button variant="secondary">Back to Shop</Button>
                </Link>
                <Button variant="secondary" onClick={clearComparison}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.key} className="border-b border-gray-200">
                    {/* Row Label */}
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-900 sticky left-0 z-10 min-w-[150px]">
                      {row.label}
                    </td>

                    {/* Product Columns */}
                    {comparisonProducts.map((product) => (
                      <td
                        key={product.id}
                        className="px-6 py-4 text-center align-top min-w-[250px]"
                      >
                        {/* Product Name */}
                        {row.key === 'name' && (
                          <div>
                            <Link
                              to={`/shop/${product.slug}`}
                              className="text-lg font-semibold text-coffee hover:text-coffee-dark transition"
                            >
                              {product.name}
                            </Link>
                            <button
                              onClick={() => removeFromComparison(product.id)}
                              className="block mt-2 text-sm text-red-600 hover:text-red-700 mx-auto"
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        {/* Product Image */}
                        {row.key === 'image' && (
                          <Link to={`/shop/${product.slug}`} className="block">
                            <div className="aspect-square bg-gray-200 rounded overflow-hidden max-w-xs mx-auto">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0].path}
                                  alt={product.images[0].alt_text || product.name}
                                  className="w-full h-full object-cover hover:scale-105 transition"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">No Image</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        )}

                        {/* Price */}
                        {row.key === 'price' && (
                          <div>
                            {product.sale_price ? (
                              <div>
                                <div className="text-2xl font-bold text-green-600">
                                  ${parseFloat(product.sale_price).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500 line-through">
                                  ${parseFloat(product.price).toFixed(2)}
                                </div>
                                <span className="inline-block mt-1 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                                  Sale
                                </span>
                              </div>
                            ) : (
                              <div className="text-2xl font-bold text-coffee">
                                ${parseFloat(product.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {row.key === 'description' && (
                          <p className="text-sm text-gray-600 text-left">
                            {product.description || 'No description available'}
                          </p>
                        )}

                        {/* Categories */}
                        {row.key === 'categories' && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {product.categories && product.categories.length > 0 ? (
                              product.categories.map((category) => (
                                <span
                                  key={category.id}
                                  className="px-3 py-1 bg-coffee-light text-coffee-dark text-xs font-medium rounded-full"
                                >
                                  {category.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                No categories
                              </span>
                            )}
                          </div>
                        )}

                        {/* Inventory */}
                        {row.key === 'inventory' && (
                          <div>
                            {product.inventory > 0 ? (
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                In Stock ({product.inventory})
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        {row.key === 'actions' && (
                          <div className="space-y-2">
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
                            <Link to={`/shop/${product.slug}`}>
                              <Button size="sm" variant="secondary" className="w-full">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center text-gray-600">
            <p>
              You can compare up to 4 products at once. Add more products from the{' '}
              <Link to="/shop" className="text-coffee hover:text-coffee-dark font-semibold">
                shop
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
