import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getAdminDashboardData, deleteUser, getUserTransactions, activateUser, getUserAuditLogs } from '../services/api';
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

      // Handle specific error cases
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
      const response = await api.getUserFullDetails(userId);
      setSelectedUserDetails(response.data);
      setShowSensitiveData(false); // Reset visibility state
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load sensitive data');
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
    return <div className="alert alert-danger">Unauthorized access</div>;
  }

  return (
    <div className="container mt-4">
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline-warning"
        >
          Back to Dashboard
        </button>
      </div>

      {adminData && (
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title mb-4">System Statistics</h2>
            <p className="lead">Total Users: {adminData.totalUsers}</p>

            <h3 className="mb-3">User List</h3>
            <ul className="list-group">
              {adminData.users.map(user => (
                <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="w-50">
                    <h5>{user.username}</h5>
                    <p className="mb-0">{user.email}</p>
                    <small className="text-muted">Status: {user.active ? 'Active' : 'Inactive'}</small>
                  </div>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${user.active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleStatusChange(user.id, user.active)}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => navigate(`/edit-user/${user.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => viewTransactions(user.id)}
                    >
                      Transactions
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => viewAuditLogs(user.id)}
                    >
                      Audit Logs
                    </button>
                    <button
                      className="btn btn-sm btn-success"
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
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modals */}
      <>
        {/* Transactions Modal */}
        <div className={`modal ${showTransactions !== null ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowTransactions(null)}>&times;</span>
            <h2>Transactions</h2>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : showTransactions?.length > 0 ? (
                    showTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                        <td>{transaction.type}</td>
                        <td>
                          {transaction.type === 'TRANSFER' && (
                            <>
                              <div className="small text-muted">
                                From: {transaction.sourceAccountOwner || 'N/A'}
                              </div>
                              <div className="small text-muted">
                                To: {transaction.targetAccountOwner || 'N/A'}
                              </div>
                            </>
                          )}
                          {transaction.description && `Message: ${transaction.description}`}
                        </td>
                        <td className={`text-end ${
                          transaction.type === 'DEPOSIT' ? 'text-success' :
                          transaction.sourceAccountOwner === selectedUser?.username ? 'text-danger' : 'text-success'
                        }`}>
                          {transaction.type === 'TRANSFER' && transaction.sourceAccountOwner === selectedUser?.username
                            ? `-${Math.abs(transaction.amount).toFixed(2)}$`
                            : `+${Math.abs(transaction.amount).toFixed(2)}$`}
                        </td>
                        <td>{transaction.status}</td>
                        <td className="text-muted small">{transaction.reference}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        <div className="alert alert-info m-3">No transactions found</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Logs Modal */}
        <div className={`modal ${showAuditLogsModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowAuditLogsModal(false)}>&times;</span>
            <h2>Audit Logs</h2>
            <div className="list-group" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {auditLogs ? (
                <>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold">{log.action}</div>
                            <div>User: {log.username}</div>
                            <div>Details: {log.details}</div>
                            <small className="text-muted">
                              {new Date(log.timestamp).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert alert-info">No audit logs found</div>
                  )}
                </>
              ) : (
                <div className="alert alert-info">No audit logs available</div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <div className={`modal ${showDeleteModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowDeleteModal(false)}>&times;</span>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {selectedUser?.username}?</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUserDetails && (
          <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Details - {selectedUserDetails.username}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedUserDetails(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="bi bi-shield-lock"></i> Sensitive Data - Access Logged
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <h5>Personal Information</h5>
                      <p>
                        <strong>Name:</strong> {selectedUserDetails.firstName} {selectedUserDetails.lastName}
                      </p>
                      <p>
                        <strong>Middle Name:</strong> {selectedUserDetails.middleName || 'N/A'}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong>{" "}
                        {new Date(selectedUserDetails.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="col-md-6">
                      <h5>Passport Data</h5>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-passport"></i>
                        </span>
                        <input
                          type={showSensitiveData ? "text" : "password"}
                          className="form-control"
                          value={
                            showSensitiveData
                              ? `${selectedUserDetails.passportSeries} ${selectedUserDetails.passportNumber}`
                              : "•••• ••••••"
                          }
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowSensitiveData(!showSensitiveData)}
                        >
                          <i className={`bi bi-eye${showSensitiveData ? "-slash" : ""}`}></i>
                        </button>
                      </div>
                      <small className="text-muted">
                        {showSensitiveData ? "Visible" : "Masked"} - Access logged
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedUserDetails(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default AdminDashboard;
