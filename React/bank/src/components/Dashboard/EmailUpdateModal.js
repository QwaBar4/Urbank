import React, { useState } from 'react';
import { getJwtToken } from '../../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const EmailUpdateModal = ({ currentEmail, onClose, onEmailUpdated }) => {
    const [step, setStep] = useState(1);
    const [oldEmailCode, setOldEmailCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newEmailCode, setNewEmailCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOldEmailCode = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/auth/email-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail }),
            });

            if (!response.ok) throw new Error('Failed to send verification code');
            setStep(2);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOldEmail = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('/auth/verify-email-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail, code: oldEmailCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Verification failed');
            }
            setStep(3);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendNewEmailCode = async () => {
        if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail }),
            });

            if (!response.ok) throw new Error('Failed to send verification code');
            setStep(4);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyNewEmail = async () => {
        setError('');
        setIsLoading(true);
        try {
            const token = getJwtToken();
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            const verifyResponse = await fetch('/auth/verify-code', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    email: newEmail, 
                    code: newEmailCode 
                }),
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.message || 'Verification failed');
            }

            const updateResponse = await fetch('/api/user/update-email', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({ 
                    oldEmail: currentEmail,
                    newEmail: newEmail,
                    verificationCode: newEmailCode 
                }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.message || 'Failed to update email');
            }

            onEmailUpdated(newEmail);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">Update Email Address</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4"
                        >
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                    {step === 1 && (
                        <>
                            <p className="text-gray-300">We'll send a verification code to your current email: <strong>{currentEmail}</strong></p>
                            <button 
                                onClick={handleSendOldEmailCode} 
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : 'Send Verification Code'}
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-gray-300">Enter the 6-digit code sent to {currentEmail}</p>
                            <input
                                type="text"
                                value={oldEmailCode}
                                onChange={(e) => setOldEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Verification code"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleVerifyOldEmail} 
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                disabled={oldEmailCode.length !== 6 || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : 'Verify Code'}
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <p className="text-gray-300">Enter your new email address:</p>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="New email address"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleSendNewEmailCode} 
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                disabled={!newEmail || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending code...
                                    </>
                                ) : 'Validate email'}
                            </button>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <p className="text-gray-300">Enter the 6-digit code sent to <strong>{newEmail}</strong></p>
                            <input
                                type="text"
                                value={newEmailCode}
                                onChange={(e) => setNewEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Verification code"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleVerifyNewEmail} 
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                disabled={newEmailCode.length !== 6 || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : 'Verify and Update Email'}
                            </button>
                        </>
                    )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmailUpdateModal;
