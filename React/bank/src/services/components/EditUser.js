import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getUserDetails, updateUser } from '../api';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [formState, setFormState] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserDetails(userId);
        setUserData(data);
        setFormState({
          username: data.username,
          email: data.email,
          active: data.active
        });
      } catch (error) {
        setError('Failed to fetch user data');
      }
    };

    if (admin?.roles?.includes('ROLE_ADMIN')) fetchUser();
  }, [userId, admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(userId, formState);
      navigate('/admin-dashboard');
    } catch (error) {
      setError('Failed to update user');
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Edit User: {userData.username}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            value={formState.username}
            onChange={(e) => setFormState({...formState, username: e.target.value})}
          />
        </div>
        
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={formState.email}
            onChange={(e) => setFormState({...formState, email: e.target.value})}
          />
        </div>
        
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formState.active}
            onChange={(e) => setFormState({...formState, active: e.target.checked})}
            id="activeCheck"
          />
          <label className="form-check-label" htmlFor="activeCheck">
            Active
          </label>
        </div>
        
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
