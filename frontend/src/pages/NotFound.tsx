import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import PublicLayout from '../layouts/PublicLayout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <svg
              className="w-32 h-32 mx-auto text-coffee"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* 404 Text */}
          <h1 className="text-9xl font-bold text-coffee-dark mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you're looking for seems to have wandered off into
            the workshop. Don't worry, it happens to the best of us.
          </p>

          {/* Helpful Links */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Here are some helpful links instead:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/"
                className="text-coffee hover:text-coffee-dark font-semibold transition"
              >
                → Home
              </Link>
              <Link
                to="/shop"
                className="text-coffee hover:text-coffee-dark font-semibold transition"
              >
                → Shop Products
              </Link>
              <Link
                to="/gallery"
                className="text-coffee hover:text-coffee-dark font-semibold transition"
              >
                → View Gallery
              </Link>
              <Link
                to="/contact"
                className="text-coffee hover:text-coffee-dark font-semibold transition"
              >
                → Contact Us
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg">Go Home</Button>
            </Link>
            <Link to="/shop">
              <Button variant="secondary" size="lg">
                Browse Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
