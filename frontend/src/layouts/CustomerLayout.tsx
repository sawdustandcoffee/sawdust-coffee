import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/customer/orders', label: 'Orders', icon: '📦' },
    { path: '/customer/wishlist', label: 'Wishlist', icon: '❤️' },
    { path: '/customer/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/customer/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-xl font-bold">
                  <span className="text-sawdust">Sawdust</span>
                  <span className="text-gray-800"> & </span>
                  <span className="text-coffee">Coffee</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-coffee text-white'
                        : 'text-gray-700 hover:bg-coffee-light'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Logout
                </button>
                <Link
                  to="/"
                  className="px-4 py-2 bg-coffee text-white rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
                >
                  Back to Store
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
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

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-coffee text-white'
                        : 'text-gray-700 hover:bg-coffee-light'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="px-4 text-sm text-gray-600">
                  Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <Link
                  to="/"
                  className="block px-4 py-2 text-coffee hover:bg-coffee-light rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Back to Store
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Sawdust & Coffee. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link to="/contact" className="text-coffee hover:text-coffee-dark">
                Contact Support
              </Link>
              <Link to="/about" className="text-coffee hover:text-coffee-dark">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
