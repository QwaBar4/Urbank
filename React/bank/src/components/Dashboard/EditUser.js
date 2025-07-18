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
            <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
                <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 max-w-md w-full">
                    <p>Unauthorized access</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
                <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 max-w-md w-full">
                    <p>User not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-medium">Edit User: {userData.username}</h2>
                        <button 
                            onClick={() => navigate('/admin')}
                            className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Admin
                        </button>
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

                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-6">
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Role</label>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="role"
                                    value="ROLE_USER"
                                    checked={formData.role === 'ROLE_USER'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                                />
                                <span>USER</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="role"
                                    value="ROLE_ADMIN"
                                    checked={formData.role === 'ROLE_ADMIN'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                                />
                                <span>ADMIN</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => navigate('/admin')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
