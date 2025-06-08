import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, handleResponse } from '../../services/api';

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
        <div style={{
            backgroundColor: 'black',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Password Recovery</h2>

                {error && (
                    <div style={{
                        color: 'red',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div style={{
                        color: 'lightgreen',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        borderRadius: '4px'
                    }}>
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestCode}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid #555',
                                    color: 'white',
                                    borderRadius: '4px'
                                }}
                            />
                            {!isEmailValid && email.length > 0 && (
                                <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    Invalid email format
                                </div>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !isEmailValid}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: isLoading || !isEmailValid ? 'rgba(255, 255, 255, 0.3)' : 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading || !isEmailValid ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyCode}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid #555',
                                    color: 'white',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: isLoading ? 'rgba(255, 255, 255, 0.3)' : 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '1px solid white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <input type="hidden" value={resetToken} />
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="password"
                                placeholder="New Password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="6"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid #555',
                                    color: 'white',
                                    borderRadius: '4px',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid #555',
                                    color: 'white',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: isLoading ? 'rgba(255, 255, 255, 0.3)' : 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
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
