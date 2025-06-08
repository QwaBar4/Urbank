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
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h1 className="text-center text-2xl font-bold mb-6">Login</h1>
                    
                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                    >
                        Log In
                    </button>
                    
                    <div className="text-center">
                        <Link to="/login/recovery" className="text-white hover:underline">Forgot password?</Link>
                    </div>
                    
                    <div className="text-center">
                        Don't have an account? <Link to="/signup" className="text-white hover:underline">Sign Up</Link>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/')} 
                        type="button"
                        className="w-full py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Go home
                    </button>
                    
                    {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default Login;
