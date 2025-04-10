import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
}
