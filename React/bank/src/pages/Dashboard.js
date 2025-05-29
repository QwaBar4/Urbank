import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import '../index.css'
import Transfer from '../components/Dashboard/Transfer';
import api from '../services/api';
import TransactionHistoryModal from '../components/Dashboard/TransactionHistoryModal';
import BalanceCard from '../components/Dashboard/BalanceCard';
import ProfileUpdateModal from '../components/Dashboard/ProfileUpdateModal';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
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
	        	id: data.id,
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
	            setShowInfoModal(true);
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
            if (response.firstName === null || response.lastName === null || response.middleName=== null || response.passportSeries === null || response.passportNumber === null || response.dateOfBirth === null){
            	setShowProfileModal(true);
            }
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
		    console.log('Logging out...' + response);
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
    if (!userData) return null;

    const isAdmin = userData.role.includes("ROLE_ADMIN");

    return (
        <div className="mx-5 w-full">
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
			<div className="mt-2 flex flex-col items-center">
			  <div className="flex space-x-1 mb-2">
				{[...Array(24)].map((_, i) => (
				  <div key={i} className="w-2 h-px bg-gray-400"></div>
				))}
			  </div>

			  <div className="flex items-center">
				<div className="flex flex-col space-y-1 mr-2">
				  {[...Array(6)].map((_, i) => (
					<div key={i} className="w-px h-2 bg-gray-400"></div>
				  ))}
				</div>
				<button className="px-4 py-2 border border-black">
					<h1 className="text-2xl md:text-2xl lg:text-3xl font-bold">
					  Welcome, {userData.username}!
					</h1>
				</button>
				<div className="flex flex-col space-y-1 ml-2">
				  {[...Array(6)].map((_, i) => (
					<div key={i} className="w-px h-2 bg-gray-400"></div>
				  ))}
				</div>
			  </div>
			  <div className="flex space-x-1 mt-2">
				{[...Array(24)].map((_, i) => (
				  <div key={i} className="w-2 h-px bg-gray-400"></div>
				))}
			  </div>
			</div>
            <div className="dashboard-header row mb-4 mt-2">
                <div className="col-md-4">
                    <button onClick={() => navigate('/')} className="btn btn-outline-primary border w-20 h-7 me-2 border-black me-2">
                        Go Home
                    </button>
                    <button onClick={handleLogout} className="btn btn-outline-secondary border w-20 h-7 me-2 border-black me-2">
                        Logout
                    </button>
                    <button
                      className="btn btn-sm btn-success border w-40 h-7 me-2 border-black"
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
                          console.error('Error downloading user statement:', error);
                          setError(error.message)
                          setShowInfoModal(true)
                        }
                      }}
                    >
                      Download Statement
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="btn btn-outline-danger border w-40 h-7 me-2 border-black me-2"
                    >
                        Delete Account
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="btn btn-outline-warning border w-40 h-7 me-2 border-black me-2"
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
                                            className="btn btn-primary border w-40 h-7 me-2 border-black me-2"
                                            onClick={() => setShowProfileModal(true)}
                                        >
                                            Update Profile
                                        </button>
                                        <button
                                            className="btn btn-info border w-40 h-7 me-2 border-black me-2"
                                            onClick={() => {
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
            </div>
			<button 
				onClick={() => setShowTransactionHistoryModal(true)}
				className="btn btn-primary border w-70 h-7 me-2 border-black me-2 mt-2"
			>
				View Full Transaction History
			</button>
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

            {showUserDetailsModal && profileData && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Your Full Details, {profileData.username}</h5>
                            </div>
                            <div className="modal-body mt-2">
                                <div className="alert alert-warning">
                                    <i className="bi bi-shield-lock mt-2"></i> Sensitive Data - Access Logged
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <h5 className="mt-2">Personal Information</h5>
                                        <p className="mt-2">
                                            <strong>Name:</strong> {profileData.firstName}
                                        </p>
                                        <p className="mt-2">
                                            <strong>Middle Name:</strong> {profileData.middleName || 'N/A'}
                                        </p>
                                        <p className="mt-2">
                                            <strong>Last Name:</strong> {profileData.lastName || 'N/A'}
                                        </p>
                                        <p className="mt-2">
                                            <strong>Date of Birth:</strong>{" "}
                                            {new Date(profileData.dateOfBirth).toLocaleDateString()}
                                        </p>
                                        <p className="mt-2">
                                            <strong>Email:</strong>{" "}
                                            {(profileData.email)}
                                        </p>
                                        <p className="mt-2">
                                            <strong>Account number:</strong>{" "}
                                            {(profileData.accountNumber)}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <h5 className="mt-2">Identification Data</h5>
                                        <div className="mb-3 mt-2">
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
                                                    className="btn btn-outline-secondary border w-40 h-7 me-2 border-black me-2"
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
                                    className="btn btn-secondary border w-40 h-7 me-2 border-black me-2"
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
			
			{showTransactionHistoryModal && (
				<TransactionHistoryModal 
					userAccount={userData.account}
					onClose={() => setShowTransactionHistoryModal(false)}
				/>
			)}
			
			{showInfoModal && error && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <h1 className="modal-title text-2xl">An error appeared</h1>
                            <h5 className="mt-2">{error}</h5>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary border w-40 h-7 me-2 border-black me-2 mt-5"
                                    onClick={() => {
                                        setShowInfoModal(false);
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
