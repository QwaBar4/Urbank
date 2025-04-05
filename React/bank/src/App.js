import React from 'react';
import Index from './services/components/Index';
import Signup from './services/components/Signup';
import Login from './services/components/Login';
import PasswordReset from './services/components/PasswordReset';
import Dashboard from './services/components/Dashboard';
import Deposit from './services/components/Deposit';
import Withdraw from './services/components/Withdraw';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
		<Route path="/withdraw" element={<Withdraw />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/recovery" element={<PasswordReset />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
