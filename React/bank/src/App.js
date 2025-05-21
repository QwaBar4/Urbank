import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import Signup from './components/Auth/Signup';
import Login from './pages/Login';
import PasswordReset from './components/Auth/PasswordReset';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Deposit from './components/Dashboard/Deposit';
import Withdraw from './components/Dashboard/Withdraw';
import EditUser from './components/Dashboard/EditUser';
import AdminDashboard from './pages/AdminDashboard';
import Loading from './pages/Loading';

const PrivateRoute = ({ children, showNotFound = false }) => {
  const { user } = useAuth();

  if (user?.loading) {
    return <div>Loading...</div>;
  }

  if (showNotFound && !user) {
    return <NotFound />;
  }

  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children, showNotFound = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return showNotFound ? <NotFound /> : <Navigate to="/" replace />;

  const isAdmin = user.roles?.some(role => 
    role === 'ADMIN' || 
    role === 'ROLE_ADMIN' ||
    role.authority === 'ROLE_ADMIN'
  );

  if (!isAdmin) {
    return showNotFound ? <NotFound /> : <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DashboardRoute = ({ children, showLoading = false }) => {
	const { user, loading } = useAuth();
	
  if (loading) return <div>Loading...</div>;
  if (!user) return showLoading ? <Loading /> : <Navigate to="/dashboard" replace />;

  const isUserLoaded = user.roles?.some(role => 
    role === 'USER' || 
    role === 'ROLE_ADMIN' ||
    role.authority === 'ROLE_ADMIN'
  );

  if (!isUserLoaded) {
    return showLoading ? <Loading /> : <Navigate to="/dashboard" replace />;
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
            <DashboardRoute showLoading>
              <Dashboard />
            </DashboardRoute>
          } />

          {/* Admin-only route */}
          <Route path="/admin" element={
            <AdminRoute showNotFound>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          <Route path="/edit-user/:userId" element={
            <PrivateRoute showNotFound>
              <EditUser />
            </PrivateRoute>
          } />

          {/* Transaction routes */}
          <Route path="/deposit" element={
            <PrivateRoute showNotFound>
              <Deposit />
            </PrivateRoute>
          } />
          <Route path="/withdraw" element={
            <PrivateRoute showNotFound>
              <Withdraw />
            </PrivateRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
