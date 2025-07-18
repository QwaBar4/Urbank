import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import logotype from '../assets/logo_purple.png';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await login(credentials);
            console.log('Login response:', response);
            window.location.href = '/dashboard';
        } catch (error) {
            console.log('Login error:', error);
            const text = error.text;
            setError(text || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={logotype} alt="Logo" className="h-8" />
                            <span className="font-bold text-lg hover:text-purple-300 transition-colors">Urbank</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-gray-800 rounded-xl border border-gray-700 p-8">
                    <div className="flex justify-center mb-6">
                        <img src={logotype} alt="Logo" className="h-12" />
                    </div>
                    
                    <h1 className="text-center text-2xl font-bold mb-8">Sign in to your account</h1>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-300">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={loading}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>
                            
                            <div className="text-sm">
                                <Link 
                                    to="/login/recovery" 
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign in'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link 
                            to="/signup" 
                            className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 border-t border-gray-700 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Urbank. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Login;
