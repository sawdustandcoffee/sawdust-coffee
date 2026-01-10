import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { Product } from '../../types';
import { Button, Spinner, Badge } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/products/${slug}`);
      setProduct(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
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
                    <p className="text-gray-700 mb-4">This item is currently out of stock.</p>
                  </div>
                )}

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
        </div>
      </div>
    </PublicLayout>
  );
}
