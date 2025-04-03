import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';
import Transfer from './Transfer';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch account data');
                
                const data = await response.json();
                setUsername(data.username);
                setAccount(data.account);
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

    if (loading) return <div className="loading">Loading account information...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to Your Dashboard, {username}!</h1>
                <div className="dashboard-actions">
                    <button onClick={() => navigate('/')} className="btn btn-home">
                        Go Home
                    </button>
                    <button onClick={handleLogout} className="btn btn-logout">
                        Logout
                    </button>
                    <button 
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="btn btn-danger"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {account && (
                <div className="account-summary">
                    <h2>Account Details</h2>
                    <div className="card">
                        <div className="card-body">
                            <p><strong>Account Number:</strong> {account.accountNumber}</p>
                            <p><strong>Balance:</strong> ${account.balance?.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <div className="transfer-section">
                    <Transfer userAccount={account} />
                </div>
                <div className="transaction-section">
                    <TransactionHistory userAccount={account} />
                </div>
            </div>

            {showDeleteConfirmation && (
                <div className="confirmation-modal">
                    <div className="modal-content">
                        <p>Are you sure you want to delete your account? This cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={handleDeleteAccount} className="btn btn-confirm">
                                Confirm Delete
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirmation(false)} 
                                className="btn btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
