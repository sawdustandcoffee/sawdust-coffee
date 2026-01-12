import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import CartDrawer from '../components/CartDrawer';
import ComparisonDrawer from '../components/ComparisonDrawer';
import api from '../lib/axios';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const { getItemCount } = useCart();
  const { user, logout } = useCustomerAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMessage('');
    setNewsletterSuccess(false);

    if (!newsletterEmail) return;

    try {
      setNewsletterLoading(true);
      const response = await api.post('/public/newsletter/subscribe', {
        email: newsletterEmail,
      });
      setNewsletterMessage(response.data.message);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterMessage(
        err.response?.data?.message || 'Failed to subscribe. Please try again.'
      );
      setNewsletterSuccess(false);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-wood-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-sawdust">Sawdust</span>
                <span className="text-white"> & </span>
                <span className="text-coffee-light">Coffee</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-lg transition ${
                      isActive(item.path)
                        ? 'text-sawdust font-semibold border-b-2 border-sawdust'
                        : 'text-white hover:text-sawdust'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-sawdust transition"
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
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coffee text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-sawdust transition"
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
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                        <Link
                          to="/customer/dashboard"
                          className="block px-4 py-2 text-gray-800 hover:bg-coffee-light transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/customer/orders"
                          className="block px-4 py-2 text-gray-800 hover:bg-coffee-light transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/customer/settings"
                          className="block px-4 py-2 text-gray-800 hover:bg-coffee-light transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Account Settings
                        </Link>
                        <div className="border-t border-gray-200 my-2" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/customer/login"
                    className="text-white hover:text-sawdust transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/customer/register"
                    className="px-4 py-2 bg-sawdust hover:bg-sawdust-dark text-white rounded-lg transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu and Cart */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Cart Icon Mobile */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-sawdust transition"
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
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coffee text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 text-lg transition ${
                    isActive(item.path)
                      ? 'text-sawdust font-semibold'
                      : 'text-white hover:text-sawdust'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile User Menu */}
              <div className="border-t border-wood-700 mt-4 pt-4">
                {user ? (
                  <>
                    <div className="text-sm text-wood-300 mb-2">
                      Logged in as {user.name}
                    </div>
                    <Link
                      to="/customer/dashboard"
                      className="block py-2 text-white hover:text-sawdust transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/customer/orders"
                      className="block py-2 text-white hover:text-sawdust transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/customer/settings"
                      className="block py-2 text-white hover:text-sawdust transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block py-2 text-red-400 hover:text-red-300 transition w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/customer/login"
                      className="block py-2 text-white hover:text-sawdust transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/customer/register"
                      className="block py-2 text-sawdust hover:text-sawdust-light font-semibold transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-wood-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-sawdust">
                Sawdust & Coffee
              </h3>
              <p className="text-wood-200 mb-4">
                Handcrafted woodworking from Wareham, Massachusetts. Making cool
                stuff, one piece at a time.
              </p>
              <ul className="space-y-2 text-wood-200 text-sm">
                <li>📍 Wareham, MA</li>
                <li>
                  📞{' '}
                  <a
                    href="tel:774-836-4958"
                    className="hover:text-sawdust transition"
                  >
                    774-836-4958
                  </a>
                </li>
                <li>
                  ✉️{' '}
                  <a
                    href="mailto:info@sawdustandcoffee.com"
                    className="hover:text-sawdust transition"
                  >
                    info@sawdustandcoffee.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-sawdust">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-wood-200 hover:text-sawdust transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-sawdust">Newsletter</h3>
              <p className="text-wood-200 mb-4 text-sm">
                Subscribe to get updates about new products and special offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-sawdust"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="w-full px-4 py-2 bg-sawdust text-wood-900 font-semibold rounded-lg hover:bg-sawdust-light transition disabled:opacity-50"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterMessage && (
                <p
                  className={`mt-3 text-sm ${
                    newsletterSuccess ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {newsletterMessage}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-wood-700 mt-8 pt-8 text-center text-wood-300">
            <p>
              &copy; {new Date().getFullYear()} Sawdust & Coffee Woodworking. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Comparison Drawer */}
      <ComparisonDrawer />
    </div>
  );
}
