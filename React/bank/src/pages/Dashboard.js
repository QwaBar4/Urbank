import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import logotype from '../assets/logo_purple.png';

const Deposit = React.lazy(() => import('../components/Dashboard/Deposit'));
const Withdraw = React.lazy(() => import('../components/Dashboard/Withdraw'));

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userLoans, setUserLoans] = useState([]);
  const [LoansLoading, setLoansLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: -100,
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

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

  const handleNavigation = (path) => {
    setPageLoading(true);
    setTimeout(() => {
      navigate(path);
      setPageLoading(false);
    }, 150);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!userData) return null;

  const isAdmin = userData.role.includes("ROLE_ADMIN");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Loading overlay */}
      {pageLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
          />
        </motion.div>
      )}

      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logotype} alt="Logo" className="h-8" />
              <span className="font-bold text-lg hover:text-purple-300 transition-colors">Urbank</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    {userData?.username?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-30"
                      onMouseLeave={() => setShowProfileDropdown(false)}
                    >
                      <div className="py-1">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin');
                              setShowProfileDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDetailsModal(true);
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirmation(true);
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                        >
                          Delete Account
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <div className="pt-6 pb-4">
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
                      onClick={() => handleNavigation('/deposit')}
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
                      onClick={() => handleNavigation('/withdraw')}
                      className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center"
                    >
                      <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs">Withdraw</span>
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
              </motion.div>
            } />
            <Route path="/deposit" element={
              <Suspense fallback={<div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Deposit />
                </motion.div>
              </Suspense>
            } />
            <Route path="/withdraw" element={
              <Suspense fallback={<div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Withdraw />
                </motion.div>
              </Suspense>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('/')}
              className="p-3 text-purple-400"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1 block">Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPaymentsModal(true)}
              className="p-3 text-gray-400 hover:text-purple-400"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1 block">Payments</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('/apply-loan')}
              className="p-3 text-gray-400 hover:text-purple-400"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs mt-1 block">Loans</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTransactionHistoryModal(true)}
              className="p-3 text-gray-400 hover:text-purple-400"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1 block">History</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileModal(true)}
              className="p-3 text-gray-400 hover:text-purple-400"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1 block">Profile</span>
            </motion.button>
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

      {showDeleteConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700"
          >
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
          </motion.div>
        </motion.div>
      )}

      {showUserDetailsModal && profileData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Your Full Details, {profileData.username}</h3>
              <button 
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setShowSensitiveData(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-yellow-500 bg-opacity-20 p-3 rounded-lg border border-yellow-500 mb-4"
            >
              <p>⚠️ Sensitive Data - Access Logged</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                    <div className="flex-1 bg-gray-700 border border-gray-500 rounded-l px-3 py-2">
                      {showSensitiveData 
                        ? `${profileData.passportSeries} ${profileData.passportNumber}`
                        : '•••• ••••••'}
                    </div>
                    <button
                      className="px-3 bg-gray-700 border border-l-0 border-gray-500 rounded-r hover:bg-gray-600 transition-colors"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex justify-end"
            >
              <button
                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setShowSensitiveData(false);
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
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

      {showTransactionHistoryModal && (
        <TransactionHistoryModal 
          userAccount={userData.account}
          onClose={() => setShowTransactionHistoryModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
