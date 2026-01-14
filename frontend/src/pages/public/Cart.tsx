import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../lib/imageUtils';
import { Button } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';
import CartRecommendations from '../../components/CartRecommendations';
import PublicLayout from '../../layouts/PublicLayout';
import SEO from '../../components/SEO';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="bg-gray-50 min-h-screen py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-xl text-gray-600 mb-8">
              Start shopping to add items to your cart!
            </p>
            <Link to="/shop">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEO
        title="Shopping Cart"
        description="Review your shopping cart and proceed to checkout for custom woodworking products from Sawdust & Coffee."
      />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Cart' }]} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-coffee-dark mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{items.length} item(s) in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-6">
                  {items.map((item) => {
                    const price = typeof item.product.effective_price === 'number'
                      ? item.product.effective_price
                      : typeof item.product.price === 'number'
                      ? item.product.price
                      : 0;
                    const variantModifier = typeof item.variant?.price_modifier === 'number'
                      ? item.variant.price_modifier
                      : 0;
                    const itemPrice = price + variantModifier;
                    const imageUrl =
                      item.product.images && item.product.images.length > 0
                        ? item.product.images.find((img) => img.is_primary)?.path ||
                          getProductImageUrl(item.product)
                        : '/placeholder.png';

                    return (
                      <div
                        key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                        className="flex gap-6 pb-6 border-b last:border-b-0 last:pb-0"
                      >
                        {/* Product Image */}
                        <Link
                          to={`/shop/${item.product.slug}`}
                          className="flex-shrink-0"
                        >
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-32 h-32 object-cover rounded-lg hover:opacity-75 transition"
                            loading="lazy"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link to={`/shop/${item.product.slug}`}>
                            <h3 className="text-xl font-semibold text-coffee-dark hover:text-coffee transition">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-gray-600 mt-1">
                              Variant: {item.variant.name}
                            </p>
                          )}
                          <p className="text-lg font-bold text-coffee mt-2">
                            ${itemPrice.toFixed(2)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    item.variant?.id
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-lg font-semibold"
                              >
                                -
                              </button>
                              <span className="text-lg font-semibold w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    item.variant?.id
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-lg font-semibold"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeFromCart(item.product.id, item.variant?.id)
                              }
                              className="text-red-500 hover:text-red-700 font-medium transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-coffee">
                            ${(itemPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Cart */}
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link to="/shop">
                  <Button variant="secondary" size="lg">
                    ← Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-coffee-dark mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">Total:</span>
                    <span className="text-3xl font-bold text-coffee">
                      ${getSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    (Tax and shipping calculated at checkout)
                  </p>
                </div>

                <Link to="/checkout">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 text-center">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Recommendations */}
          {items.length > 0 && (
            <div className="mt-12">
              <CartRecommendations
                cartProductIds={items.map((item) => item.product.id)}
              />
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
