import { useState, useEffect } from 'react';
import { getProductImageUrl } from '../lib/imageUtils';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart, SelectedOption } from '../context/CartContext';
import { Button } from './ui';
import ProductBadge from './ProductBadge';
import SocialShare from './SocialShare';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, undefined, selectedOptions.length > 0 ? selectedOptions : undefined);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setQuantity(1);
      setSelectedOptions([]);
    }, 1500);
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.sale_price || product.price);
    const optionsModifier = selectedOptions.reduce((sum, opt) => sum + opt.priceModifier, 0);
    return (basePrice + optionsModifier).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl transform transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                  {/* Left: Images */}
                  <div>
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                      {product.images && product.images[selectedImage] ? (
                        <img
                          src={product.images[selectedImage].path}
                          alt={product.images[selectedImage].alt_text || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square rounded overflow-hidden border-2 transition ${
                              selectedImage === index
                                ? 'border-coffee'
                                : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.path}
                              alt={image.alt_text || product.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Info */}
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-2xl font-bold text-coffee-dark flex-1">
                        {product.name}
                      </h2>
                      <SocialShare
                        url={`${window.location.origin}/shop/${product.slug}`}
                        title={product.name}
                        description={product.description || ''}
                        imageUrl={
                          product.images && product.images.length > 0
                            ? getProductImageUrl(product)
                            : ''
                        }
                        size="sm"
                      />
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {product.sale_price ? (
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-green-600">
                            ${calculateTotalPrice()}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-coffee">
                          ${calculateTotalPrice()}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Categories */}
                    {product.categories && product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-3 py-1 bg-coffee-light text-coffee-dark text-xs font-medium rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Product Badges */}
                    {product.badges && product.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.badges.map((badge, index) => (
                          <ProductBadge key={index} badge={badge} size="sm" />
                        ))}
                      </div>
                    )}

                    {/* Options */}
                    {product.options && product.options.length > 0 && (
                      <div className="mb-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Customize
                        </h3>
                        {product.options.map((option) => (
                          <div key={option.id} className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {option.name}
                            </label>

                            {option.type === 'select' && option.values && (
                              <select
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coffee"
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
                                <option value="">Select...</option>
                                {option.values.map((value) => (
                                  <option key={value.id} value={value.value}>
                                    {value.value}
                                    {parseFloat(value.price_modifier) !== 0 &&
                                      ` (+$${parseFloat(value.price_modifier).toFixed(2)})`}
                                  </option>
                                ))}
                              </select>
                            )}

                            {option.type === 'text' && (
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coffee"
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

                    {/* Inventory Status */}
                    <div className="mb-4">
                      {product.inventory > 0 ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          In Stock ({product.inventory} available)
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Quantity */}
                    {product.inventory > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-3">
                      {product.inventory > 0 ? (
                        <Button
                          size="lg"
                          className="w-full"
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
                            'Add to Cart'
                          )}
                        </Button>
                      ) : (
                        <Button size="lg" className="w-full" disabled>
                          Out of Stock
                        </Button>
                      )}

                      <Link
                        to={`/shop/${product.slug}`}
                        className="block text-center py-2 text-coffee hover:text-coffee-dark font-semibold transition"
                        onClick={onClose}
                      >
                        View Full Details →
                      </Link>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
}
