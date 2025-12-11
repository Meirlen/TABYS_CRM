import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getToken, getCurrentUser, logout } from '../utils/api';

// Create Authentication Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user data on initial mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setError(null);
        } catch (err) {
          console.error('Error loading user data:', err);
          setError(err.message);
          // If token is invalid, clear it
          if (err.message.includes('invalid token') || err.message.includes('unauthorized')) {
            handleLogout();
          }
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);

    // Redirect to home page
    const lang = router.query.lang || 'kz';
    router.push(`/${lang}/home`);
  };

  // Check if user has admin role
  const isAdmin = () => {
    return user?.is_admin === true;
  };

  // Protect routes that require authentication
  const requireAuth = (redirectUrl) => {
    if (!loading && !isAuthenticated()) {
      const lang = router.query.lang || 'kz';
      const redirect = redirectUrl || router.asPath;
      router.push(`/${lang}/auth?redirect=${encodeURIComponent(redirect)}`);
      return false;
    }
    return true;
  };

  // Context value
  const contextValue = {
    user,
    setUser,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    logout: handleLogout,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}