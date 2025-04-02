import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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
    
	const handleDeleteAccount = async () => {
		try {
		    const response = await fetch(`${API_BASE_URL}/api/delete-user?username=${encodeURIComponent(username)}`, {
		        method: 'DELETE',
		        headers: {
		            'Authorization': `Bearer ${getJwtToken()}`,
		            'Content-Type': 'application/json'
		        }
		    });

		    if (!response.ok) {
		        const errorData = await response.json();
		        throw new Error(errorData.message || 'Account deletion failed');
		    }
		    
		    clearJwtToken();
		    navigate('/index');
		} catch (error) {
		    console.error('Deletion error:', error);
		    alert('Failed to delete account: ' + error.message);
		} finally {
		    setShowDeleteConfirmation(false);
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
            <button onClick={() => navigate('/')}>Go home</button>
                        <button onClick={handleLogout}>Logout</button>
                        <button 
                onClick={() => setShowDeleteConfirmation(true)}
            >
                Delete Account
            </button>
            {showDeleteConfirmation && (
                <div className="confirmation-modal">
                    <p>Are you sure you want to delete your account? This cannot be undone.</p>
                    <button onClick={handleDeleteAccount}>Confirm Delete</button>
                    <button onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
