import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { Product, ProductReview, PaginatedResponse } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import RelatedProducts from '../../components/RelatedProducts';
import ProductBadge from '../../components/ProductBadge';
import { useCart, SelectedOption } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useComparison } from '../../context/ComparisonContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [stockNotificationEmail, setStockNotificationEmail] = useState('');
  const [isSubscribedToStock, setIsSubscribedToStock] = useState(false);
  const [stockNotificationSubmitting, setStockNotificationSubmitting] = useState(false);
  const [stockNotificationMessage, setStockNotificationMessage] = useState('');
  const [stockNotificationSuccess, setStockNotificationSuccess] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const { addToCart } = useCart();
  const { user } = useCustomerAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToComparison, isInComparison } = useComparison();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      if (user) {
        checkWishlist();
      }
      // Set default email for stock notifications if user is logged in
      if (user) {
        setStockNotificationEmail(user.email);
      }
      // Check if email is subscribed to stock notifications
      if (stockNotificationEmail && product.inventory === 0) {
        checkStockNotificationStatus();
      }
    }
  }, [product, user]);

  useEffect(() => {
    if (product && stockNotificationEmail && product.inventory === 0) {
      checkStockNotificationStatus();
    }
  }, [stockNotificationEmail]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/products/${slug}`);
      setProduct(response.data);
      setError('');

      // Add to recently viewed
      addToRecentlyViewed(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!product) return;

    try {
      setReviewsLoading(true);
      const response = await api.get<{
        reviews: PaginatedResponse<ProductReview>;
        average_rating: number;
        review_count: number;
      }>(`/public/products/${product.id}/reviews`);
      setReviews(response.data.reviews.data);
      setAverageRating(response.data.average_rating);
      setReviewCount(response.data.review_count);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, undefined, selectedOptions.length > 0 ? selectedOptions : undefined);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    setReviewError('');
    setReviewSuccess('');

    try {
      setReviewSubmitting(true);
      await api.post(`/customer/products/${product.id}/reviews`, {
        rating: reviewRating,
        review_text: reviewText,
      });

      setReviewSuccess('Thank you for your review! It will be published after approval.');
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);

      // Optionally refresh reviews (though new review won't show until approved)
      // fetchReviews();
    } catch (err: any) {
      setReviewError(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const checkWishlist = async () => {
    if (!product || !user) return;

    try {
      const response = await api.get(`/customer/wishlist/check/${product.id}`);
      setInWishlist(response.data.in_wishlist);
    } catch (err) {
      console.error('Failed to check wishlist', err);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;

    try {
      setTogglingWishlist(true);

      if (inWishlist) {
        await api.delete(`/customer/wishlist/${product.id}`);
        setInWishlist(false);
      } else {
        await api.post('/customer/wishlist', { product_id: product.id });
        setInWishlist(true);
      }
    } catch (err) {
      console.error('Failed to update wishlist', err);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const checkStockNotificationStatus = async () => {
    if (!product || !stockNotificationEmail) return;

    try {
      const response = await api.post(`/public/stock-notifications/check/${product.id}`, {
        email: stockNotificationEmail,
      });
      setIsSubscribedToStock(response.data.is_subscribed);
    } catch (err) {
      console.error('Failed to check stock notification status', err);
    }
  };

  const handleStockNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setStockNotificationMessage('');
    setStockNotificationSuccess(false);

    try {
      setStockNotificationSubmitting(true);
      const response = await api.post('/public/stock-notifications/subscribe', {
        product_id: product.id,
        email: stockNotificationEmail,
      });

      setStockNotificationMessage(response.data.message);
      setStockNotificationSuccess(true);
      setIsSubscribedToStock(true);
    } catch (err: any) {
      setStockNotificationMessage(
        err.response?.data?.message || 'Failed to subscribe to notifications.'
      );
      setStockNotificationSuccess(false);
    } finally {
      setStockNotificationSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const hasImages = product.images && product.images.length > 0;

  // Generate JSON-LD structured data for SEO
  const generateStructuredData = () => {
    const price = product.sale_price || product.price;
    const imageUrl = hasImages
      ? product.images![0].path
      : 'https://www.sawdustandcoffee.com/placeholder.png';

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.long_description || '',
      image: imageUrl,
      sku: product.sku || undefined,
      brand: {
        '@type': 'Brand',
        name: 'Sawdust & Coffee Woodworking'
      },
      offers: {
        '@type': 'Offer',
        url: `https://www.sawdustandcoffee.com/shop/${product.slug}`,
        priceCurrency: 'USD',
        price: parseFloat(price).toFixed(2),
        availability: product.inventory > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Sawdust & Coffee Woodworking'
        }
      }
    };
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>{product.name} - Sawdust & Coffee</title>
        <meta name="description" content={product.description || product.name} />
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <Link to="/" className="text-coffee hover:underline">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/shop" className="text-coffee hover:underline">
              Shop
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-lg shadow-lg p-8">
            {/* Images */}
            <div>
              {/* Main Image */}
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                {hasImages ? (
                  <img
                    src={product.images![selectedImage].path}
                    alt={product.images![selectedImage].alt_text || product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xl">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {hasImages && product.images!.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images!.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-coffee'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.path}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-coffee-dark mb-4">
                {product.name}
              </h1>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.categories.map((category) => (
                    <Badge key={category.id} variant="info">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Product Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.badges.map((badge, index) => (
                    <ProductBadge key={index} badge={badge} size="md" />
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                {product.sale_price ? (
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-green-600">
                      ${parseFloat(product.sale_price).toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <Badge variant="danger">On Sale!</Badge>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-coffee">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inventory > 0 ? (
                  <Badge variant="success">
                    {product.inventory} in stock
                  </Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Long Description */}
              {product.long_description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Details
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.long_description}
                  </div>
                </div>
              )}

              {/* SKU */}
              {product.sku && (
                <div className="mb-6 text-sm text-gray-600">
                  SKU: {product.sku}
                </div>
              )}

              {/* Product Options */}
              {product.options && product.options.length > 0 && (
                <div className="mb-6 border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Customize Your Selection
                  </h2>
                  {product.options.map((option) => (
                    <div key={option.id} className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {option.name} {option.required && <span className="text-red-500">*</span>}
                      </label>

                      {option.type === 'select' && option.values && (
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                          value={selectedOptions.find((o) => o.optionId === option.id)?.value || ''}
                          onChange={(e) => {
                            const value = option.values!.find((v) => v.value === e.target.value);
                            if (value) {
                              setSelectedOptions((prev) => {
                                const filtered = prev.filter((o) => o.optionId !== option.id);
                                return [
                                  ...filtered,
                                  {
                                    optionId: option.id,
                                    optionName: option.name,
                                    valueId: value.id,
                                    value: value.value,
                                    priceModifier: parseFloat(value.price_modifier),
                                  },
                                ];
                              });
                            }
                          }}
                        >
                          <option value="">Select {option.name}...</option>
                          {option.values.map((value) => (
                            <option key={value.id} value={value.value}>
                              {value.value}
                              {parseFloat(value.price_modifier) !== 0 &&
                                ` (${parseFloat(value.price_modifier) > 0 ? '+' : ''}$${parseFloat(value.price_modifier).toFixed(2)})`}
                            </option>
                          ))}
                        </select>
                      )}

                      {option.type === 'radio' && option.values && (
                        <div className="space-y-2">
                          {option.values.map((value) => (
                            <label key={value.id} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`option-${option.id}`}
                                value={value.value}
                                checked={selectedOptions.find((o) => o.optionId === option.id)?.valueId === value.id}
                                onChange={() => {
                                  setSelectedOptions((prev) => {
                                    const filtered = prev.filter((o) => o.optionId !== option.id);
                                    return [
                                      ...filtered,
                                      {
                                        optionId: option.id,
                                        optionName: option.name,
                                        valueId: value.id,
                                        value: value.value,
                                        priceModifier: parseFloat(value.price_modifier),
                                      },
                                    ];
                                  });
                                }}
                                className="mr-2"
                              />
                              <span>
                                {value.value}
                                {parseFloat(value.price_modifier) !== 0 &&
                                  ` (+$${parseFloat(value.price_modifier).toFixed(2)})`}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {option.type === 'text' && (
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                          placeholder={`Enter ${option.name.toLowerCase()}...`}
                          value={selectedOptions.find((o) => o.optionId === option.id)?.value || ''}
                          onChange={(e) => {
                            setSelectedOptions((prev) => {
                              const filtered = prev.filter((o) => o.optionId !== option.id);
                              if (!e.target.value) return filtered;
                              return [
                                ...filtered,
                                {
                                  optionId: option.id,
                                  optionName: option.name,
                                  value: e.target.value,
                                  priceModifier: 0,
                                },
                              ];
                            });
                          }}
                        />
                      )}

                      {option.type === 'textarea' && (
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                          rows={4}
                          placeholder={`Enter ${option.name.toLowerCase()}...`}
                          value={selectedOptions.find((o) => o.optionId === option.id)?.value || ''}
                          onChange={(e) => {
                            setSelectedOptions((prev) => {
                              const filtered = prev.filter((o) => o.optionId !== option.id);
                              if (!e.target.value) return filtered;
                              return [
                                ...filtered,
                                {
                                  optionId: option.id,
                                  optionName: option.name,
                                  value: e.target.value,
                                  priceModifier: 0,
                                },
                              ];
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Cart */}
              <div className="border-t pt-6">
                {product.inventory > 0 ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-lg font-semibold"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-12 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(Math.min(product.inventory, quantity + 1))
                          }
                          className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-lg font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="lg"
                      className="w-full mb-4"
                      onClick={handleAddToCart}
                    >
                      {addedToCart ? (
                        <>
                          <svg
                            className="w-5 h-5 inline mr-2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 inline mr-2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-700 mb-4 font-semibold">This item is currently out of stock.</p>

                    {/* Stock Notification Form */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Get Notified When Back in Stock
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Enter your email and we'll notify you as soon as this product is available again.
                      </p>

                      {!isSubscribedToStock ? (
                        <form onSubmit={handleStockNotificationSubmit}>
                          <div className="mb-3">
                            <input
                              type="email"
                              value={stockNotificationEmail}
                              onChange={(e) => setStockNotificationEmail(e.target.value)}
                              placeholder="your@email.com"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                            />
                          </div>
                          <Button
                            type="submit"
                            size="md"
                            className="w-full"
                            disabled={stockNotificationSubmitting}
                          >
                            {stockNotificationSubmitting ? 'Subscribing...' : 'Notify Me'}
                          </Button>
                        </form>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                            You'll be notified when this product is back in stock!
                          </p>
                        </div>
                      )}

                      {stockNotificationMessage && (
                        <div
                          className={`mt-3 p-3 rounded-lg ${
                            stockNotificationSuccess
                              ? 'bg-green-50 border border-green-200 text-green-800'
                              : 'bg-red-50 border border-red-200 text-red-800'
                          }`}
                        >
                          <p className="text-sm">{stockNotificationMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Wishlist Button */}
                {user && (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full mb-4"
                    onClick={toggleWishlist}
                    disabled={togglingWishlist}
                  >
                    {inWishlist ? (
                      <>
                        <svg
                          className="w-5 h-5 inline mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        Remove from Wishlist
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 inline mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Add to Wishlist
                      </>
                    )}
                  </Button>
                )}

                {/* Comparison Button */}
                <Button
                  size="lg"
                  variant={isInComparison(product.id) ? 'primary' : 'secondary'}
                  className="w-full mb-4"
                  onClick={() => addToComparison(product)}
                >
                  {isInComparison(product.id) ? (
                    <>
                      <svg
                        className="w-5 h-5 inline mr-2"
                        fill="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      In Comparison
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 inline mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Add to Comparison
                    </>
                  )}
                </Button>

                {/* Contact CTA */}
                <p className="text-gray-600 text-sm mb-2">
                  Need customization or have questions?
                </p>
                <Link to="/contact">
                  <Button variant="secondary" size="lg" className="w-full">
                    Contact Us About This Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Shop */}
          <div className="mt-8">
            <Link to="/shop">
              <Button variant="secondary">← Back to Shop</Button>
            </Link>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-coffee-dark mb-2">
                Customer Reviews
              </h2>
              {reviewCount > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-xl font-semibold text-gray-700">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              )}
            </div>

            {/* Write a Review */}
            {user ? (
              <div className="mb-8 border-b pb-8">
                {reviewSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {reviewSuccess}
                  </div>
                )}

                {!showReviewForm ? (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Write Your Review
                    </h3>

                    {reviewError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {reviewError}
                      </div>
                    )}

                    {/* Rating Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rating *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <svg
                              className={`w-8 h-8 cursor-pointer transition ${
                                star <= reviewRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 hover:text-yellow-200'
                              }`}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                        <span className="ml-2 text-gray-700">
                          {reviewRating} {reviewRating === 1 ? 'star' : 'stars'}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Review (optional)
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        placeholder="Share your experience with this product..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {reviewText.length}/1000 characters
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewError('');
                          setReviewText('');
                          setReviewRating(5);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-700">
                  <Link to="/customer/login" className="text-coffee hover:underline font-semibold">
                    Sign in
                  </Link>{' '}
                  to write a review
                </p>
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No reviews yet.</p>
                {user && (
                  <p className="text-gray-600">Be the first to review this product!</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {review.reviewer_name}
                          </span>
                          {review.is_verified_purchase && (
                            <Badge variant="success" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-700 mt-2 leading-relaxed">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedProducts productId={product.id} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
