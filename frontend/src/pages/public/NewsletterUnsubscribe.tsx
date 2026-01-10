import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/axios';
import { Button, Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';

export default function NewsletterUnsubscribe() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      unsubscribe();
    }
  }, [token]);

  const unsubscribe = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/newsletter/unsubscribe/${token}`);
      setMessage(response.data.message);
      setSuccess(true);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to unsubscribe');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>Newsletter Unsubscribe - Sawdust & Coffee</title>
      </Helmet>
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {loading ? (
              <div className="py-12">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-4">Processing your request...</p>
              </div>
            ) : (
              <>
                {success ? (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-500 mx-auto mb-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      You've Been Unsubscribed
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">{message}</p>
                    <p className="text-gray-600 mb-8">
                      We're sorry to see you go. You will no longer receive newsletter
                      emails from us.
                    </p>
                    <p className="text-gray-600 mb-8">
                      You can always resubscribe from our website if you change your mind.
                    </p>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 text-red-500 mx-auto mb-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      Unsubscribe Failed
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">{message}</p>
                  </>
                )}
                <Link to="/">
                  <Button size="lg">Back to Home</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
