import { useEffect, useState } from 'react';
import { getProductImageUrl } from '../../lib/imageUtils';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { Product } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import RelatedProducts from '../../components/RelatedProducts';
import ProductBadge from '../../components/ProductBadge';
import Breadcrumb from '../../components/Breadcrumb';
import SocialShare from '../../components/SocialShare';
import ImageLightbox from '../../components/ImageLightbox';
import ProductQuestions from '../../components/ProductQuestions';
import ProductSpecifications from '../../components/ProductSpecifications';
import ProductReviews from '../../components/ProductReviews';
import RecommendedProducts from '../../components/RecommendedProducts';
import { useCart, SelectedOption } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useComparison } from '../../context/ComparisonContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('ProductDetail mounted, slug:', slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [stockNotificationEmail, setStockNotificationEmail] = useState('');
  const [isSubscribedToStock, setIsSubscribedToStock] = useState(false);
  const [stockNotificationSubmitting, setStockNotificationSubmitting] = useState(false);
  const [stockNotificationMessage, setStockNotificationMessage] = useState('');
  const [stockNotificationSuccess, setStockNotificationSuccess] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const { addToCart } = useCart();
  const { user } = useCustomerAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToComparison, isInComparison } = useComparison();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (product) {
      if (user) {
        checkWishlist();
        // Set default email for stock notifications if user is logged in (only once)
        setStockNotificationEmail(prev => prev || user.email);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, user]);

  useEffect(() => {
    if (product && stockNotificationEmail && product.inventory === 0) {
      checkStockNotificationStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockNotificationEmail, product?.id]);

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

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, undefined, selectedOptions.length > 0 ? selectedOptions : undefined);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
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
      ? getProductImageUrl(product)
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
          <Breadcrumb
            items={[
              { label: 'Shop', path: '/shop' },
              ...(product.categories && product.categories.length > 0
                ? [{ label: product.categories[0].name, path: `/shop?category=${product.categories[0].id}` }]
                : []),
              { label: product.name },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-lg shadow-lg p-8">
            {/* Images */}
            <div>
              {/* Main Image */}
              <div
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4 cursor-zoom-in relative group"
                onClick={() => {
                  if (hasImages) {
                    setLightboxInitialIndex(selectedImage);
                    setLightboxOpen(true);
                  }
                }}
              >
                {hasImages ? (
                  <>
                    <img
                      src={getProductImageUrl(product, selectedImage)}
                      alt={product.images![selectedImage].alt_text || product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Zoom Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                      <svg
                        className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </>
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
                        src={getProductImageUrl(product, index)}
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
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-coffee-dark flex-1">
                  {product.name}
                </h1>
                <SocialShare
                  url={`${window.location.origin}/shop/${product.slug}`}
                  title={product.name}
                  description={product.description || ''}
                  imageUrl={
                    product.images && product.images.length > 0
                      ? getProductImageUrl(product)
                      : ''
                  }
                  size="md"
                />
              </div>

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

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{ backgroundColor: tag.color }}
                      className="px-3 py-1 text-sm font-medium text-white rounded-full"
                    >
                      {tag.name}
                    </span>
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

          {/* Product Specifications & Care Instructions */}
          <ProductSpecifications
            specifications={product.specifications}
            careInstructions={product.care_instructions}
          />

          {/* Reviews Section */}
          <div className="mt-12">
            <ProductReviews
              productId={product.id}
              averageRating={product.average_rating || 0}
              reviewCount={product.review_count || 0}
            />
          </div>

          {/* Questions & Answers */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductQuestions productId={product.id} />
          </div>

          {/* Recommended Products */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <RecommendedProducts productId={product.id} />
          </div>

          {/* Related Products */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedProducts productId={product.id} />
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {hasImages && (
        <ImageLightbox
          images={product.images!}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          initialIndex={lightboxInitialIndex}
        />
      )}
    </PublicLayout>
  );
}
