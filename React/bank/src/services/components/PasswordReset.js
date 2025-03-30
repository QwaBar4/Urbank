import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordRecovery = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
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
		    const response = await fetch('/auth/send-code', {
		        method: 'POST',
		        headers: { 'Content-Type': 'application/json' },
		        body: JSON.stringify({ email: email.trim().toLowerCase() })
		    });
		    
		    // First check if response exists
		    if (!response.ok) {
		        const errorText = await response.text();
		        throw new Error(errorText || 'Failed to send verification code');
		    }

		    // Try to parse as JSON only if content exists
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
		    // Handle both JSON and text errors
		    try {
		        const errorData = JSON.parse(err.message);
		        setError(errorData.error || errorData.message || 'Request failed');
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

        try {
            const response = await fetch('/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email.trim().toLowerCase(), 
                    code: code.trim()
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }
            
            setSuccess('Code verified successfully');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/login/recovery/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email.trim().toLowerCase(),
                    newPassword: newPassword.trim(),
                    confirmPassword: confirmPassword.trim()
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }
            
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Password Recovery</h2>
            
            {/* Error and success messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Step 1: Request code */}
            {step === 1 && (
                <form onSubmit={handleRequestCode}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {!isEmailValid && email.length > 0 && (
                        <div className="error-message">Invalid email format</div>
                    )}
                    <button type="submit" disabled={isLoading || !isEmailValid}>
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {/* Step 2: Verify code */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode}>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                    <button type="button" onClick={() => setStep(1)}>
                        Back
                    </button>
                </form>
            )}

            {/* Step 3: Reset password */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="New Password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength="6"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength="6"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                    >
                        {isLoading ? 'Processing...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default PasswordRecovery;
