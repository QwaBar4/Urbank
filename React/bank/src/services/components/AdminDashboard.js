import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getAdminDashboardData, deleteUser, getUserTransactions, activateUser } from '../api';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [showTransactions, setShowTransactions] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

	useEffect(() => {
	  if (user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
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
	  }
	}, [user, navigate]);

	const handleStatusChange = async (userId, currentStatus) => {
	  try {
		await activateUser(userId, !currentStatus);
		setAdminData(prev => ({
		  ...prev,
		  users: prev.users.map(u => 
		    u.id === userId ? { ...u, active: !currentStatus } : u
		  )
		}));
	  } catch (error) {
		console.error('Full error:', error);
		setError(
		  error.message.includes('403') 
		    ? "Admin privileges required"
		    : error.message || "Failed to update status"
		);
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
      const transactions = await getUserTransactions(userId);
      setShowTransactions(transactions);
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
  	return <div className="alert alert-danger">Unauthorized access</div>;
  }
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

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
      <Modal show={!!showTransactions} onHide={() => setShowTransactions(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Transactions for {showTransactions?.userName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {showTransactions?.map((txn, index) => (
              <li key={index} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <span>{txn.description}</span>
                  <span className={`badge ${txn.amount > 0 ? 'bg-success' : 'bg-danger'}`}>
                    ${Math.abs(txn.amount).toFixed(2)}
                  </span>
                </div>
                <small className="text-muted">{new Date(txn.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>

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
