import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Product, ProductCategory, ProductTag, ProductBundle, PaginatedResponse } from '../../types';
import { Button, Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import RecentlyViewed from '../../components/RecentlyViewed';
import Breadcrumb, { BreadcrumbItem } from '../../components/Breadcrumb';
import SocialShare from '../../components/SocialShare';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useComparison } from '../../context/ComparisonContext';
import QuickViewModal from '../../components/QuickViewModal';
import ProductBadge from '../../components/ProductBadge';
import BundleCard from '../../components/BundleCard';
import SEO from '../../components/SEO';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'products' | 'bundles'>(
    searchParams.get('view') === 'bundles' ? 'bundles' : 'products'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [togglingWishlist, setTogglingWishlist] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const { addToCart } = useCart();
  const { user } = useCustomerAuth();
  const { addToComparison, isInComparison } = useComparison();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (view === 'products') {
      fetchProducts();
    } else {
      fetchBundles();
    }
  }, [view, page, selectedCategory, selectedTag, sortBy, searchQuery, priceMin, priceMax, inStockOnly, onSaleOnly]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistProductIds(new Set());
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/public/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/public/tags');
      setTags(response.data);
    } catch (err) {
      console.error('Failed to load tags', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/public/products?page=${page}&per_page=12`;

      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (sortBy === 'price_asc') {
        url += '&sort_by=price&sort_dir=asc';
      } else if (sortBy === 'price_desc') {
        url += '&sort_by=price&sort_dir=desc';
      } else if (sortBy === 'newest') {
        url += '&sort_by=created_at&sort_dir=desc';
      }

      if (priceMin) {
        url += `&price_min=${priceMin}`;
      }

      if (priceMax) {
        url += `&price_max=${priceMax}`;
      }

      if (inStockOnly) {
        url += '&in_stock=1';
      }

      if (onSaleOnly) {
        url += '&on_sale=1';
      }

      const response = await api.get<PaginatedResponse<Product>>(url);
      setProducts(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      setLoading(true);
      let url = '/public/bundles?';

      if (sortBy === 'price_low' || sortBy === 'price_asc') {
        url += 'sort=price_low';
      } else if (sortBy === 'price_high' || sortBy === 'price_desc') {
        url += 'sort=price_high';
      } else if (sortBy === 'newest') {
        url += 'sort=newest';
      } else {
        url += 'sort=ordered';
      }

      const response = await api.get<ProductBundle[]>(url);
      setBundles(response.data);
      setTotalPages(1); // Bundles aren't paginated
    } catch (err) {
      console.error('Failed to load bundles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/customer/wishlist');
      const productIds = new Set(response.data.map((item: any) => item.product_id));
      setWishlistProductIds(productIds);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      navigate('/customer/login');
      return;
    }

    try {
      setTogglingWishlist(productId);
      const isInWishlist = wishlistProductIds.has(productId);

      if (isInWishlist) {
        await api.delete(`/customer/wishlist/${productId}`);
        setWishlistProductIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await api.post('/customer/wishlist', { product_id: productId });
        setWishlistProductIds((prev) => new Set(prev).add(productId));
      }
    } catch (err) {
      console.error('Failed to update wishlist', err);
    } finally {
      setTogglingWishlist(null);
    }
  };

  const handleQuickView = async (product: Product) => {
    // Fetch full product details with options
    try {
      const response = await api.get(`/public/products/${product.slug}`);
      setQuickViewProduct(response.data);
      setIsQuickViewOpen(true);
    } catch (err) {
      console.error('Failed to load product details', err);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Shop"
        description="Shop handcrafted woodworking products from Sawdust & Coffee. Browse custom furniture, live edge tables, CNC signs, laser engraving, and more from Wareham, MA."
        keywords="buy woodworking, custom furniture for sale, live edge tables, CNC signs, handmade furniture, Massachusetts woodworking shop"
      />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Shop' },
              ...(selectedCategory && categories.length > 0
                ? [{
                    label: categories.find((c) => c.id.toString() === selectedCategory)?.name || 'Category',
                  }]
                : []),
            ]}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-coffee-dark mb-2">Shop</h1>
            <p className="text-lg text-gray-600">
              Browse our collection of handcrafted pieces
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => {
                  setView('products');
                  setSearchParams({});
                  setPage(1);
                }}
                className={`px-6 py-3 font-medium transition ${
                  view === 'products'
                    ? 'bg-coffee text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => {
                  setView('bundles');
                  setSearchParams({ view: 'bundles' });
                  setPage(1);
                }}
                className={`px-6 py-3 font-medium transition ${
                  view === 'bundles'
                    ? 'bg-coffee text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bundles
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Products
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Button type="submit">Search</Button>
                {searchQuery && (
                  <Button type="button" variant="secondary" onClick={handleClearSearch}>
                    Clear
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing results for: <strong>"{searchQuery}"</strong>
                </p>
              )}
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Style</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedTag === ''
                        ? 'bg-coffee text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Styles
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTag(tag.slug);
                        setPage(1);
                      }}
                      style={{
                        backgroundColor: selectedTag === tag.slug ? tag.color : undefined,
                        borderColor: tag.color,
                        color: selectedTag === tag.slug ? '#ffffff' : tag.color,
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
                        selectedTag === tag.slug
                          ? 'shadow-md'
                          : 'bg-white hover:bg-opacity-10'
                      }`}
                    >
                      {tag.name}
                      {tag.products_count !== undefined && ` (${tag.products_count})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Advanced Filters</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => {
                        setPriceMin(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coffee"
                      min="0"
                      step="1"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => {
                        setPriceMax(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coffee"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="mr-2 w-4 h-4 text-coffee border-gray-300 rounded focus:ring-coffee"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      In Stock Only
                    </span>
                  </label>
                </div>

                {/* On Sale Only */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => {
                        setOnSaleOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="mr-2 w-4 h-4 text-coffee border-gray-300 rounded focus:ring-coffee"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      On Sale Only
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(selectedCategory || selectedTag || priceMin || priceMax || inStockOnly || onSaleOnly) && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedTag('');
                      setPriceMin('');
                      setPriceMax('');
                      setInStockOnly(false);
                      setOnSaleOnly(false);
                      setPage(1);
                    }}
                  >
                    Clear Advanced Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Products/Bundles Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : view === 'bundles' ? (
            bundles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">
                  No bundles available. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No products found. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    {/* Image - Clickable */}
                    <Link to={`/shop/${product.slug}`} className="block">
                      <div className="aspect-square bg-gray-200 relative">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].path}
                            alt={product.images[0].alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          disabled={togglingWishlist === product.id}
                          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition disabled:opacity-50 z-10"
                          title={wishlistProductIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          {wishlistProductIds.has(product.id) ? (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </button>
                        {/* Comparison Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToComparison(product);
                          }}
                          className={`absolute top-14 left-2 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition z-10 ${
                            isInComparison(product.id) ? 'ring-2 ring-coffee' : ''
                          }`}
                          title={isInComparison(product.id) ? 'In comparison' : 'Add to comparison'}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              isInComparison(product.id) ? 'text-coffee' : 'text-gray-400'
                            }`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </button>
                        {/* Share Button */}
                        <div
                          className="absolute top-26 left-2 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <SocialShare
                            url={`${window.location.origin}/shop/${product.slug}`}
                            title={product.name}
                            description={product.description || ''}
                            imageUrl={
                              product.images && product.images.length > 0
                                ? product.images[0].path
                                : ''
                            }
                            size="sm"
                          />
                        </div>
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                          {product.sale_price && (
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              Sale
                            </div>
                          )}
                          {product.badges && product.badges.map((badge, index) => (
                            <ProductBadge key={index} badge={badge} size="sm" />
                          ))}
                        </div>
                        {product.inventory === 0 && (
                          <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Sold Out
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <Link to={`/shop/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-coffee transition line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              style={{ backgroundColor: tag.color }}
                              className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {product.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-500">
                              +{product.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
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

                      {/* Quick View Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full mb-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(product);
                        }}
                      >
                        Quick View
                      </Button>

                      {/* Add to Cart Button */}
                      {product.inventory > 0 ? (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Recently Viewed */}
          <div className="mt-12">
            <RecentlyViewed limit={8} />
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </PublicLayout>
  );
}
