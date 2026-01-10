import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-green-600 mb-4">
              Order Successful!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Thank you for your purchase from Sawdust & Coffee Woodworking!
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What Happens Next?
              </h2>
              <div className="text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-gray-700">
                    You'll receive an order confirmation email shortly with your receipt and order details.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-gray-700">
                    We'll review your order and begin preparing your custom woodwork.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-gray-700">
                    We'll contact you with updates on your order status and estimated completion time.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-gray-700">
                    Once ready, we'll arrange delivery or pickup based on your preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* Session ID (for reference) */}
            {sessionId && (
              <div className="mb-8">
                <p className="text-sm text-gray-600">
                  Reference ID: <span className="font-mono">{sessionId}</span>
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="border-t pt-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Have Questions?
              </h2>
              <p className="text-gray-700 mb-4">
                Feel free to reach out if you have any questions about your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a
                  href="tel:774-836-4958"
                  className="text-coffee hover:underline font-semibold"
                >
                  📞 774-836-4958
                </a>
                <a
                  href="mailto:info@sawdustandcoffee.com"
                  className="text-coffee hover:underline font-semibold"
                >
                  ✉️ info@sawdustandcoffee.com
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg">Continue Shopping</Button>
              </Link>
              <Link to="/">
                <Button variant="secondary" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
