import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/reviews', label: 'Product Reviews', icon: '⭐' },
    { path: '/admin/discount-codes', label: 'Discount Codes', icon: '🎟️' },
    { path: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/quotes', label: 'Quote Requests', icon: '💬' },
    { path: '/admin/contact', label: 'Contact Messages', icon: '✉️' },
    { path: '/admin/content', label: 'Site Content', icon: '📝' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/email-preview', label: 'Email Templates', icon: '📧' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { path: '/admin/activity', label: 'Activity Log', icon: '📋' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-wood-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-wood-700">
          <div className="flex items-center justify-between">
            <h1
              className={`font-bold ${
                isSidebarOpen ? 'text-xl' : 'text-sm'
              } transition-all`}
            >
              {isSidebarOpen ? 'Sawdust & Coffee' : 'S&C'}
            </h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-wood-300 hover:text-white transition"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-coffee text-white'
                  : 'text-wood-200 hover:bg-wood-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-wood-700">
          <div className={`${isSidebarOpen ? 'mb-3' : 'mb-2'}`}>
            {isSidebarOpen ? (
              <>
                <p className="text-sm text-wood-300">Logged in as</p>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </>
            ) : (
              <div className="text-center text-sm">👤</div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
          >
            {isSidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-coffee-dark">Admin Panel</h2>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
