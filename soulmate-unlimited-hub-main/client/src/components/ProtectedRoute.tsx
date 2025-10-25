import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'moderator';
  requireProfile?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireRole,
  requireProfile = false
}: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, isModerator, hasProfile } = useAuth();
  const location = useLocation();

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  if (requireAuth && !user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireRole) {
    if (requireRole === 'admin' && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (requireRole === 'moderator' && !isModerator && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // Check profile completion requirement
  if (requireProfile && user && !hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
};