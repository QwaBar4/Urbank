import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import Transfer from '../components/Dashboard/Transfer';
import api from '../services/api';
import TransactionHistory from '../components/Dashboard/TransactionHistory';
import BalanceCard from '../components/Dashboard/BalanceCard';
import ProfileUpdateModal from '../components/Dashboard/ProfileUpdateModal';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPassport, setShowPassport] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getJwtToken();
        if (!token) {
            navigate('/');
            return;
        }
        
        const fetchData = async () => {
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
                if (err.response?.status === 401) {
                    console.log('Session expired, redirecting to login');
                    navigate('/');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (userData) {
            fetchProfile();
        }
    }, [userData]);

    const fetchProfile = async () => {
        try {
            const response = await api.getUserProfile();
            setProfileData(response);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleLogout = async () => {
    	try {
		    const response = await fetch(`${API_BASE_URL}/api/logout?username=${encodeURIComponent(userData.username)}`, {
				method: 'POST',
				headers: {
		        	'Authorization': `Bearer ${getJwtToken()}`
		        }
            });
            console.log('Logging out...');
		    navigate('/');
		    clearJwtToken();
        } catch (error) {
        	console.error('Logout error:', error);
            alert('Failed to log out: ' + error.message);
        }
        
    };

    const handleDeleteAccount = async () => {
        try {
            console.log('Deleting account...');
            const response = await fetch(`${API_BASE_URL}/api/delete-user?username=${encodeURIComponent(userData.username)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`
                }
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
    if (!userData) return null;

    const isAdmin = userData.role.includes("ROLE_ADMIN");

    return (
        <div className="dashboard-container container mt-4">
            <style>
                {`
                    .modal {
                        display: none;
                        position: fixed;
                        z-index: 1;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: auto;
                        background-color: rgba(0,0,0,0.4);
                    }

                    .modal.show {
                        display: block;
                    }

                    .modal-content {
                        background-color: #fefefe;
                        margin: 5% auto;
                        padding: 20px;
                        border: 1px solid #888;
                        width: 80%;
                        max-width: 800px;
                        border-radius: 5px;
                    }

                    .close {
                        color: #aaaaaa;
                        float: right;
                        font-size: 28px;
                        font-weight: bold;
                        cursor: pointer;
                    }

                    .close:hover {
                        color: #000;
                    }
                `}
            </style>

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
                        onClick={async () => {
                            try {
                                const response = await api.generateUserStatement(userData.username);
                                const blob = new Blob([response.data], { type: 'application/pdf' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = response.filename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            } catch (error) {
                                console.error('Error downloading statement:', error);
                            }
                        }}
                        className="btn btn-outline-success"
                    >
                        Download Statement
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
            
            <h2>User data</h2>
			<div className="row mt-4">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            {profileData ? (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowProfileModal(true)}
                                        >
                                            Update Profile
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={() => {
                                                if (!window.confirm('You are about to view sensitive personal data. Confirm?')) return;
                                                setShowUserDetailsModal(true);
                                            }}
                                        >
                                            View Full Details
                                        </button>
                                    </div>
                            ) : (
                                <div className="spinner-border text-primary"></div>
                            )}
                        </div>
                    </div>
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

            {/* Profile Update Modal */}
            {showProfileModal && (
                <ProfileUpdateModal 
                    profileData={profileData}
                    onClose={() => setShowProfileModal(false)}
                    onSave={async (updatedData) => {
                        try {
                            await api.updateUserProfile(updatedData);
                            setProfileData(updatedData);
                            setShowProfileModal(false);
                        } catch (error) {
                            console.error('Profile update failed:', error);
                        }
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Account Deletion</h5>
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

            {/* User Details Modal */}
            {showUserDetailsModal && profileData && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Your Full Details, {profileData.username}</h5>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-warning">
                                    <i className="bi bi-shield-lock"></i> Sensitive Data - Access Logged
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <h5>Personal Information</h5>
                                        <p>
                                            <strong>Name:</strong> {profileData.firstName}
                                        </p>
                                        <p>
                                            <strong>Middle Name:</strong> {profileData.middleName || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Last Name:</strong> {profileData.lastName || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Date of Birth:</strong>{" "}
                                            {new Date(profileData.dateOfBirth).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {(profileData.email)}
                                        </p>
                                        <p>
                                            <strong>Account number:</strong>{" "}
                                            {(profileData.accountNumber)}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <h5>Identification Data</h5>
                                        <div className="mb-3">
                                            <label className="form-label">Passport Details</label>
                                            <div className="input-group">
                                                <input
                                                    type={showSensitiveData ? "text" : "password"}
                                                    className="form-control"
                                                    value={
                                                        showSensitiveData
                                                            ? `${profileData.passportSeries} ${profileData.passportNumber}`
                                                            : "•••• ••••••"
                                                    }
                                                    readOnly
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                                                >Show/hide details
                                                    <i className={`bi bi-eye${showSensitiveData ? "-slash" : ""}`}></i>
                                                </button>
                                            </div>
                                            <small className="text-muted">
                                                {showSensitiveData ? "Visible" : "Masked"} - Access logged
                                            </small>
                                        </div>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUserDetailsModal(false);
                                        setShowSensitiveData(false);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
