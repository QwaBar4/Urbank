import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import api from './apiService';

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

  if (!user?.isAdmin) return <div>Access denied</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserTable users={users} />
    </div>
  );
};
