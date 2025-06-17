import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import Transfer from '../components/Dashboard/Transfer';
import api from '../services/api';
import StatementOptionsModal from '../components/Dashboard/StatementOptionsModal';
import TransactionHistoryModal from '../components/Dashboard/TransactionHistoryModal';
import BalanceCard from '../components/Dashboard/BalanceCard';
import ProfileUpdateModal from '../components/Dashboard/ProfileUpdateModal';
import logotype from '../assets/logotype.jpg';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
	const [showStatementOptions, setShowStatementOptions] = useState(false);
	const [statementLoading, setStatementLoading] = useState(false);
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
            if (response.firstName === null || response.lastName === null || response.middleName === null || 
                response.passportSeries === null || response.passportNumber === null || response.dateOfBirth === null) {
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
            setError('Failed to log out: ' + error.message);
        }
    };
    const handleDownloadStatement = async (theme) => {
		try {
		  setStatementLoading(true);
		  const response = await api.generateUserStatement(
		    userData.username, 
		    theme
		  );
		  
		  const blob = new Blob([response.data], { type: 'application/pdf' });
		  const url = window.URL.createObjectURL(blob);
		  const a = document.createElement('a');
		  a.href = url;
		  a.download = `statement_${new Date().toISOString().slice(0,10)}.pdf`;
		  document.body.appendChild(a);
		  a.click();
		  a.remove();
		  
		  setShowStatementOptions(false);
		} catch (error) {
		  console.error('Error downloading statement:', error);
		  setError(error.message);
		} finally {
		  setStatementLoading(false);
		}
	  };

    const handleDeleteAccount = async () => {
        try {
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
            setError('Failed to delete account: ' + error.message);
        } finally {
            setShowDeleteConfirmation(false);
        }
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
            setError('Failed to refresh balance');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
    );

    if (!userData) return null;

    const isAdmin = userData.role.includes("ROLE_ADMIN");

    return (
        <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
            {/* Semi-transparent logo background */}
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 z-0"
                style={{ backgroundImage: `url(${logotype})` }}
            />

            {/* Main content */}
            <div className="relative z-10 max-w-6xl mx-auto w-full">
                {/* Welcome Banner */}
                <div className="flex flex-col items-center my-6">
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
                        <div className="px-4 py-2 border border-white rounded">
                            <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold">
                                It's Urbank, {userData.username}!
                            </h1>
                        </div>
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Go Home
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Logout
                    </button>
					<button
					  onClick={() => setShowStatementOptions(true)}
					  className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
					>
					  Download Statement
					</button>
                    <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded hover:bg-red-500 hover:bg-opacity-10 transition-colors"
                    >
                        Delete Account
                    </button>
					{isAdmin && (
						<button
							onClick={() => navigate('/admin')}
							className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
						>
							Admin Dashboard
						</button>
					)}
                </div>

                {/* User Data Section */}
                <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-bold mb-4">User Data</h2>
                    {profileData ? (
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                                onClick={() => setShowProfileModal(true)}
                            >
                                Update Profile
                            </button>
							<button
								className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
								onClick={() => setShowUserDetailsModal(true)}
							>
								View Full Details
							</button>
                        </div>
                    ) : (
                        <div className="text-center">Loading profile...</div>
                    )}
                </div>

                {/* Balance and Transfer Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                {/* Transaction History Button */}
				<button 
					onClick={() => setShowTransactionHistoryModal(true)}
					className="w-full md:w-auto px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium mb-6"
				>
					View Full Transaction History
				</button>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}
            </div>

            {/* Modals */}
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
                            setError('Profile update failed');
                        }
                    }}
                />
            )}

            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Confirm Account Deletion</h3>
                        <p className="mb-4">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
                        <p className="mb-6">All your account data and transaction history will be permanently erased.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                                onClick={() => setShowDeleteConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                onClick={handleDeleteAccount}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUserDetailsModal && profileData && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-3xl w-full border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Your Full Details, {profileData.username}</h3>
                            <button 
                                onClick={() => {
                                    setShowUserDetailsModal(false);
                                    setShowSensitiveData(false);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-lg border border-yellow-500 mb-4">
                            <p>⚠️ Sensitive Data - Access Logged</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold mb-3">Personal Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Name:</span> {profileData.firstName}</p>
                                    <p><span className="font-semibold">Middle Name:</span> {profileData.middleName || 'N/A'}</p>
                                    <p><span className="font-semibold">Last Name:</span> {profileData.lastName || 'N/A'}</p>
                                    <p><span className="font-semibold">Date of Birth:</span> {new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                                    <p><span className="font-semibold">Email:</span> {profileData.email}</p>
                                    <p><span className="font-semibold">Account number:</span> {profileData.accountNumber}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold mb-3">Identification Data</h4>
                                <div className="mb-4">
                                    <label className="block mb-1 font-semibold">Passport Details</label>
                                    <div className="flex">
                                        <div className="flex-1 bg-white bg-opacity-10 border border-gray-500 rounded-l px-3 py-2">
                                            {showSensitiveData 
                                                ? `${profileData.passportSeries} ${profileData.passportNumber}`
                                                : '•••• ••••••'}
                                        </div>
                                        <button
                                            className="px-3 bg-white bg-opacity-10 border border-l-0 border-gray-500 rounded-r hover:bg-opacity-20 transition-colors"
                                            onClick={() => setShowSensitiveData(!showSensitiveData)}
                                        >
                                            {showSensitiveData ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {showSensitiveData ? "Visible" : "Masked"} - Access logged
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
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
            )}
            
            {showTransactionHistoryModal && (
                <TransactionHistoryModal 
                    userAccount={userData.account}
                    onClose={() => setShowTransactionHistoryModal(false)}
                />
            )}
            
            {statementLoading && (
		        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
				   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
			</div>
			)}
						
			<StatementOptionsModal
				isOpen={showStatementOptions}
				onClose={() => setShowStatementOptions(false)}
				onDownload={handleDownloadStatement}
			/>
        </div>
    );
};

export default Dashboard;
