import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Droplet } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FCE8E8] text-[#C62828] animate-pulse">
          <Droplet className="w-8 h-8 fill-[#C62828]" />
        </div>
        <p className="text-sm font-semibold text-gray-600">
          Verifying Blood Bank Halsha session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
