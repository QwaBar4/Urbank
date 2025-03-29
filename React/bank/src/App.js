import React from 'react';
import Index from './services/components/Index';
import Signup from './services/components/Signup';
import Login from './services/components/Login';
import Dashboard from './services/components/Dashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
