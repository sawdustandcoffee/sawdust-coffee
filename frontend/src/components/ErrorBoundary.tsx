import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, you'd send to error tracking service)
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <svg
                className="w-32 h-32 mx-auto text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Our team has been
              notified and we're working on it.
            </p>

            {/* Error Details (development only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Details (Development Mode):
                </h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-600 mt-4 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={this.handleReload}>
                Reload Page
              </Button>
              <Link to="/">
                <Button variant="secondary" size="lg">
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-8">
              If this problem persists, please{' '}
              <Link to="/contact" className="text-coffee hover:underline">
                contact us
              </Link>{' '}
              for assistance.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
