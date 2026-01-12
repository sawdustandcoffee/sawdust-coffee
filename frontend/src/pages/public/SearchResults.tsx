import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Product, ProductCategory, ProductTag, PaginatedResponse } from '../../types';
import { Button, Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import { useCart } from '../../context/CartContext';
import SEO from '../../components/SEO';

interface SearchFacets {
  categories: ProductCategory[];
  tags: ProductTag[];
  price_range: {
    min: number;
    max: number;
  };
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();

  const query = searchParams.get('q') || '';
  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sortBy = searchParams.get('sort') || 'relevance';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const onSaleOnly = searchParams.get('on_sale') === 'true';

  useEffect(() => {
    fetchResults();
  }, [searchParams, page]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params: any = {
        q: query,
        page,
        per_page: 24,
        sort: sortBy,
      };

      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }
      if (inStockOnly) {
        params.in_stock = 'true';
      }
      if (onSaleOnly) {
        params.on_sale = 'true';
      }

      const response = await api.get('/public/search', { params });
      setProducts(response.data.products.data);
      setTotalPages(response.data.products.last_page);
      setFacets(response.data.facets);
    } catch (err) {
      console.error('Failed to fetch search results', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    newParams.delete('page');
    setSearchParams(newParams);
    setPage(1);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      newParams.set('categories', newCategories.join(','));
    } else {
      newParams.delete('categories');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setPage(1);
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    const newParams = new URLSearchParams(searchParams);
    if (newTags.length > 0) {
      newParams.set('tags', newTags.join(','));
    } else {
      newParams.delete('tags');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setPage(1);
  };

  const toggleFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentValue = newParams.get(key) === 'true';
    if (currentValue) {
      newParams.delete(key);
    } else {
      newParams.set(key, 'true');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setPage(1);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    setSearchParams(newParams);
    setPage(1);
  };

  const hasFilters = selectedCategories.length > 0 || selectedTags.length > 0 || inStockOnly || onSaleOnly;

  return (
    <PublicLayout>
      <SEO
        title={`Search Results for "${query}"`}
        description={`Find products matching "${query}" at Sawdust & Coffee`}
      />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Shop', path: '/shop' }, { label: 'Search Results' }]} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-dark mb-2">
              Search Results {query && `for "${query}"`}
            </h1>
            {!loading && (
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-coffee hover:text-coffee-dark"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={() => toggleFilter('in_stock')}
                        className="mr-2 w-4 h-4 text-coffee border-gray-300 rounded focus:ring-coffee"
                      />
                      <span className="text-sm text-gray-700">In Stock Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={() => toggleFilter('on_sale')}
                        className="mr-2 w-4 h-4 text-coffee border-gray-300 rounded focus:ring-coffee"
                      />
                      <span className="text-sm text-gray-700">On Sale</span>
                    </label>
                  </div>
                </div>

                {/* Categories */}
                {facets && facets.categories.length > 0 && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {facets.categories.map((category) => (
                        <label key={category.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id.toString())}
                            onChange={() => toggleCategory(category.id.toString())}
                            className="mr-2 w-4 h-4 text-coffee border-gray-300 rounded focus:ring-coffee"
                          />
                          <span className="text-sm text-gray-700">
                            {category.name}
                            {category.products_count !== undefined && (
                              <span className="text-gray-500 ml-1">({category.products_count})</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {facets && facets.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {facets.tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id.toString())}
                          style={{
                            backgroundColor: selectedTags.includes(tag.id.toString())
                              ? tag.color
                              : 'white',
                            borderColor: tag.color,
                            color: selectedTags.includes(tag.id.toString()) ? 'white' : tag.color,
                          }}
                          className="px-3 py-1 text-xs font-medium border-2 rounded-full transition hover:opacity-80"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                  <p className="text-xl text-gray-600 mb-4">No products found matching your search.</p>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                  <Link to="/shop">
                    <Button>Browse All Products</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const imagePath = product.images?.[0]?.path || '/placeholder-product.jpg';

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                        >
                          <Link to={`/shop/${product.slug}`}>
                            <div className="aspect-square bg-gray-100">
                              <img
                                src={imagePath}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              />
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link to={`/shop/${product.slug}`}>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-coffee transition line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>

                            {product.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            {product.average_rating !== undefined && product.average_rating > 0 && (
                              <div className="mb-3">
                                <StarRating
                                  rating={product.average_rating}
                                  readonly
                                  size="sm"
                                  showCount
                                  count={product.review_count}
                                />
                              </div>
                            )}

                            <div className="mb-3">
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
                          </div>
                        </div>
                      );
                    })}
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
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
