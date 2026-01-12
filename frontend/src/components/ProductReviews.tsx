import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ProductReview } from '../types';
import StarRating from './StarRating';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface ProductReviewsProps {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export default function ProductReviews({
  productId,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const { user } = useCustomerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/products/${productId}/reviews`, {
        params: { sort_by: sortBy },
      });
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/customer/login');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      setSubmitting(true);
      await api.post(`/customer/products/${productId}/reviews`, {
        rating,
        review_text: reviewText,
      });

      setSuccessMessage(
        'Your review has been submitted! It will appear after approval by our team.'
      );
      setReviewText('');
      setRating(5);
      setShowForm(false);

      // Refresh reviews
      fetchReviews();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-8" id="reviews">
      <h2 className="text-2xl font-bold text-coffee-dark mb-6">Customer Reviews</h2>

      {/* Reviews Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-coffee-dark mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </div>
          <StarRating rating={averageRating} readonly size="lg" />
          <p className="text-gray-600 mt-2">
            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-12">
                {stars} star{stars !== 1 && 's'}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Write Review Button */}
      {user && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-coffee text-white px-6 py-3 rounded-lg hover:bg-coffee-dark transition font-medium"
          >
            Write a Review
          </button>
        </div>
      )}

      {!user && (
        <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <p className="text-gray-700">
            <button
              onClick={() => navigate('/customer/login')}
              className="text-coffee font-medium hover:underline"
            >
              Sign in
            </button>{' '}
            to write a review
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>

          {/* Rating Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
              placeholder="Share your experience with this product..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                submitting || !reviewText.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-coffee text-white hover:bg-coffee-dark'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setReviewText('');
                setRating(5);
                setErrorMessage('');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            All Reviews ({reviewCount})
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-coffee"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {review.reviewer_name}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {review.review_text && (
                <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
