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
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h1>
                
                {error && (
                    <div style={{
                        color: 'red',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {!codeSent ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username (min 3 characters)"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength="3"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid #555',
                                        color: 'white',
                                        borderRadius: '4px'
                                    }}
                                />
                                {formData.username.length > 0 && (
                                    <div style={{
                                        fontSize: '0.8rem',
                                        marginTop: '0.25rem',
                                        color: isChecking.username ? '#aaa' : 
                                              (usernameAvailable ? '#4CAF50' : '#F44336')
                                    }}>
                                        {isChecking.username ? 'Checking...' : 
                                         (usernameAvailable ? '✓ Available' : '✗ Unavailable')}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                {formData.email.length > 0 && (
                                    <div style={{
                                        fontSize: '0.8rem',
                                        marginTop: '0.25rem',
                                        color: isChecking.email ? '#aaa' : 
                                              (emailAvailable ? '#4CAF50' : '#F44336')
                                    }}>
                                        {isChecking.email ? 'Checking...' : 
                                         (emailAvailable ? '✓ Available' : '✗ Unavailable')}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
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

                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="password"
                                    name="passwordcon"
                                    placeholder="Confirm Password"
                                    value={formData.passwordcon}
                                    onChange={handleChange}
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

                            <button 
                                type="submit" 
                                disabled={isDisabled || !usernameAvailable || !emailAvailable}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: isDisabled || !usernameAvailable || !emailAvailable ? 
                                        'rgba(255, 255, 255, 0.3)' : 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isDisabled || !usernameAvailable || !emailAvailable ? 
                                        'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    marginBottom: '1rem'
                                }}
                            >
                                {isDisabled ? 'Sending Code...' : 'Send Verification Code'}
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ 
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                color: '#aaa'
                            }}>
                                We sent a verification code to {formData.email}. Please enter it below:
                            </p>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Verification Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
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

                            <button 
                                type="submit" 
                                disabled={isDisabled}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: isDisabled ? 
                                        'rgba(255, 255, 255, 0.3)' : 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    marginBottom: '1rem'
                                }}
                            >
                                {isDisabled ? 'Creating Account...' : 'Complete Registration'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setCodeSent(false)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '1px solid white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Back
                            </button>
                        </>
                    )}
                </form>

                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '1.5rem',
                    color: '#aaa'
                }}>
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        style={{ 
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
