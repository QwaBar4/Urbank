import React, { useEffect, useState } from 'react'; // Ensure React and hooks are imported
import { useAuth } from './AuthContext'; // Adjust the path if necessary
import { getAdminDashboardData } from '../api'; // Adjust the path if necessary

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const data = await getAdminDashboardData();
        setAdminData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (user?.roles?.some(r => r.toUpperCase() === 'ADMIN')) {
      fetchAdminData();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {adminData && (
        <div>
          <h2>System Statistics</h2>
          <p>Total Users: {adminData.totalUsers}</p>
          <h3>User List</h3>
          <ul>
            {adminData.users.map(user => (
              <li key={user.id}>
                {user.username} - {user.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
