import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Button, Spinner } from './ui';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface ProductQuestion {
  id: number;
  question: string;
  answer: string | null;
  customer_name: string | null;
  answered_at: string | null;
  helpful_count: number;
  created_at: string;
  customer?: {
    name: string;
  };
}

interface ProductQuestionsProps {
  productId: number;
}

export default function ProductQuestions({ productId }: ProductQuestionsProps) {
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useCustomerAuth();

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/products/${productId}/questions`);
      setQuestions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!questionText.trim()) {
      setErrorMessage('Please enter your question.');
      return;
    }

    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      setErrorMessage('Please provide your name and email.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/public/products/${productId}/questions`, {
        question: questionText,
        customer_name: user ? undefined : guestName,
        customer_email: user ? undefined : guestEmail,
      });

      setSuccessMessage(
        'Your question has been submitted! It will appear after review by our team.'
      );
      setQuestionText('');
      setGuestName('');
      setGuestEmail('');
      setShowForm(false);

      // Optionally refresh questions after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit question. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (questionId: number) => {
    try {
      const response = await api.post(`/public/questions/${questionId}/helpful`);
      // Update the local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, helpful_count: response.data.helpful_count }
            : q
        )
      );
    } catch (err) {
      console.error('Failed to mark as helpful', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-coffee-dark mb-2">
          Questions & Answers
        </h2>
        <p className="text-gray-600">
          Have a question? Get answers from other customers or our team.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {/* Ask Question Button */}
      {!showForm && (
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)}>
            Ask a Question
          </Button>
        </div>
      )}

      {/* Question Form */}
      {showForm && (
        <form onSubmit={handleSubmitQuestion} className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ask Your Question
          </h3>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {errorMessage}
            </div>
          )}

          {/* Question Text */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Question *
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="What would you like to know about this product?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {questionText.length}/1000 characters
            </p>
          </div>

          {/* Guest Info */}
          {!user && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={255}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  maxLength={255}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll notify you when your question is answered
                </p>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Question'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setErrorMessage('');
                setQuestionText('');
                setGuestName('');
                setGuestEmail('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No questions yet.</p>
          <p className="text-gray-600">Be the first to ask about this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border-b pb-6 last:border-b-0">
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-coffee flex-shrink-0 mt-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{q.question}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Asked by {q.customer?.name || q.customer_name || 'Customer'} on{' '}
                      {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer */}
              {q.answer ? (
                <div className="ml-7 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-700">{q.answer}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Answered by Sawdust & Coffee on{' '}
                        {q.answered_at
                          ? new Date(q.answered_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Helpful Button */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleMarkHelpful(q.id)}
                      className="text-sm text-gray-600 hover:text-coffee transition flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Helpful ({q.helpful_count})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-7 text-sm text-gray-500 italic">
                  Awaiting answer from our team...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
