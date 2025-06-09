import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, handleResponse } from '../../services/api';
import { FiArrowLeft } from 'react-icons/fi';

const PasswordRecovery = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    useEffect(() => {
        setIsEmailValid(email.length > 0 && isValidEmail(email));
    }, [email]);

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/auth/send-recovery-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to send verification code');
            }

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: 'Verification code sent' };
            }

            setSuccess(data.message || 'Verification code sent');
            setStep(2);
        } catch (err) {
            try {
                const errorData = JSON.parse(err.message);
                setError(errorData.error || errorData.errorMessage || 'Request failed');
            } catch {
                setError(err.message || 'Request failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        
        if (!code.trim()) {
            setError("Verification code is required");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-recovery-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: code.trim()
                })
            });
            
            const data = await handleResponse(response);
            if (!data.token) {
                throw new Error("Failed to get reset token");
            }
            setResetToken(data.token);
            setIsLoading(false);
            setStep(3);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        setIsLoading(false);
        e.preventDefault();
        if (!resetToken) {
            setError("Missing reset token");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be 6+ characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/login/recovery/reset`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token: resetToken, 
                    newPassword, confirmPassword 
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Reset failed");
            
            localStorage.removeItem('jwt');
            setSuccess("Password changed!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-md">
            	<Link 
                    to="/login" 
                    className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors"
                    title="Back to login"
                >
                    <FiArrowLeft className="w-6 h-6" />
                </Link>
                <h2 className="text-center text-2xl font-bold mb-6">Password Recovery</h2>

                {error && (
                    <div className="text-red-500 bg-red-500 bg-opacity-10 p-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="text-green-400 bg-green-500 bg-opacity-10 p-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                            {!isEmailValid && email.length > 0 && (
                                <div className="text-red-500 text-xs mt-1">
                                    Invalid email format
                                </div>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !isEmailValid}
                            className={`w-full py-2 rounded font-medium ${
                                isLoading || !isEmailValid
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'
                            } transition-colors`}
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`flex-1 py-2 rounded font-medium ${
                                    isLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-gray-200'
                                } transition-colors`}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="flex-1 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input type="hidden" value={resetToken} />
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="New Password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="6"
                                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full py-2 rounded font-medium ${
                                isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'
                            } transition-colors`}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordRecovery;
