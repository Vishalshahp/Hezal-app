import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authoritative session verification on app startup / page refresh
  const checkAuth = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginUser = async (email, password) => {
    const res = await authService.login(email, password);
    if (res && res.data && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const registerCustomerUser = async (payload) => {
    const res = await authService.registerCustomer(payload);
    if (res && res.data && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const registerVendorUser = async (payload) => {
    const res = await authService.registerVendor(payload);
    if (res && res.data && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        registerCustomer: registerCustomerUser,
        registerVendor: registerVendorUser,
        logout: logoutUser,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
