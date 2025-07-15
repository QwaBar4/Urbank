import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getDashboardData } from '../services/api';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import api from '../services/api';
import StatementOptionsModal from '../components/Dashboard/StatementOptionsModal';
import TransactionHistoryModal from '../components/Dashboard/TransactionHistoryModal';
import BalanceCard from '../components/Dashboard/BalanceCard';
import ProfileUpdateModal from '../components/Dashboard/ProfileUpdateModal';
import LoanPaymentCard from '../components/Dashboard/LoanPaymentCard';
import TransferModal from '../components/Dashboard/TransferModal';
import PaymentsModal from '../components/Dashboard/PaymentsModal';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
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
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
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
                fetchUserLoans();
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
            setUserLoans(loans.filter(loan => loan.status === 'APPROVED'));
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
        await fetchUserLoans();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!userData) return null;

    const isAdmin = userData.role.includes("ROLE_ADMIN");

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={logotype} alt="Logo" className="h-8" />
                            <span className="font-medium">Urbank</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            
                            <div className="relative">
                                <button className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                        {userData?.username?.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                                
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 hidden group-hover:block">
                                    <div className="py-1">
                                        <button 
                                            onClick={() => setShowProfileModal(true)}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                        >
                                            My Profile
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pb-20">
                <div className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-medium">Account Overview</h2>
                        <button 
                            onClick={refreshBalance}
                            className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                    
                    <BalanceCard
                        accountNumber={userData.account.accountNumber}
                        balance={userData.account.balance}
                        refreshBalance={refreshBalance}
                    />
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-4 gap-3">
                        <button 
                            onClick={() => setShowTransferModal(true)}
                            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center"
                        >
                            <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </div>
                            <span className="text-xs">Transfer</span>
                        </button>
                        
                        <button 
                            onClick={() => navigate('/deposit')}
                            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center"
                        >
                            <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs">Deposit</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowStatementOptions(true)}
                            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center"
                        >
                            <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-xs">Statement</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowPaymentsModal(true)}
                            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center"
                        >
                            <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <span className="text-xs">Payments</span>
                        </button>
                    </div>
                </div>

				<div className="mt-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-medium">Recent Transactions</h2>
					</div>
					
					<RecentTransactions accountNumber={userData?.account?.accountNumber} />
				</div>

                {userLoans.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-medium mb-4">Your Loans</h2>
                        <div className="space-y-3">
                            {userLoans.map(loan => (
                                <LoanPaymentCard 
                                    key={loan.id}
                                    loan={loan}
                                    onPaymentSuccess={handlePaymentSuccess}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-around">
                        <button className="p-3 text-purple-400">
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-xs mt-1 block">Home</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowPaymentsModal(true)}
                            className="p-3 text-gray-400 hover:text-purple-400"
                        >
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs mt-1 block">Payments</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowTransactionHistoryModal(true)}
                            className="p-3 text-gray-400 hover:text-purple-400"
                        >
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs mt-1 block">History</span>
                        </button>
                        
                        <button className="p-3 text-gray-400 hover:text-purple-400">
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1 block">Profile</span>
                        </button>
                    </div>
                </div>
            </nav>

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

            {showTransferModal && (
                <TransferModal 
                    userAccount={userData.account}
                    refreshBalance={refreshBalance}
                    onClose={() => setShowTransferModal(false)}
                />
            )}

            {showPaymentsModal && (
                <PaymentsModal 
                    onClose={() => setShowPaymentsModal(false)}
                />
            )}

            {showStatementOptions && (
                <StatementOptionsModal 
                    isOpen={showStatementOptions}
                    onClose={() => setShowStatementOptions(false)}
                    onDownload={handleDownloadStatement}
                />
            )}
        </div>
    );
};

export default Dashboard;
