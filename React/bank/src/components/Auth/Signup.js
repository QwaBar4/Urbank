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
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-md">
                <h1 className="text-center text-2xl font-bold mb-6">Create Account</h1>
                
                {error && (
                    <div className="text-red-500 bg-red-500 bg-opacity-10 p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!codeSent ? (
                        <>
                            <div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username (min 3 characters)"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength="3"
                                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                />
                                {formData.username.length > 0 && (
                                    <div className={`text-xs mt-1 ${
                                        isChecking.username ? 'text-gray-400' : 
                                        (usernameAvailable ? 'text-green-500' : 'text-red-500')
                                    }`}>
                                        {isChecking.username ? 'Checking...' : 
                                         (usernameAvailable ? '✓ Available' : '✗ Unavailable')}
                                    </div>
                                )}
                            </div>

                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                />
                                {formData.email.length > 0 && (
                                    <div className={`text-xs mt-1 ${
                                        isChecking.email ? 'text-gray-400' : 
                                        (emailAvailable ? 'text-green-500' : 'text-red-500')
                                    }`}>
                                        {isChecking.email ? 'Checking...' : 
                                         (emailAvailable ? '✓ Available' : '✗ Unavailable')}
                                    </div>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    name="passwordcon"
                                    placeholder="Confirm Password"
                                    value={formData.passwordcon}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isDisabled || !usernameAvailable || !emailAvailable}
                                className={`w-full py-2 rounded font-medium ${
                                    isDisabled || !usernameAvailable || !emailAvailable
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-gray-200'
                                } transition-colors`}
                            >
                                {isDisabled ? 'Sending Code...' : 'Send Verification Code'}
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-center mb-6 text-gray-400">
                                We sent a verification code to {formData.email}. Please enter it below:
                            </p>
                            
                            <div>
                                <input
                                    type="text"
                                    placeholder="Verification Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isDisabled}
                                className={`w-full py-2 rounded font-medium ${
                                    isDisabled
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-gray-200'
                                } transition-colors mb-4`}
                            >
                                {isDisabled ? 'Creating Account...' : 'Complete Registration'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setCodeSent(false)}
                                className="w-full py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                            >
                                Back
                            </button>
                        </>
                    )}
                </form>

                <div className="text-center mt-6 text-gray-400">
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        className="text-white font-semibold hover:underline"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
