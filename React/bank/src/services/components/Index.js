import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData } from '../api';
import { getJwtToken } from '../../utils/auth';

const Index = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (getJwtToken()) {
                    const data = await getIndexData();
                    setUsername(data.username || "");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, [navigate]);

    return (
        <div className="index-container">
            <h1>It's Urbank{!username ? '' : ', ' + username}</h1>
            <button 
                onClick={!username ? () => navigate('/login') : () => navigate('/dashboard')}
                className="btn btn-primary"
            >
                Account
            </button>
        </div>
    );
};

export default Index;
