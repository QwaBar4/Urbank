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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-5">
                <div className="bg-red-900 text-white px-4 py-3 rounded mb-4">
                    Error loading user data: {error.message}
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white">
            {/* Semi-transparent logo background */}
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-20 z-0"
                style={{ backgroundImage: `url(${logotype})` }}
            />

            {/* Main content */}
            <div className="relative z-10 text-center p-5 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6">
                    It's Urbank{!username ? '' : `, ${username}`}
                </h1>
                <button 
                    onClick={handleButtonClick}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded mb-4 font-medium transition-colors
                        ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        </div>
    );
};

export default Index;
	
