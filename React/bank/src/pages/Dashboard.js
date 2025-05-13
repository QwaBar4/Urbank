import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import '../index.css'
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
		        const profileModalShown = localStorage.getItem('profileModalShown_' + data.username);
		        console.log(profileModalShown);
				if (profileModalShown === "false") {
					setShowProfileModal(true);
					localStorage.setItem('profileModalShown_' + data.username, 'true');
				}
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
    if (error) return <div className="error alert alert-danger">Error: {error}</div>;
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
			<div className="pt-[5vh] flex flex-col items-center">
			  {/* Horizontal top dashes */}
			  <div className="flex space-x-1 mb-2">
				{[...Array(24)].map((_, i) => (
				  <div key={i} className="w-2 h-px bg-gray-400"></div>
				))}
			  </div>

			  {/* Button with vertical dashes */}
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

			  {/* Horizontal bottom dashes */}
			  <div className="flex space-x-1 mt-2">
				{[...Array(24)].map((_, i) => (
				  <div key={i} className="w-2 h-px bg-gray-400"></div>
				))}
			  </div>
			</div>
            <div className="dashboard-header row mb-4">

                <div className="col-md-4">
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
			  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
				<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
				  <div className="p-4 border-b">
					<h3 className="text-lg font-semibold">Confirm Account Deletion</h3>
				  </div>
				  <div className="p-4">
					<p className="mb-2">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
					<p>All your account data and transaction history will be permanently erased.</p>
				  </div>
				  <div className="p-4 border-t flex justify-end space-x-3">
					<button
					  onClick={() => setShowDeleteConfirmation(false)}
					  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
					>
					  Cancel
					</button>
					<button
					  onClick={handleDeleteAccount}
					  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					>
					  Confirm Delete
					</button>
				  </div>
				</div>
			  </div>
			)}

			{showUserDetailsModal && profileData && (
			  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
				<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
				  <div className="p-4 border-b flex justify-between items-center">
					<h3 className="text-lg font-semibold">Your Full Details, {profileData.username}</h3>
					<button 
					  onClick={() => {
						setShowUserDetailsModal(false);
						setShowSensitiveData(false);
					  }}
					  className="text-gray-500 hover:text-gray-700"
					>
					  ✕
					</button>
				  </div>
				  
				  <div className="p-4 border-b bg-yellow-50 border-l-4 border-yellow-400">
					<div className="flex items-center">
					  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
					  </svg>
					  <span>Sensitive Data - Access Logged</span>
					</div>
				  </div>

				  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
					  <h4 className="font-medium text-gray-700 mb-3">Personal Information</h4>
					  <div className="space-y-2">
						<p><span className="font-medium">Name:</span> {profileData.firstName}</p>
						<p><span className="font-medium">Middle Name:</span> {profileData.middleName || 'N/A'}</p>
						<p><span className="font-medium">Last Name:</span> {profileData.lastName || 'N/A'}</p>
						<p><span className="font-medium">Date of Birth:</span> {new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
						<p><span className="font-medium">Email:</span> {profileData.email}</p>
						<p><span className="font-medium">Account number:</span> {profileData.accountNumber}</p>
					  </div>
					</div>

					<div>
					  <h4 className="font-medium text-gray-700 mb-3">Identification Data</h4>
					  <div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">Passport Details</label>
						<div className="flex">
						  <input
						    type={showSensitiveData ? "text" : "password"}
						    className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
						    value={
						      showSensitiveData
						        ? `${profileData.passportSeries} ${profileData.passportNumber}`
						        : "•••• ••••••"
						    }
						    readOnly
						  />
						  <button
						    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r bg-gray-100 hover:bg-gray-200"
						    onClick={() => setShowSensitiveData(!showSensitiveData)}
						  >
						    {showSensitiveData ? 'Hide' : 'Show'} details
						  </button>
						</div>
						<p className="text-xs text-gray-500 mt-1">
						  {showSensitiveData ? "Visible" : "Masked"} - Access logged
						</p>
					  </div>
					</div>
				  </div>

				  <div className="p-4 border-t flex justify-end">
					<button
					  onClick={() => {
						setShowUserDetailsModal(false);
						setShowSensitiveData(false);
					  }}
					  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
					>
					  Close
					</button>
				  </div>
				</div>
			  </div>
			)}
        </div>
    );
};

export default Dashboard;
