import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import Transfer from '../components/Dashboard/Transfer';
import api from '../services/api';
import StatementOptionsModal from '../components/Dashboard/StatementOptionsModal';
import TransactionHistoryModal from '../components/Dashboard/TransactionHistoryModal';
import BalanceCard from '../components/Dashboard/BalanceCard';
import ProfileUpdateModal from '../components/Dashboard/ProfileUpdateModal';
import LoanPaymentCard from '../components/Dashboard/LoanPaymentCard'; // New component
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
    const [userLoans, setUserLoans] = useState([]);
    const [loansLoading, setLoansLoading] = useState(false);
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
                fetchUserLoans(); // Fetch loans after user data is loaded
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

    const fetchUserLoans = async () => {
        setLoansLoading(true);
        try {
            const loans = await api.getUserLoans();
            setUserLoans(loans.filter(loan => loan.status === 'APPROVED')); // Only show approved loans
        } catch (error) {
            console.error('Error loading loans:', error);
            setError('Failed to load your loans');
        } finally {
            setLoansLoading(false);
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

    const handlePaymentSuccess = async () => {
        await refreshBalance();
        await fetchUserLoans(); // Refresh loan data after payment
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!userData) return null;

    const isAdmin = userData.role.includes("ROLE_ADMIN");

    return (
        <div className="min-h-screen bg-black text-white">
            {/* New Header */}
            <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src={logotype} alt="Logo" className="h-8" />
                        <h1 className="text-xl font-bold">Urbank Dashboard</h1>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => setShowStatementOptions(true)}
                            className="text-purple-400 hover:text-purple-300 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Statement
                        </button>
                        
                        <div className="relative group">
                            <button className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                    {userData?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span>{userData?.username}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 hidden group-hover:block">
                                <button 
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Welcome Card */}
                <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {userData?.username}!</h2>
                    <p className="text-gray-400">Here's what's happening with your account today.</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <BalanceCard
                        accountNumber={userData.account.accountNumber}
                        balance={userData.account.balance}
                        refreshBalance={refreshBalance}
                    />
                    
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/apply-loan')}
                                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                            >
                                Apply for Loan
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Admin Dashboard
                                </button>
                            )}
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Update Profile
                            </button>
                        </div>
                    </div>
                    
                    <Transfer 
                        userAccount={userData.account}
                        refreshBalance={refreshBalance}
                    />
                </div>

				{/* Loan Payments Section */}
				{userLoans.length > 0 && (
					<div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-bold">Your Active Loans</h2>
							<button 
								onClick={fetchUserLoans}
								className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
								disabled={loansLoading}
							>
								{loansLoading ? (
								    <>
								        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								        </svg>
								        Refreshing...
								    </>
								) : (
								    <>
								        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								        </svg>
								        Refresh
								    </>
								)}
							</button>
						</div>
						
						{loansLoading ? (
							<div className="flex justify-center p-4">
								<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
							</div>
						) : (
							<div className="space-y-4">
								{userLoans.map(loan => (
								    <LoanPaymentCard 
								        key={loan.id}
								        loan={loan}
								        onPaymentSuccess={handlePaymentSuccess}
								    />
								))}
							</div>
						)}
					</div>
				)}

				{/* Transaction History */}
				<div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-bold">Transaction History</h2>
						<button 
							onClick={() => setShowTransactionHistoryModal(true)}
							className="text-purple-400 hover:text-purple-300 flex items-center text-sm"
						>
							<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							View Full History
						</button>
					</div>
					<p className="text-gray-400 text-sm">
						View your complete transaction history and download statements.
					</p>
				</div>

				{/* Account Management */}
				<div className="mt-6 bg-gray-900 rounded-xl p-6 border border-gray-800">
					<h2 className="text-lg font-bold mb-4">Account Management</h2>
					<div className="space-y-3">
						<button
							onClick={() => setShowUserDetailsModal(true)}
							className="w-full text-left p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
						>
							<div className="flex items-center justify-between">
								<div>
								    <h3 className="font-medium">Account Details</h3>
								    <p className="text-sm text-gray-400 mt-1">View your personal and account information</p>
								</div>
								<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</button>
						<button
							onClick={() => setShowDeleteConfirmation(true)}
							className="w-full text-left p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-red-900"
						>
							<div className="flex items-center justify-between">
								<div>
								    <h3 className="font-medium text-red-400">Delete Account</h3>
								    <p className="text-sm text-red-500 mt-1">Permanently remove your account and all data</p>
								</div>
								<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</div>
						</button>
					</div>
				</div>
            </main>

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
