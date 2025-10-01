import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, refreshAccessToken } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'child' | 'parent';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      let accessToken = getAccessToken();
      
      // If no access token, try to refresh
      if (!accessToken) {
        accessToken = await refreshAccessToken();
      }
      
      // If still no token, redirect to signin
      if (!accessToken) {
        navigate('/signin');
        return;
      }

      // Verify the user has the correct role
      if (requiredRole) {
        const userKey = `${requiredRole}_user`;
        const userData = localStorage.getItem(userKey);
        
        if (!userData) {
          navigate('/signin');
          return;
        }

        try {
          const user = JSON.parse(userData);
          if (user.role !== requiredRole) {
            navigate('/signin');
            return;
          }
        } catch (error) {
          navigate('/signin');
          return;
        }
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate, requiredRole]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};