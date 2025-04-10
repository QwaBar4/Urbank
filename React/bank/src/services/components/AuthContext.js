import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getJwtToken,
  storeJwtToken,
  clearJwtToken
} from '../../utils/auth';
import { login as apiLogin, getIndexData } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const userData = await getIndexData();
      return userData;
    } catch (error) {
      clearJwtToken();
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getJwtToken();
      if (token) {
        const userData = await loadUserData();
        setUser(userData);
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
      setUser(userData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearJwtToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
