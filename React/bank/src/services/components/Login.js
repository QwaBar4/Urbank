import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState(''); // Add error state
    const navigate = useNavigate();
    const getJwtToken = () => localStorage.getItem('jwt');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
    

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
		    const response = await login(credentials);
		    if (response.jwt) { // Check for JWT presence instead of message
		        navigate('/dashboard');
		    }
		} catch (error) {
		    setError(error.message.includes("403") 
		        ? "Invalid credentials" // More accurate error message
		        : error.message);
		}
	};

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                required
            />
            <p>
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
            />
            </p>
            <button type="submit">Log In</button>
            <p>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </form>
    );
};

export default Login;
