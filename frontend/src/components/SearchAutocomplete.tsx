import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Product, ProductCategory, ProductTag } from '../types';

interface SearchResults {
  products: Product[];
  categories: ProductCategory[];
  tags: ProductTag[];
}

interface SearchAutocompleteProps {
  onClose?: () => void;
}

export default function SearchAutocomplete({ onClose }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ products: [], categories: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }

    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], categories: [], tags: [] });
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchAutocomplete();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchAutocomplete = async () => {
    try {
      setLoading(true);
      const response = await api.get('/public/search/autocomplete', {
        params: { q: query },
      });
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to fetch autocomplete', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowResults(false);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const hasResults = results.products.length > 0 || results.categories.length > 0 || results.tags.length > 0;

  return (
    <div className="relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            placeholder="Search for products..."
            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee"></div>
            </div>
          )}
        </div>
      </form>

      {/* Results Dropdown */}
      {showResults && (query.length >= 2 || recentSearches.length > 0) && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Products</h3>
              <div className="space-y-2">
                {results.products.map((product) => {
                  const imagePath = product.images?.[0]?.path || '/placeholder-product.jpg';
                  return (
                    <Link
                      key={product.id}
                      to={`/shop/${product.slug}`}
                      onClick={() => onClose?.()}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition"
                    >
                      <img
                        src={imagePath}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-coffee font-semibold">
                          ${parseFloat(product.sale_price || product.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
              <div className="space-y-1">
                {results.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.id}`}
                    onClick={() => onClose?.()}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {results.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/shop?tag=${tag.slug}`}
                    onClick={() => onClose?.()}
                    style={{ backgroundColor: tag.color }}
                    className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-80 transition"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && !hasResults && (
            <div className="p-6 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {/* View All Results */}
          {hasResults && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => handleSearch(query)}
                className="w-full text-center text-sm font-medium text-coffee hover:text-coffee-dark transition"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
