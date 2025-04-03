import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';
import Transfer from './Transfer';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

	useEffect(() => {
		const fetchAccountData = async () => {
		    try {
		        const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
		            headers: {
		                'Authorization': `Bearer ${getJwtToken()}`,
		                'Accept': 'application/json'
		            }
		        });

		        const data = await response.json();
		        
		        if (!response.ok) {
		            throw new Error(data.message || 'Failed to fetch account data');
		        }

		        // Handle the simplified response
		        setAccount({
		            username: data.username,
		            accountNumber: data.account.accountNumber,
		            balance: data.account.balance
		        });
		        
		    } catch (err) {
		        console.error("Error:", err);
		        setError(err.message);
		        if (err.message.includes('401')) {
		            clearJwtToken();
		            navigate('/login');
		        }
		    } finally {
		        setLoading(false);
		    }
		};
		
		fetchAccountData();
	}, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                credentials: 'include'
            });
            clearJwtToken();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    if (loading) return <div className="loading">Loading account information...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <div className="account-summary">
                <h2>Account Summary</h2>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Welcome, {account?.username}</h5>
                        <p className="card-text">
                            <strong>Account Number:</strong> {account?.accountNumber}<br />
                            <strong>Balance:</strong> ${account?.balance?.toFixed(2)}
                        </p>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="transfer-section">
                    <Transfer userAccount={account} />
                </div>
                <div className="transaction-section">
                    <TransactionHistory userAccount={account} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
