import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/components/AuthContext';
import PrivateRoute from './services/components/PrivateRoute';
import Index from './services/components/Index';
import Signup from './services/components/Signup';
import Login from './services/components/Login';
import PasswordReset from './services/components/PasswordReset';
import Dashboard from './services/components/Dashboard';
import Deposit from './services/components/Deposit';
import Withdraw from './services/components/Withdraw';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login/recovery" element={<PasswordReset />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
