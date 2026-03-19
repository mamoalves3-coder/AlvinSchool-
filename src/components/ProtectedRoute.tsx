import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const [forceShow, setForceShow] = useState(false);

  // Fallback timeout to prevent infinite loading loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setForceShow(true);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !forceShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route Priority: If the email is mamoalves3@gmail.com, grant full access to Admin pages
  if (requireAdmin && user.email !== 'mamoalves3@gmail.com' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
