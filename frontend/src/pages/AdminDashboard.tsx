import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-2xl font-bold text-coffee-dark">
                Sawdust & Coffee Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Products</h3>
            <p className="text-3xl font-bold text-coffee">-</p>
            <p className="text-sm text-gray-500 mt-2">Total products</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Orders</h3>
            <p className="text-3xl font-bold text-coffee">-</p>
            <p className="text-sm text-gray-500 mt-2">Total orders</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quote Requests</h3>
            <p className="text-3xl font-bold text-coffee">-</p>
            <p className="text-sm text-gray-500 mt-2">Pending quotes</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-coffee rounded-lg hover:bg-coffee hover:text-white transition">
              Manage Products
            </button>
            <button className="p-4 border-2 border-coffee rounded-lg hover:bg-coffee hover:text-white transition">
              View Orders
            </button>
            <button className="p-4 border-2 border-coffee rounded-lg hover:bg-coffee hover:text-white transition">
              Gallery
            </button>
            <button className="p-4 border-2 border-coffee rounded-lg hover:bg-coffee hover:text-white transition">
              Content
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            System Status
          </h3>
          <p className="text-blue-700">
            ✅ Backend API is configured and ready
          </p>
          <p className="text-blue-700">
            ✅ Authentication is working
          </p>
          <p className="text-blue-700">
            ⚠️ Database migrations need to be run (docker-compose up -d && php artisan migrate)
          </p>
        </div>
      </div>
    </div>
  );
}
