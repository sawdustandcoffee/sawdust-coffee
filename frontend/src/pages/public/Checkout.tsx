import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button, Input } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import api from '../../lib/axios';

export default function Checkout() {
  const { items, getSubtotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    customer_phone: '',
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="bg-gray-50 min-h-screen py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <Link to="/shop">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Prepare cart items for checkout
      const cartItems = items.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant?.id,
        quantity: item.quantity,
      }));

      // Create checkout session
      const response = await api.post('/public/checkout', {
        ...formData,
        items: cartItems,
      });

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to create checkout session');
      }
    }
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-coffee-dark mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-coffee-dark mb-6">
                  Shipping Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      error={errors.customer_name?.[0]}
                    />
                    <Input
                      label="Email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      error={errors.customer_email?.[0]}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    helperText="For delivery coordination"
                    error={errors.customer_phone?.[0]}
                  />

                  {/* Shipping Address */}
                  <div className="pt-6 border-t">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Shipping Address
                    </h3>

                    <div className="space-y-6">
                      <Input
                        label="Street Address"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        required
                        error={errors.shipping_address?.[0]}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                          label="City"
                          name="shipping_city"
                          value={formData.shipping_city}
                          onChange={handleChange}
                          required
                          error={errors.shipping_city?.[0]}
                        />
                        <Input
                          label="State"
                          name="shipping_state"
                          value={formData.shipping_state}
                          onChange={handleChange}
                          required
                          error={errors.shipping_state?.[0]}
                        />
                        <Input
                          label="ZIP Code"
                          name="shipping_zip"
                          value={formData.shipping_zip}
                          onChange={handleChange}
                          required
                          error={errors.shipping_zip?.[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          Continue to Payment
                          <svg
                            className="w-5 h-5 inline ml-2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      You will be redirected to Stripe for secure payment
                    </p>
                  </div>
                </form>
              </div>

              {/* Back to Cart */}
              <div className="mt-6">
                <Link to="/cart">
                  <Button variant="secondary" size="lg">
                    ← Back to Cart
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
                  {items.map((item) => {
                    const price = item.product.effective_price || item.product.price;
                    const variantModifier = item.variant?.price_modifier || 0;
                    const itemPrice = price + variantModifier;

                    return (
                      <div
                        key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-gray-600 text-xs">
                              {item.variant.name}
                            </p>
                          )}
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-coffee">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="text-sm">Calculated by Stripe</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span className="text-sm">Calculated by Stripe</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">
                      Estimated Total:
                    </span>
                    <span className="text-2xl font-bold text-coffee">
                      ${getSubtotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
