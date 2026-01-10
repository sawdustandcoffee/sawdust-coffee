import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export default function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { user, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
