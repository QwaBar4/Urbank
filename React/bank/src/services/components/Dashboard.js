import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });
                
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setUsername(data.username);
                setAccount(data.account);
            } catch (error) {
                console.error('Error:', error);
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        clearJwtToken();
        navigate('/login');
    };

    return (
        <div>
            <h1>Welcome to Your Dashboard, {username}!</h1>
            {account && (
                <div>
                    <h2>Account Details</h2>
                    <p><strong>Account Number:</strong> {account.accountNumber}</p>
                    <p><strong>Balance:</strong> ${account.balance}</p>
                </div>
            )}
            <button onClick={handleLogout}>Logout</button>
            <p></p>
            <button onClick={() => navigate('/')}>Go home</button>
        </div>
    );
};

export default Dashboard;
