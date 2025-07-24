import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminDashboardData, deleteUser, getUserTransactions, activateUser, getUserAuditLogs } from '../services/api';
import api from '../services/api';
import logotype from '../assets/logo_purple.png';
import '../index.css'

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [showTransactions, setShowTransactions] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showStatementOptions, setShowStatementOptions] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);
  const [selectedUserForStatement, setSelectedUserForStatement] = useState(null);  
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminDashboardData();
        setAdminData(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const result = await activateUser(userId, !currentStatus);
      console.log('Activation success:', result);

      setAdminData(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.id === userId ? { ...u, active: !currentStatus } : u
        )
      }));
    } catch (error) {
      let errorMessage = error.message;

      if (error.message.includes('Failed to parse')) {
        errorMessage = "Server returned invalid response. Check backend logs.";
      } else if (error.message.includes('Non-JSON')) {
        errorMessage = "Server error occurred. Please try again.";
      }

      setError(errorMessage);
    }
  };

  const adminTransitionVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      const updatedData = await getAdminDashboardData();
      setAdminData(updatedData);
    } catch (error) {
      setError(error.message);
    }
  };

  const viewUserDetails = async (userId) => {
    if (!window.confirm('You are about to view sensitive personal data. Confirm?')) return;
    try {
      setSelectedUserDetails(null);
      const userDetails = await api.getUserFullDetails(userId);
      setSelectedUserDetails(userDetails);
      setShowSensitiveData(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      setError('Failed to load sensitive data');
      setShowSensitiveData(false);
    }
  };

  const viewTransactions = async (userId) => {
    try {
      setTransactionsLoading(true);
      setError(null);
      const transactions = await getUserTransactions(userId);
      setShowTransactions(transactions);
    } catch (error) {
      setError(error.message || 'Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };
  
  const handleAdminDownloadStatement = async (theme) => {
    try {
      setStatementLoading(true);
      setError(null);
      
      if (!selectedUserForStatement?.id) {
        throw new Error('No user selected for statement');
      }

      const pdfBlob = await api.generateUserStatementByID(
        selectedUserForStatement.id,
        selectedTheme
      );
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Received empty PDF file from server');
      }

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${selectedUserForStatement.username}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setShowStatementOptions(false);
    } catch (error) {
      console.error('Statement Download Failed:', {
        user: selectedUserForStatement,
        error: error.toString()
      });
      
      let displayError = error.message;
      if (error.message.includes('500')) {
        displayError = `Server error generating PDF for user ${selectedUserForStatement.username}. 
                       Please check if this user has valid account data.`;
      }
      
      setError(displayError);
    } finally {
      setStatementLoading(false);
    }
  };

  const viewAuditLogs = async (userId) => {
    try {
      setError(null);
      const logs = await getUserAuditLogs(userId);
      const safeLogs = logs.map(log => ({
        ...log,
        username: log.username.startsWith("USER-") ? "Anonymous User" : log.username,
        details: log.details || "No details available"
      }));
      setAuditLogs(safeLogs);
      setShowAuditLogsModal(true);
    } catch (error) {
      setError(error.message || 'Failed to load audit logs');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out: ' + error.message);
    }
  };

  if (!user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
            <p>Unauthorized access</p>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gray-900 text-white">
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={adminTransitionVariants}
        transition={{ duration: 0.3 }}
      >
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img src={logotype} alt="Logo" className="h-8" />
                <span className="font-bold text-lg hover:text-purple-300 transition-colors">Urbank Admin</span>
              </motion.div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="flex items-center space-x-2"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </motion.div>
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
                          <button
                            onClick={() => {
                              navigate('/dashboard');
                              setShowProfileDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            User Dashboard
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pt-6 pb-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-6"
              >
                <p>{error}</p>
              </motion.div>
            )}

            {adminData && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-xl font-bold mb-4">System Statistics</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400">Total Users</p>
                          <p className="text-2xl font-bold">{adminData.totalUsers}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400">Active Users</p>
                          <p className="text-2xl font-bold">{adminData.users.filter(u => u.active).length}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400">Inactive Users</p>
                          <p className="text-2xl font-bold">{adminData.users.filter(u => !u.active).length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-xl font-bold mb-4">User Management</h2>
                      <div className="space-y-4">
                        {adminData.users.map(user => (
                          <div key={user.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-gray-400">Username</p>
                                <p>{user.username}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Email</p>
                                <p>{user.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Status</p>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.active ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-red-500 bg-opacity-20 text-red-500'
                                }`}>
                                  {user.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                                onClick={() => handleStatusChange(user.id, user.active)}
                              >
                                {user.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => viewUserDetails(user.id)}
                              >
                                View Details
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => navigate(`/edit-user/${user.id}`)}
                              >
                                Edit
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => viewTransactions(user.id)}
                              >
                                Transactions
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => viewAuditLogs(user.id)}
                              >
                                Audit Logs
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => navigate('/admin/loans')}
                              >
                                Manage Loans
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                                onClick={() => {
                                  setSelectedUserForStatement(user);
                                  setShowStatementOptions(true);
                                }}
                              >
                                Download Statement
                              </button>
                              <button
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                </motion.div>
              </div>
            )}
          </motion.div>
        </main>

        {/* Statement Options Modal */}
        {showStatementOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Statement Options</h3>
                <button
                  onClick={() => setShowStatementOptions(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-medium text-gray-300">Select Theme</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      selectedTheme === 'dark'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedTheme('dark')}
                  >
                    Dark Theme
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      selectedTheme === 'light'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedTheme('light')}
                  >
                    Light Theme
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => setShowStatementOptions(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                  onClick={() => handleAdminDownloadStatement()}
                  disabled={statementLoading}
                >
                  {statementLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : 'Download Statement'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Modal */}
        {showTransactions !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Transactions for {selectedUser?.username}</h3>
                <button
                  onClick={() => setShowTransactions(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Details</th>
                      <th className="text-left p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsLoading ? (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
                        </td>
                      </tr>
                    ) : showTransactions?.length > 0 ? (
                      showTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="p-3">{new Date(transaction.timestamp).toLocaleString()}</td>
                          <td className="p-3">{transaction.type}</td>
                          <td className="p-3">
                            {transaction.type === 'TRANSFER' && (
                              <>
                                <div className="text-gray-400 text-sm mb-1">
                                  From: {transaction.sourceAccountOwner || 'N/A'}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  To: {transaction.targetAccountOwner || 'N/A'}
                                </div>
                              </>
                            )}
                            {transaction.description && <div className="mt-1">Message: {transaction.description}</div>}
                          </td>
                          <td className={`p-3 ${
                            transaction.type === 'DEPOSIT' ? 'text-green-400' :
                            transaction.sourceAccountOwner === selectedUser?.username ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {transaction.type === 'TRANSFER' && transaction.sourceAccountOwner === transaction.targetAccountOwner
                              ? `${Math.abs(transaction.amount).toFixed(2)}$`
                              : transaction.sourceAccountOwner === selectedUser?.username
                              ? `+${Math.abs(transaction.amount).toFixed(2)}$`
                              : `-${Math.abs(transaction.amount).toFixed(2)}$`}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg border border-blue-500">
                            No transactions found
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Modal */}
        {showAuditLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Audit Logs</h3>
                <button
                  onClick={() => setShowAuditLogsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {auditLogs ? (
                  <>
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold">{log.action}</div>
                              <div className="text-gray-400">User: {log.username}</div>
                              <div>Details: {log.details}</div>
                              <div className="text-gray-400 text-sm mt-1">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg border border-blue-500">
                        No audit logs found
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg border border-blue-500">
                    No audit logs available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showSensitiveData && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">User Details</h3>
                <button
                  onClick={() => setShowSensitiveData(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                  <p>{error}</p>
                </div>
              )}

              {!selectedUserDetails ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Account Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-semibold">Username:</span> {selectedUserDetails.username}</p>
                      <p><span className="font-semibold">Email:</span> {selectedUserDetails.email}</p>
                      <p><span className="font-semibold">Account Number:</span> {selectedUserDetails.accountNumber}</p>
                      <p><span className="font-semibold">Balance:</span> {selectedUserDetails.balance.toFixed(2)}$</p>
                      <p><span className="font-semibold">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedUserDetails.active ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-red-500 bg-opacity-20 text-red-500'
                        }`}>
                          {selectedUserDetails.active ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-semibold">First Name:</span> {selectedUserDetails.firstName}</p>
                      <p><span className="font-semibold">Last Name:</span> {selectedUserDetails.lastName}</p>
                      <p><span className="font-semibold">Middle Name:</span> {selectedUserDetails.middleName || 'N/A'}</p>
                      <div className="mb-4">
                        <label className="block mb-1 font-semibold">Passport Details</label>
                        <div className="flex">
                          <div className="flex-1 bg-gray-700 border border-gray-500 rounded-l px-3 py-2">
                            {showSensitiveData
                              ? `${selectedUserDetails.passportSeries} ${selectedUserDetails.passportNumber}`
                              : '•••• ••••••'}
                          </div>
                          <button
                            className="px-3 bg-gray-700 border border-l-0 border-gray-500 rounded-r hover:bg-gray-600 transition-colors"
                            onClick={() => setShowSensitiveData(!showSensitiveData)}
                          >
                            {showSensitiveData ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      <p><span className="font-semibold">Date of Birth:</span> {new Date(selectedUserDetails.dateOfBirth).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Roles:</span> {selectedUserDetails.roles?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete {selectedUser?.username}?</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
                  onClick={handleDelete}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
);
};

export default AdminDashboard;

