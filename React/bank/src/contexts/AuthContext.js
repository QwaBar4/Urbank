import React, { createContext, useContext, useState, useEffect } from 'react';
import { getJwtToken, storeJwtToken, clearJwtToken } from '../utils/auth';
import { login as apiLogin, getIndexData, getDashboardData, getAdminDashboardData } from '../services/api';

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
      return null;
    }
  };


  const loadAdminDashboardData = async () => {
    try {
      const adminData = await getAdminDashboardData(); 
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
      const userData = await loadUserData();
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
    loadAdminDashboardData
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
