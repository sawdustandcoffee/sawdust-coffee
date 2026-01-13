import { useEffect, useState } from 'react';
import { getProductImageUrl } from '../../lib/imageUtils';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { WishlistItem } from '../../types';
import { Button, Spinner } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get<WishlistItem[]>('/customer/wishlist');
      setWishlistItems(response.data);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      setRemovingId(productId);
      await api.delete(`/customer/wishlist/${productId}`);
      setWishlistItems(wishlistItems.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
      alert('Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (item.product) {
      addToCart(item.product, 1);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <Helmet>
          <title>My Wishlist - Sawdust & Coffee</title>
        </Helmet>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Helmet>
        <title>My Wishlist - Sawdust & Coffee</title>
      </Helmet>

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Account', path: '/customer/dashboard' },
          { label: 'Wishlist' },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save items you love to come back to them later!
          </p>
          <Link to="/shop">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            if (!item.product) return null;

            const product = item.product;
            const price = product.sale_price || product.price;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Product Image */}
                <Link to={`/shop/${product.slug}`} className="block">
                  <div className="aspect-square bg-gray-200 relative">
                    {product.images && product.images[0] ? (
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.images[0].alt_text || product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
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
                    {product.inventory === 0 && (
                      <div className="absolute top-2 left-2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Sold Out
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mb-4">
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

                  {/* Actions */}
                  <div className="space-y-2">
                    {product.inventory > 0 ? (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" disabled>
                        Out of Stock
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleRemove(product.id)}
                      disabled={removingId === product.id}
                    >
                      {removingId === product.id ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
