import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndexData, API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';

const Index = () => {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (getJwtToken()) {
                    const data = await getIndexData();
                    setUsername(data.username || "");
                    setAccount(data.account || null);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, [navigate]);

    return (
        <div>
            <h1>It's Urbank{!username ? '' : ', ' + username}</h1>
            <button onClick={!username ? () => navigate('/login') : () => navigate('/dashboard')}>Account</button>
        </div>
    );
};

export default Index;
