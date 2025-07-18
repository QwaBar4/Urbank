import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Deposit = lazy(() => import('../pages/Deposit'));
const Withdraw = lazy(() => import('../pages/Withdraw'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/deposit" element={<Deposit />} />
        <Route path="/dashboard/withdraw" element={<Withdraw />} />
      </Routes>
    </Suspense>
  );
};

const GlobalLoading = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

export default AppRoutes;
