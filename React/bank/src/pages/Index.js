import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import logotype from '../assets/logo_purple.png';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    };

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
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"
                    ></motion.div>
                    <p className="text-gray-400">Loading your account...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center border border-gray-700"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.6 }}
                        className="bg-red-900 bg-opacity-30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    >
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                    <p className="text-gray-400 mb-6">{error.message}</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl"
                    >
                        <div className="p-8 text-center">
                            <motion.div 
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex justify-center mb-6"
                            >
                                <img 
                                    src={logotype} 
                                    alt="Urbank Logo" 
                                    className="h-16 object-contain"
                                />
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl font-bold text-white mb-2"
                            >
                                Welcome to Urbank
                            </motion.h1>
                            {username && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-purple-400 font-medium mb-6"
                                >
                                    Hello, {username}!
                                </motion.p>
                            )}
                            
                            <div className="space-y-4">
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={handleButtonClick}
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center
                                        ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            {username ? 'Go to Dashboard' : 'Login to Your Account'}
                                        </>
                                    )}
                                </motion.button>
                                
                                {!username && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        onClick={() => navigate('/signup')}
                                        className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                                    >
                                        Create New Account
                                    </motion.button>
                                )}
                            </div>
                        </div>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-900 px-6 py-4 text-center border-t border-gray-700"
                        >
                            <p className="text-sm text-gray-400">
                                {username ? 'Secure banking platform' : 'Banking made simple and secure'}
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Index;
