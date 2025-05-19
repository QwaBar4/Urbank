import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDetails, updateUser } from '../../services/api';
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
    role: '' // Use a single role instead of a Set
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
          role: data.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER' // Set the initial role
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      
      const updateData = {
        username: formData.username,
        email: formData.email,
        roles: [formData.role] // Send the selected role as an array
      };
      
      await updateUser(userId, updateData);
      setSuccess('User updated successfully!');
      
      // Refresh user data
      const data = await getUserDetails(userId);
      setUserData(data);
      setFormData({
        username: data.username,
        email: data.email,
        role: data.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER' // Update the role
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
    <div className="container mt-4 ml-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit User: {userData.username}</h1>
        <button 
          onClick={() => navigate('/admin')}
          className="btn btn-outline-secondary border border-black"
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
            className="ml-2 border border-black"
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
            className="ml-2 border border-black"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 border border-black w-20">
          <Form.Label>Role</Form.Label>
          <div>
            <Form.Check
              type="radio"
              id="role-user"
              label="USER"
              name="role"
 value="ROLE_USER"
              checked={formData.role === 'ROLE_USER'}
              onChange={handleChange}
            />
            <Form.Check
              type="radio"
              id="role-admin"
              label="ADMIN"
              name="role"
              value="ROLE_ADMIN"
              checked={formData.role === 'ROLE_ADMIN'}
              onChange={handleChange}
            />
          </div>
        </Form.Group>

        <Button variant="primary" type="submit" className="me-2 border border-black">
          Save Changes
        </Button>
        <Button variant="secondary" className="border border-black" onClick={() => navigate('/admin')}>
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default EditUser ;
