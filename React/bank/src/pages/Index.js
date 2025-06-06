import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import logotype from '../assets/logotype.jpg';

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
                setError(error);
                
                if (error) {
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
            <div className="index-container" style={{
                backgroundColor: 'black',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="index-container" style={{
                backgroundColor: 'black',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '20px'
            }}>
                <div className="alert alert-danger">
                    Error loading user data: {error.message}
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
        <div className="index-container" style={{
            backgroundColor: 'black',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: 'white'
        }}>
            {/* Semi-transparent logo background */}
            <div style={{
                backgroundImage: `url(${logotype})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.2,
                zIndex: 0
            }} />

            {/* Main content */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                padding: '20px'
            }}>
                <h1 className="mb-4">It's Urbank{!username ? '' : ', ' + username}</h1>
                <button 
                    onClick={handleButtonClick}
                    className="btn btn-primary btn-lg border w-80 h-7 me-2 border-black"
                    disabled={isLoading}
                    style={{
                        backgroundColor: 'white',
                        color: 'black'
                    }}
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
        </div>
    );
};

export default Index;
