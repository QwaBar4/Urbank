import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordRecovery = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/req/login/recovery/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (!response.ok) throw new Error(await response.text());
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            
            if (!response.ok) throw new Error(await response.text());
            setStep(3);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword, confirmPassword })
            });
            
            if (!response.ok) throw new Error(await response.text());
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Password Recovery</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {step === 1 && (
                <form onSubmit={handleRequestCode}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send Verification Code</button>
                </form>
            )}
            
            {step === 2 && (
                <form onSubmit={handleVerifyCode}>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                    <button type="submit">Verify Code</button>
                </form>

            )}
            <p></p>
			<button onClick={() => navigate('/login')}>Go back</button>
            
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="New Password"
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
                    <button type="submit">Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default PasswordRecovery;
