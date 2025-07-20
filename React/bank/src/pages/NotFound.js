import React from 'react';
import { useNavigate } from 'react-router-dom';
import logotype from '../assets/logotype.jpg';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logotype} alt="Logo" className="h-8" />
              <span className="font-medium">Urbank</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          >
            Return to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
