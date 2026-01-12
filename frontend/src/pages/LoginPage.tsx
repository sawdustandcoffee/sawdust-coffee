import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login and get updated user
      await login(email, password);

      // Make a direct API call to check user status after login
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser = data.user;

        // Redirect based on user type
        if (loggedInUser?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        // Fallback - try admin first
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wood-100 to-sawdust-light px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-coffee-dark mb-2">
              Sawdust & Coffee
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-transparent"
                placeholder="admin@sawdustandcoffee.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee hover:bg-coffee-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Don't have an account?{' '}
              <Link to="/customer/register" className="font-medium text-coffee hover:text-coffee-dark">
                Create one now
              </Link>
            </p>
            <Link
              to="/customer/forgot-password"
              className="text-sm font-medium text-coffee hover:text-coffee-dark"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
