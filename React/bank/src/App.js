import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/components/AuthContext';
import Index from './services/components/Index';
import Signup from './services/components/Signup';
import Login from './services/components/Login';
import PasswordReset from './services/components/PasswordReset';
import Dashboard from './services/components/Dashboard';
import Deposit from './services/components/Deposit';
import Withdraw from './services/components/Withdraw';
import AdminDashboard from './services/components/AdminDashboard'; // Import AdminDashboard

// Proper private route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.roles?.some(role => role.toUpperCase() === 'ADMIN');
  
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
