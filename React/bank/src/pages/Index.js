import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import logotype from '../assets/logotype.jpg';

const Index = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const token = getJwtToken();
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const data = await getIndexData();
                setUsername(data.username || "");
            } catch (error) {
                console.error('Error fetching index data:', error);
                setError(error);
                
                if (error) {
                    clearJwtToken();
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleButtonClick = () => {
        navigate(username ? '/dashboard' : '/login');
    };

    if (isLoading && getJwtToken()) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
                <div className="bg-gray-900 border border-red-500 rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Loading Error</h3>
                    <p className="text-gray-300 mb-6">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden w-full max-w-md">
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-8">
                        <img 
                            src={logotype} 
                            alt="Urbank Logo" 
                            className="h-16 object-contain"
                        />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome to Urbank
                    </h1>
                    {username && (
                        <p className="text-purple-400 font-medium mb-8">Hello, {username}!</p>
                    )}
                    
                    <button 
                        onClick={handleButtonClick}
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                            ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </div>
                        ) : (
                            `Go to ${username ? 'Dashboard' : 'Login'}`
                        )}
                    </button>
                </div>
                
                <div className="bg-gray-800 px-6 py-4 text-center border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                        {username ? 'Secure banking platform' : 'Please login to access your account'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Index;
