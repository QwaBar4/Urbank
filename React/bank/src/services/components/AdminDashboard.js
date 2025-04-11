import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './apiService';
import UserTable from './UserTable';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (!user?.roles?.includes('ADMIN')) return <div>Access denied</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserTable users={users} />
    </div>
  );
};

export default AdminDashboard;
