import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ProductBundle } from '../../types';
import Breadcrumb from '../../components/Breadcrumb';
import SocialShare from '../../components/SocialShare';
import { useCart } from '../../context/CartContext';

export default function BundleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [bundle, setBundle] = useState<ProductBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/public/bundles/${slug}`);
        setBundle(response.data);
      } catch (err: any) {
        console.error('Failed to load bundle', err);
        setError('Bundle not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBundle();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!bundle || !bundle.products) return;

    setAddingToCart(true);
    setSuccessMessage('');

    try {
      // Add all products in the bundle to cart
      for (const product of bundle.products) {
        const quantity = (product as any).pivot?.quantity || 1;
        await addToCart(product.id, quantity);
      }

      setSuccessMessage('Bundle added to cart successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Failed to add bundle to cart', err);
      setError('Failed to add bundle to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/shop"
            className="inline-block bg-coffee text-white px-6 py-3 rounded-lg hover:bg-coffee-dark transition"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const imagePath = bundle.image_path
    ? `${import.meta.env.VITE_API_URL}/storage/${bundle.image_path}`
    : '/placeholder-product.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb
        items={[
          { label: 'Shop', path: '/shop' },
          { label: 'Bundles', path: '/shop?view=bundles' },
          { label: bundle.name },
        ]}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Bundle Image */}
        <div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
            <div className="relative">
              <img
                src={imagePath}
                alt={bundle.name}
                className="w-full h-auto object-cover"
              />
              {bundle.savings_percentage > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-red-600 text-white px-4 py-2 text-sm font-bold uppercase rounded-full shadow-lg">
                    Save {bundle.savings_percentage.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bundle Details */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <span className="inline-block bg-coffee text-white px-3 py-1 text-xs font-bold uppercase rounded-full mb-4">
                Product Bundle
              </span>
              <h1 className="text-3xl font-bold text-coffee-dark mb-2">
                {bundle.name}
              </h1>
              {bundle.description && (
                <p className="text-gray-600">{bundle.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="border-t border-b py-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-coffee">
                  ${parseFloat(bundle.bundle_price).toFixed(2)}
                </span>
                {bundle.savings_amount > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    ${bundle.regular_price.toFixed(2)}
                  </span>
                )}
              </div>

              {bundle.savings_amount > 0 && (
                <div className="text-lg font-semibold text-green-600">
                  You save ${bundle.savings_amount.toFixed(2)} ({bundle.savings_percentage.toFixed(0)}% off)
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition duration-300 mb-4 ${
                addingToCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-coffee text-white hover:bg-coffee-dark'
              }`}
            >
              {addingToCart ? 'Adding to Cart...' : 'Add Bundle to Cart'}
            </button>

            {/* Social Share */}
            <div className="flex justify-center">
              <SocialShare
                url={window.location.href}
                title={bundle.name}
                description={bundle.description}
                image={imagePath}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Description */}
      {bundle.long_description && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-coffee-dark mb-4">About This Bundle</h2>
          <div className="prose max-w-none text-gray-700">
            <p className="whitespace-pre-line">{bundle.long_description}</p>
          </div>
        </div>
      )}

      {/* Included Products */}
      {bundle.products && bundle.products.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-coffee-dark mb-6">
            Included Products ({bundle.products.length} items)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundle.products.map((product) => {
              const productImage = product.images?.[0]?.path
                ? `${import.meta.env.VITE_API_URL}/storage/${product.images[0].path}`
                : '/placeholder-product.jpg';
              const quantity = (product as any).pivot?.quantity || 1;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="border rounded-lg p-4 hover:shadow-md transition group"
                >
                  <div className="aspect-w-1 aspect-h-1 mb-3">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded group-hover:opacity-75 transition"
                    />
                  </div>
                  <h3 className="font-semibold text-coffee-dark mb-1 group-hover:text-coffee transition">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Qty: {quantity}
                  </p>
                  <p className="text-coffee font-bold">
                    ${parseFloat(product.price).toFixed(2)}
                    {product.sale_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
