import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, handleResponse } from '../../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import logotype from '../../assets/logotype.jpg';

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
                <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto border border-gray-700">
                    <Link 
                        to="/login" 
                        className="flex items-center text-purple-400 hover:text-purple-300 mb-4"
                    >
                        <FiArrowLeft className="mr-2" />
                        Back to login
                    </Link>
                    
                    <h2 className="text-2xl font-bold mb-6">Password Recovery</h2>

                    {error && (
                        <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg border border-green-500 mb-4">
                            {success}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                className={`w-full py-3 px-4 rounded-lg font-medium ${
                                    isLoading || !isEmailValid
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                } transition-colors`}
                            >
                                {isLoading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter verification code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                                        isLoading
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700'
                                    } transition-colors`}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 px-4 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input type="hidden" value={resetToken} />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="New Password (min 6 characters)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium ${
                                    isLoading
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                } transition-colors`}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PasswordRecovery;
