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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={logotype} alt="Logo" className="h-8 mr-3" />
                        <h1 className="text-xl font-semibold text-gray-800">Urbank Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">Welcome, {userData.username}</span>
                        <button 
                            onClick={handleLogout}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Quick Actions */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        onClick={() => setShowStatementOptions(true)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
                    >
                        <h3 className="font-medium text-gray-800">Download Statement</h3>
                        <p className="text-sm text-gray-500 mt-1">Get your account summary</p>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/apply-loan')}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
                    >
                        <h3 className="font-medium text-gray-800">Apply for Loan</h3>
                        <p className="text-sm text-gray-500 mt-1">Explore loan options</p>
                    </button>
                    
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
                    >
                        <h3 className="font-medium text-gray-800">Update Profile</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage your information</p>
                    </button>
                    
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
                        >
                            <h3 className="font-medium text-gray-800">Admin Dashboard</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage system settings</p>
                        </button>
                    )}
                </div>

                {/* Balance and Transfer Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

                {/* Loan Payments Section */}
                {userLoans.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Your Active Loans</h2>
                            <button 
                                onClick={fetchUserLoans}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                disabled={loansLoading}
                            >
                                {loansLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                        
                        {loansLoading ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
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
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
                        <button 
                            onClick={() => setShowTransactionHistoryModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View Full History
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        View your complete transaction history and statements.
                    </p>
                </div>

                {/* Account Management */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Management</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowUserDetailsModal(true)}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                            <h3 className="font-medium text-gray-800">View Account Details</h3>
                            <p className="text-sm text-gray-500 mt-1">See your full account information</p>
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="w-full text-left p-3 rounded-lg border border-red-200 hover:border-red-300 transition-colors text-red-600"
                        >
                            <h3 className="font-medium">Delete Account</h3>
                            <p className="text-sm text-red-500 mt-1">Permanently remove your account</p>
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
