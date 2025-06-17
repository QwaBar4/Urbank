import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminDashboardData, deleteUser, getUserTransactions, activateUser, getUserAuditLogs } from '../services/api';
import api from '../services/api';
import StatementOptionsModal from '../components/Dashboard/StatementOptionsModal';
import '../index.css';

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
		const response = await api.generateUserStatementByID(
		selectedUserForStatement.id, 
		selectedUserForStatement.username,
		theme // Pass theme
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

  if (!user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Header */}
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
                Admin Dashboard
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
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-6">
            <p>{error}</p>
          </div>
        )}

        {adminData && (
          <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">System Statistics</h2>
            <p className="mb-6">Total Users: {adminData.totalUsers}</p>

            <h2 className="text-xl font-bold mb-4">User List</h2>
            <div className="space-y-4">
              {adminData.users.map(user => (
                <div key={user.id} className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700">
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
                      <p>{user.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => handleStatusChange(user.id, user.active)}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => navigate(`/edit-user/${user.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => viewTransactions(user.id)}
                    >
                      Transactions
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => viewAuditLogs(user.id)}
                    >
                      Audit Logs
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                      onClick={async () => {
                        try {
                          const response = await api.generateUserStatementByID(user.id, user.username);
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
                        }
                      }}
                    >
                      Download Statement
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
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
        )}
      </div>
	  <StatementOptionsModal
		isOpen={showStatementOptions}
		onClose={() => setShowStatementOptions(false)}
		onDownload={handleAdminDownloadStatement}
	  />
      {/* Modals */}
      {/* Transactions Modal */}
      {showTransactions !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
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
                      <tr key={transaction.id} className="border-b border-gray-700">
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
          <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
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
                      <div key={index} className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700">
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
          <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-4xl w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
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
                    <p><span className="text-gray-400">Username:</span> {selectedUserDetails.username}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedUserDetails.email}</p>
                    <p><span className="text-gray-400">Account Number:</span> {selectedUserDetails.accountNumber}</p>
                    <p><span className="text-gray-400">Balance:</span> {selectedUserDetails.balance.toFixed(2)}$</p>
                    <p><span className="text-gray-400">Status:</span> {selectedUserDetails.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-400">First Name:</span> {selectedUserDetails.firstName}</p>
                    <p><span className="text-gray-400">Last Name:</span> {selectedUserDetails.lastName}</p>
                    <p><span className="text-gray-400">Middle Name:</span> {selectedUserDetails.middleName || 'N/A'}</p>
                    <p><span className="text-gray-400">Passport:</span> {selectedUserDetails.passportSeries} {selectedUserDetails.passportNumber}</p>
                    <p><span className="text-gray-400">Date of Birth:</span> {new Date(selectedUserDetails.dateOfBirth).toLocaleDateString()}</p>
                    <p><span className="text-gray-400">Roles:</span> {selectedUserDetails.roles?.join(', ')}</p>
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
          <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-md w-full border border-gray-700">
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
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                onClick={handleDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
