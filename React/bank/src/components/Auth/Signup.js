import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, checkUsername, checkEmail, sendVerificationCode } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

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

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

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
                await sendVerificationCode(formData.email.trim().toLowerCase());
                setCodeSent(true);
                setError('');
            } else {
                const response = await signup({
                    username: formData.username.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    code: verificationCode
                });

                if (response.jwt) {
                    navigate('/');
                } else {
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
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
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
                        variants={cardVariants}
                        className="bg-gray-800 rounded-xl p-8 w-full"
                    >
                        <motion.h1 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center text-2xl font-bold mb-6"
                        >
                            Create Account
                        </motion.h1>
                        
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4 text-center overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!codeSent ? (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username (min 3 characters)"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            minLength="3"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password (min 6 characters)"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <input
                                            type="password"
                                            name="passwordcon"
                                            placeholder="Confirm Password"
                                            value={formData.passwordcon}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </motion.div>

                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        type="submit" 
                                        disabled={isDisabled || !usernameAvailable || !emailAvailable}
                                        className={`w-full py-3 rounded-lg font-medium ${
                                            isDisabled || !usernameAvailable || !emailAvailable
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        } transition-colors flex items-center justify-center`}
                                    >
                                        {isDisabled ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending Code...
                                            </>
                                        ) : 'Send Verification Code'}
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center mb-6 text-gray-400"
                                    >
                                        We sent a verification code to {formData.email}. Please enter it below:
                                    </motion.p>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Verification Code"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </motion.div>

                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        type="submit" 
                                        disabled={isDisabled}
                                        className={`w-full py-3 rounded-lg font-medium ${
                                            isDisabled
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        } transition-colors mb-4 flex items-center justify-center`}
                                    >
                                        {isDisabled ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : 'Complete Registration'}
                                    </motion.button>
                                    
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        type="button" 
                                        onClick={() => setCodeSent(false)}
                                        className="w-full py-3 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Back
                                    </motion.button>
                                </>
                            )}
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center mt-6 text-gray-400"
                        >
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="text-purple-400 font-semibold hover:underline"
                            >
                                Log In
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Signup;
