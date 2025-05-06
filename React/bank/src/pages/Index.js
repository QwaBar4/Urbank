import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';

const Index = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const token = getJwtToken();
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const data = await getIndexData();
                setUsername(data.username || "");
            } catch (error) {
                console.error('Error fetching index data:', error);
                setError(error.message);
                
                if (error.message.includes('401')) {
                    clearJwtToken();
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleButtonClick = () => {
        navigate(username ? '/dashboard' : '/login');
    };

    if (isLoading && getJwtToken()) {
        return (
            <div className="index-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="index-container">
                <div className="alert alert-danger">
                    Error loading user data: {error}
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="btn btn-secondary mt-3"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="index-container text-center">
            <h1 className="mb-4">It's Urbank{!username ? '' : ', ' + username}</h1>
            <button 
                onClick={handleButtonClick}
                className="btn btn-primary btn-lg"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                    </>
                ) : (
                    `Go to ${username ? 'Dashboard' : 'Login'}`
                )}
            </button>
        </div>
    );
};

export default Index;
