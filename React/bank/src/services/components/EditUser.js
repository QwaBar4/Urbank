import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getUserDetails, updateUser } from '../api';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roles: []
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserDetails(userId);
        setUserData(data);
        setFormData({
          username: data.username,
          email: data.email,
          roles: data.roles || []
        });
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => {
        const newRoles = checked 
          ? [...prev.roles, value]
          : prev.roles.filter(role => role !== value);
        return { ...prev, roles: newRoles };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

	const handleSubmit = async (e) => {
	  e.preventDefault();
	  try {
		setError(null);
		setSuccess(null);
		
		const updateData = {
		  username: formData.username,
		  email: formData.email,
		  roles: Array.from(formData.roles) // Convert Set to Array if needed
		};
		
		await updateUser(userId, updateData);
		setSuccess('User updated successfully!');
		
		// Refresh user data
		const data = await getUserDetails(userId);
		setUserData(data);
		setFormData({
		  username: data.username,
		  email: data.email,
		  roles: new Set(data.roles) // Convert array to Set if needed
		});
	  } catch (error) {
		setError(error.message);
	  }
	};

  if (!currentUser?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
    return <div className="alert alert-danger">Unauthorized access</div>;
  }

  if (loading) {
    return <div className="text-center mt-4">Loading user data...</div>;
  }

  if (!userData) {
    return <div className="alert alert-danger">User not found</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit User: {userData.username}</h1>
        <button 
          onClick={() => navigate('/admin')}
          className="btn btn-outline-secondary"
        >
          Back to Admin Dashboard
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Roles</Form.Label>
          <div>
            <Form.Check
              type="checkbox"
              id="role-user"
              label="USER"
              value="ROLE_USER"
              checked={formData.roles.includes('ROLE_USER')}
              onChange={handleChange}
            />
            <Form.Check
              type="checkbox"
              id="role-admin"
              label="ADMIN"
              value="ROLE_ADMIN"
              checked={formData.roles.includes('ROLE_ADMIN')}
              onChange={handleChange}
            />
          </div>
        </Form.Group>

        <Button variant="primary" type="submit" className="me-2">
          Save Changes
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default EditUser;
