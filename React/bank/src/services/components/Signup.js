import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordcon: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const getJwtToken = () => localStorage.getItem('jwt');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.passwordcon) {
		    setError("Passwords do not match!");
		    return;
		}
		
		try {
		    await signup({
		        username: formData.username,
		        email: formData.email,
		        password: formData.password
		    });
		    navigate('/login');
		} catch (error) {
		    setError(error.message);
		}
	};

    return (
        <div>
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="passwordcon"
                    placeholder="Confirm Password"
                    value={formData.passwordcon}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Log In</Link>
            </p>
        </div>
    );
};

export default Signup;
