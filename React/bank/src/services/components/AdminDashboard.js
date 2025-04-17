import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getAdminDashboardData, deleteUser, getUserTransactions, activateUser } from '../api';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [showTransactions, setShowTransactions] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
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

  if (!user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
  	return <div className="alert alert-danger">Unauthorized access</div>;
  }

  return (
    <div className="container mt-4">
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

      {/* Transactions Modal */}
	<Modal.Body>
	  {transactionsLoading ? (
		<div className="text-center">
		  <div className="spinner-border text-primary" role="status">
		    <span className="visually-hidden">Loading...</span>
		  </div>
		</div>
	  ) : (
		<ul className="list-group">
		  {showTransactions?.length > 0 ? (
		    showTransactions.map((txn, index) => (
		      <li key={index} className="list-group-item transaction-item">
		        <div className="d-flex justify-content-between align-items-start">
		          <div>
		            <div className="fw-bold">{txn.type}</div>
		            <div>{txn.description}</div>
		            <div className="text-muted small">
		              {txn.sourceAccountNumber && `From: ${txn.sourceAccountNumber}`}
		              {txn.targetAccountNumber && `To: ${txn.targetAccountNumber}`}
		            </div>
		            <small className="text-muted">
		              {new Date(txn.timestamp).toLocaleString()}
		            </small>
		          </div>
		          <span className={`badge rounded-pill ${txn.amount > 0 ? 'bg-success' : 'bg-danger'}`}>
		            ${Math.abs(txn.amount).toFixed(2)}
		          </span>
		        </div>
		      </li>
		    ))
		  ) : (
		    <div className="alert alert-info">No transactions found</div>
		  )}
		</ul>
	  )}
	</Modal.Body>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedUser?.username}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
