import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

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
		    window.location.href = '/dashboard';
		    
		} catch (error) {
		    console.log('Login error:', error);
		    const text = error.text;
		    setError(text || "Login failed");
		}
	};

    return (
        <div className="mt-2 ml-2 w-15 border width-5 max-w-md border-black ">
            <form className="mt-2 ml-2"onSubmit={handleSubmit}>
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
                <button type="submit" className="border w-28 h-7 me-2 border-black me-2 mt-2" onClick={handleSubmit}>Log In</button>
                <p>Forgot password? <Link to="/login/recovery">Recover password</Link></p>
                <p>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>
            <button onClick={() => navigate('/')} className="btn btn-outline-primary me-2 border w-28 h-7 me-2 border-black me-2 mt-2 mb-2 ml-2">Go home</button>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default Login;
