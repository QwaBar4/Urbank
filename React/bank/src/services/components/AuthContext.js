import React, { createContext, useContext, useState, useEffect } from 'react';
import { getJwtToken, storeJwtToken, clearJwtToken } from '../../utils/auth';
import { login as apiLogin, getIndexData } from '../api';
import { getDashboardData, getAdminDashboardData } from '../api'; // Import the new function

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const userData = await getIndexData();
      const dashboardData = await getDashboardData();
      
      const mergedUser = {
        ...userData,
        ...dashboardData,
        roles: userData.roles || []
      };
      
      return mergedUser;
    } catch (error) {
      clearJwtToken();
      return null;
    }
  };

  const loadDashboardData = async () => {
    try {
      const dashboardData = await getDashboardData();
      return dashboardData;
    } catch (error) {
      throw error;
    }
  };

  const loadAdminDashboardData = async () => {
    try {
      const adminData = await getAdminDashboardData(); // Call the new admin data function
      return adminData;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getJwtToken();
      if (token) {
        try {
          const userData = await loadUserData();
          setUser(userData);
        } catch (error) {
          clearJwtToken();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await apiLogin(credentials);
      storeJwtToken(data.jwt);
      const userData = await loadUserData(); // Load user data after login
      setUser (userData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearJwtToken();
    setUser (null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    loadAdminDashboardData, // Expose the new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
