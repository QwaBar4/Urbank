import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, checkUsername, checkEmail, sendVerificationCode } from '../../services/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordcon: '',
    });
    const [codeSent, setCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(false);
    const [isChecking, setIsChecking] = useState({ username: false, email: false });
    const [isDisabled, setIsDisabled] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Check username availability
    useEffect(() => {
        const checkAvailability = async () => {
            if (formData.username.length >= 3) {
                setIsChecking(prev => ({ ...prev, username: true }));
                try {
                    const exists = await checkUsername(formData.username);
                    setUsernameAvailable(!exists);
                } catch (error) {
                    console.error("Username check failed:", error);
                    setUsernameAvailable(false);
                } finally {
                    setIsChecking(prev => ({ ...prev, username: false }));
                }
            } else {
                setUsernameAvailable(false);
            }
        };
        
        const debounceTimer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(debounceTimer);
    }, [formData.username]);
    
    // Check email availability
    useEffect(() => {
        const checkEmailAvailability = async () => {
            const email = formData.email.trim();
            if (isValidEmail(email)) {
                setIsChecking(prev => ({ ...prev, email: true }));
                try {
                    const exists = await checkEmail(email);
                    setEmailAvailable(!exists);
                } catch (error) {
                    setEmailAvailable(false);
                } finally {
                    setIsChecking(prev => ({ ...prev, email: false }));
                }
            } else {
                setEmailAvailable(false);
            }
        };

        const debounceTimer = setTimeout(checkEmailAvailability, 500);
        return () => clearTimeout(debounceTimer);
    }, [formData.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsDisabled(true);
        setError('');

        // Validation
        const errors = [];
        if (!usernameAvailable) errors.push("Username is not available");
        if (!emailAvailable) errors.push("Email is invalid or already in use");
        if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
        if (formData.password !== formData.passwordcon) errors.push("Passwords do not match");

        if (errors.length > 0) {
            setError(errors.join(', '));
            setIsDisabled(false);
            return;
        }

        try {
            if (!codeSent) {
                // Step 1: Send verification code
                await sendVerificationCode(formData.email.trim().toLowerCase());
                setCodeSent(true);
                setError('');
            } else {
                // Step 2: Submit registration
                const response = await signup({
                    username: formData.username.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    code: verificationCode
                });

                if (response.jwt) {
                    navigate('/');
                } else {
                    // Account created but authentication failed
                    setError('Account created! Please log in with your credentials.');
                    navigate('/login');
                }
            }
        } catch (error) {
            setError(error.message || "Registration failed. Please try again.");
        } finally {
            setIsDisabled(false);
        }
    };

    return (
        <div className="signup-container ml-2 mt-2 border border-black max-w-md">
            <h1 className="ml-2">Create Account</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                {!codeSent ? (
                    <>
                        <div className="form-group ml-2 mt-2">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username (min 3 characters)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                minLength="3"
                            />
                            {formData.username.length > 0 && (
                                <div className={`availability-message ${usernameAvailable ? 'available' : 'unavailable'}`}>
                                    {isChecking.username ? 'Checking...' : 
                                     (usernameAvailable ? '✓ Available' : '✗ Unavailable')}
                                </div>
                            )}
                        </div>

                        <div className="form-group ml-2 mt-2">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {formData.email.length > 0 && (
                                <div className={`availability-message ${emailAvailable ? 'available' : 'unavailable'}`}>
                                    {isChecking.email ? 'Checking...' : 
                                     (emailAvailable ? '✓ Available' : '✗ Unavailable')}
                                </div>
                            )}
                        </div>

                        <div className="form-group ml-2 mt-2">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password (min 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className="form-group ml-2 mt-2">
                            <input
                                type="password"
                                name="passwordcon"
                                placeholder="Confirm Password"
                                value={formData.passwordcon}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="mt-2 ml-2 border border-black max-w-md" disabled={isDisabled || !usernameAvailable || !emailAvailable}>
                            {isDisabled ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="ml-2">We sent a verification code to {formData.email}. Please enter it below:</p>
                        
                        <div className="form-group ml-2">
                            <input
                                type="text"
                                placeholder="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={isDisabled} className="ml-2 border border-black">
                            {isDisabled ? 'Creating Account...' : 'Complete Registration'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setCodeSent(false)}
                            className="secondary-button ml-2 border border-black"
                        >
                            Back
                        </button>
                    </>
                )}
            </form>

            <div className="login-link ml-2 mt-2">
                Already have an account? <Link to="/login" className="mt-2 ml-2 border border-black max-w-md">Log In</Link>
            </div>
        </div>
    );
};

export default Signup;
