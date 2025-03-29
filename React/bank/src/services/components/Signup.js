import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, checkUsername, checkEmail, sendVerificationCode } from '../api';

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
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [emailAvailable, setEmailAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState({ username: false, email: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Unified validation handler
    const validateForm = () => {
        const errors = [];
        
        if (!usernameAvailable) errors.push("Username unavailable");
        if (!emailAvailable) errors.push("Email invalid or taken");
        if (formData.password !== formData.passwordcon) errors.push("Passwords mismatch");
        if (formData.password.length < 6) errors.push("Password too short");
        
        return errors;
    };
	
    useEffect(() => {
        const checkAvailability = async () => {
            if (formData.username.length >= 3) {
                setIsChecking({ ...isChecking, username: true });
                try {
                    const exists = await checkUsername(formData.username);
                    setUsernameAvailable(!exists);
                } catch (error) {
                    console.error("Username check failed:", error);
                    setUsernameAvailable(true);
                } finally {
                    setIsChecking({ ...isChecking, username: false });
                }
            } else {
                setUsernameAvailable(false);
            }
        };
        
        const debounceTimer = setTimeout(checkAvailability, 500);
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [formData.username]);
    
	useEffect(() => {
		const checkEmailAvailability = async () => {
		    const email = formData.email.trim();
		    if (isValidEmail(email)) {
		        setIsChecking({ ...isChecking, email: true });
		        try {
		            const exists = await checkEmail(email);
		            setEmailAvailable(!exists);
		        } catch (error) {
		            setEmailAvailable(true);
		        } finally {
		            setIsChecking({ ...isChecking, email: false });
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
        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        if (!codeSent) {
            try {
                await sendVerificationCode(formData.email.trim().toLowerCase());
                setCodeSent(true);
                setError('');
            } catch (error) {
                setError('Failed to send verification code. Please try again.');
            }
        } else {
            try {
                await signup({
                    username: formData.username.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    code: verificationCode
                });
                navigate('/login');
            } catch (error) {
                setError(error.message || "Registration failed");
            }
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {!codeSent ? (
                    <>
                        <div className="input-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username (min 3 characters)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                minLength="3"
                            />
                            {formData.username.length > 2 && (
                                <small style={{ 
                                    color: usernameAvailable ? 'green' : 'red',
                                    opacity: isChecking.username ? 1 : 1
                                }}>
                                    {isChecking.username ? 'Checking...' : 
                                     (usernameAvailable ? '✓ Available' : '✗ Unavailable')}
                                </small>
                            )}
                        </div>
                        <p></p>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {formData.email.length > 0 && (
                                <small style={{ 
                                    color: emailAvailable ? 'green' : 'red',
                                    opacity: isChecking.email ? 1 : 1
                                }}>
                                    {isChecking.email ? 'Checking...' : 
                                     (emailAvailable ? '✓ Available' : '✗ Unavailable')}
                                </small>
                            )}
                        </div>
                        <p></p>
                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <p></p>
                        <div className="input-group">
                            <input
                                type="password"
                                name="passwordcon"
                                placeholder="Confirm Password"
                                value={formData.passwordcon}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <p></p>
                        <button type="submit">Sign up</button>
                    </>
                ) : (
                    <>
                        <p>A verification code has been sent to {formData.email}. Please enter it below:</p>
                        <input
                            type="text"
                            placeholder="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                        />
                        <button type="submit">Create Account</button>
                    </>
                )}
            </form>
            <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
    );
};

export default Signup;
