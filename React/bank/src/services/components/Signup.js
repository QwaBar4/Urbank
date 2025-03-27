import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, checkUsername } from '../api';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordcon: '',
    });
    const [error, setError] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [isChecking, setIsChecking] = useState(false); // New loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const checkAvailability = async () => {
            if (formData.username.length >= 3) { // Changed to >= 3 for better UX
                setIsChecking(true);
                try {
                    const exists = await checkUsername(formData.username);
                    setUsernameAvailable(!exists);
                } catch (error) {
                    console.error("Username check failed:", error);
                    setUsernameAvailable(true);
                } finally {
                    setIsChecking(false);
                }
            } else {
                setUsernameAvailable(false);
            }
        };
        
        const debounceTimer = setTimeout(checkAvailability, 500);
        return () => {
            clearTimeout(debounceTimer);
            setIsChecking(false);
        };
    }, [formData.username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.passwordcon) {
            setError("Passwords do not match!");
            return;
        }

        if (formData.password.length < 6) { // Add client-side password validation
            setError("Password must be at least 6 characters");
            return;
        }

        if (!usernameAvailable || isChecking) { // Prevent submit during check
            setError("Please check username availability");
            return;
        }

        try {
            await signup({
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
            navigate('/login');
        } catch (error) {
            setError(error.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
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
                    {formData.username.length > 0 && (
                        <small style={{ 
                            color: usernameAvailable ? 'green' : 'red',
                            opacity: isChecking ? 0.5 : 1
                        }}>
                            {isChecking ? 'Checking...' : 
                             (usernameAvailable ? '✓ Available' : '✗ Unavailable')}
                        </small>
                    )}
                </div>
                <p>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                </p>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <p>
                <input
                    type="password"
                    name="passwordcon"
                    placeholder="Confirm Password"
                    value={formData.passwordcon}
                    onChange={handleChange}
                    required
                />
                </p>
                <button 
                    type="submit" 
                    disabled={isChecking}
                >
                    {isChecking ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <p>
                Already have an account? <Link to="/login">Log In</Link>
            </p>
        </div>
    );
};

export default Signup;
