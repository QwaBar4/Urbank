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
		    console.log('Login response:', response);
		    window.location.href = '/';
		    
		} catch (error) {
		    console.error('Login error:', error);
		    setError(error.message || "Login failed");
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
                <button type="submit" onClick={handleSubmit}>Log In</button>
                <p>Forgot password? <Link to="/login/recovery">Recover password</Link></p>
                <p>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>
            <button onClick={() => navigate('/')} className="btn btn-outline-primary me-2">Go home</button>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default Login;
