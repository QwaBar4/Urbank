import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import Signup from './components/Auth/Signup';
import Login from './pages/Login';
import PasswordReset from './components/Auth/PasswordReset';
import Dashboard from './pages/Dashboard';
import Deposit from './components/Dashboard/Deposit';
import Withdraw from './components/Dashboard/Withdraw';
import EditUser from './components/Dashboard/EditUser';
import AdminDashboard from './pages/AdminDashboard';

// Proper private route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Check for ROLE_ADMIN in all role formats
  const isAdmin = user.roles?.some(role => 
    role === 'ADMIN' || 
    role === 'ROLE_ADMIN' ||
    role.authority === 'ROLE_ADMIN'
  );

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login/recovery" element={<PasswordReset />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Admin-only route */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
			<Route path="/edit-user/:userId" element={
			  <PrivateRoute>
				<EditUser />
			  </PrivateRoute>
			} />

          {/* Transaction routes */}
          <Route path="/deposit" element={
            <PrivateRoute>
              <Deposit />
            </PrivateRoute>
          } />
          <Route path="/withdraw" element={
            <PrivateRoute>
              <Withdraw />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
