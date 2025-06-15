import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Decorative header */}
        <div className="flex flex-col items-center my-6">
          <div className="flex items-center">
            <div className="px-4 py-2 border border-white rounded">
              <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold">
                404 - Page Not Found
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-6 text-center">
          <p className="mb-6">The page you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
