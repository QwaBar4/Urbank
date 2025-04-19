import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await login(credentials);
            
            if (response.jwt) {
                navigate('/dashboard');
            } else {
                // Handle case where login fails but no error is thrown
                setError(response.message || "Login failed");
            }
        } catch (error) {
            // Proper error message extraction
            const errorMessage = error.response?.data?.message 
                || error.message 
                || "An unexpected error occurred";
            setError(errorMessage);
        }
    };

    return (
        <div>
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
                <p>Forgot password? <Link to="/login/recovery">Recover password</Link></p>
                <p>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default Login;
