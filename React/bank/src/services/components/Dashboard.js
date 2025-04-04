import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';
import Transfer from './Transfer';
import TransactionHistory from './TransactionHistory';
import BalanceCard from './BalanceCard';

const Dashboard = () => {
    const [userData, setUserData] = useState({ username: '', account: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchAccountData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch account data');
            
            const data = await response.json();
            setUserData({
                username: data.username,
                account: {
                    accountNumber: data.account.accountNumber,
                    balance: data.account.balance
                }
            });
        } catch (err) {
            setError(err.message);
            if (err.message.includes('401')) {
                clearJwtToken();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, []);

    const handleLogout = () => {
        clearJwtToken();
        navigate('/login');
    };

    const refreshBalance = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/balance`, {
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to refresh balance');
            
            const balance = await response.json();
            setUserData(prev => ({
                ...prev,
                account: {
                    ...prev.account,
                    balance: balance
                }
            }));
        } catch (err) {
            console.error("Balance refresh error:", err);
        }
    };

    if (loading) return <div className="loading">Loading account information...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container container mt-4">
            <div className="dashboard-header row mb-4">
                <div className="col-md-8">
                    <h1>Welcome, {userData.username}!</h1>
                </div>
                <div className="col-md-4 text-end">
                    <button onClick={handleLogout} className="btn btn-outline-danger me-2">
                        Logout
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <BalanceCard 
                        accountNumber={userData.account?.accountNumber} 
                        balance={userData.account?.balance} 
                    />
                    <Transfer 
                        userAccount={userData.account} 
                        refreshBalance={refreshBalance} 
                    />
                </div>
                <div className="col-md-8">
                    <TransactionHistory userAccount={userData.account} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
