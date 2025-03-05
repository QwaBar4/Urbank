import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState(null);
    const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
		    try {
		        // First get CSRF token
		        const csrfResponse = await fetch(`${API_BASE_URL}/api/csrf`, {
		            credentials: 'include'
		        });
		        
		        // Then fetch dashboard data
		        const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
		            credentials: 'include'
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
		fetchUserData();
	}, []);
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/login');
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout failed. Please try again.');
        }
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
        </div>
    );
};

export default Dashboard;
