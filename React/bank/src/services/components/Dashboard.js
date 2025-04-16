import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getJwtToken, clearJwtToken } from '../../utils/auth';
import { getDashboardData } from '../api';
import Transfer from './Transfer';
import TransactionHistory from './TransactionHistory';
import BalanceCard from './BalanceCard';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const navigate = useNavigate();

    const fetchAccountData = useCallback(async () => {
        try {
            const data = await getDashboardData();
            setUserData({
                username: data.username,
                account: {
                    accountNumber: data.account.accountNumber,
                    balance: data.account.balance,
                    dailyTransferLimit: data.account.dailyTransferLimit,
                    dailyWithdrawalLimit: data.account.dailyWithdrawalLimit
                },
                role: data.roles
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    const handleLogout = () => {
        console.log('Logging out...');
        clearJwtToken();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            console.log('Deleting account...');
            const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Account deletion failed');
            }

            clearJwtToken();
            navigate('/');
        } catch (error) {
            console.error('Deletion error:', error);
            alert('Failed to delete account: ' + error.message);
        } finally {
            setShowDeleteConfirmation(false);
        }
    };

    const refreshBalance = async () => {
        try {
            console.log('Refreshing balance...');
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
    if (error) return <div className="error alert alert-danger">Error: {error}</div>;

    const isAdmin = userData.role.includes("ROLE_ADMIN");
    return (
        userData && (
            <div className="dashboard-container container mt-4">
                <div className="dashboard-header row mb-4">
                    <div className="col-md-8">
                        <h1>Welcome, {userData.username}!</h1>
                    </div>
                    <div className="col-md-4 text-end">
                        <button onClick={() => navigate('/')} className="btn btn-outline-primary me-2">
                            Go Home
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline-secondary me-2">
                            Logout
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="btn btn-outline-danger"
                        >
                            Delete Account
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="btn btn-outline-warning me-2"
                            >
                                Admin Dashboard
                            </button>
                        )}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <BalanceCard
                            accountNumber={userData.account.accountNumber}
                            balance={userData.account.balance}
                            refreshBalance={refreshBalance}
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

                {/* Delete Confirmation Modal */}
                {showDeleteConfirmation && (
                    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Account Deletion</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteConfirmation(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
                                    <p>All your account data and transaction history will be permanently erased.</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteConfirmation(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteAccount}
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
};

export default Dashboard;
