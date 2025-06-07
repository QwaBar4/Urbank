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
                <form onSubmit={handleSubmit}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h1>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={credentials.username}
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
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
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'white',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        Log In
                    </button>
                    
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <Link to="/login/recovery" style={{ color: 'white' }}>Forgot password?</Link>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'white' }}>Sign Up</Link>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/')} 
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Go home
                    </button>
                    
                    {error && <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default Login;
