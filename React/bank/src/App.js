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

// Proper private route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
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

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }/>
          <Route path="/deposit" element={
            <PrivateRoute>
              <Deposit />
            </PrivateRoute>
          }/>
          <Route path="/withdraw" element={
            <PrivateRoute>
              <Withdraw />
            </PrivateRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
