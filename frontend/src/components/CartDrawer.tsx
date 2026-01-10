import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './ui';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, getSubtotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-coffee-dark">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
              <Link to="/shop" onClick={onClose}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product.effective_price || item.product.price;
                const variantModifier = item.variant?.price_modifier || 0;
                const itemPrice = price + variantModifier;
                const imageUrl =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images.find((img) => img.is_primary)?.path ||
                      item.product.images[0].path
                    : '/placeholder.png';

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                    className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                  >
                    {/* Product Image */}
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                      loading="lazy"
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-coffee-dark">
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">{item.variant.name}</p>
                      )}
                      <p className="text-coffee font-bold mt-1">
                        ${itemPrice.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.variant?.id
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
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
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.variant?.id)
                          }
                          className="ml-auto text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Subtotal and Checkout */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">
                Subtotal:
              </span>
              <span className="text-2xl font-bold text-coffee">
                ${getSubtotal().toFixed(2)}
              </span>
            </div>
            <Link to="/cart" onClick={onClose}>
              <Button className="w-full mb-2">View Cart</Button>
            </Link>
            <Link to="/checkout" onClick={onClose}>
              <Button className="w-full" variant="secondary">
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
