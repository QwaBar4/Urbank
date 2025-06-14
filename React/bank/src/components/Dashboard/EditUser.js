import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDetails, updateUser } from '../../services/api';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: ''
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
          role: data.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER'
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
        roles: [formData.role]
      };
      
      await updateUser(userId, updateData);
      setSuccess('User updated successfully!');
      
      const data = await getUserDetails(userId);
      setUserData(data);
      setFormData({
        username: data.username,
        email: data.email,
        role: data.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER'
      });
    } catch (error) {
      setError(error.message);
    }
  };

  if (!currentUser?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN')) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
      <div className="relative z-10 max-w-4xl mx-auto w-full">
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
                Edit User: {userData.username}
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

        {error && (
          <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-6">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg border border-green-500 mb-6">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-black bg-opacity-70 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              className="w-full bg-white bg-opacity-10 border border-gray-500 rounded px-3 py-2"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full bg-white bg-opacity-10 border border-gray-500 rounded px-3 py-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Role</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="ROLE_USER"
                  checked={formData.role === 'ROLE_USER'}
                  onChange={handleChange}
                  className="bg-white bg-opacity-10 border border-gray-500"
                />
                <span>USER</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="ROLE_ADMIN"
                  checked={formData.role === 'ROLE_ADMIN'}
                  onChange={handleChange}
                  className="bg-white bg-opacity-10 border border-gray-500"
                />
                <span>ADMIN</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
              onClick={() => navigate('/admin')}
            >
              Back to Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
