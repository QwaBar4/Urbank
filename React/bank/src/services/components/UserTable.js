const UserTable = ({ users, assignRole, removeRole }) => (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>Roles</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.username}</td>
          <td>{user.email}</td>
          <td>{user.roles.join(", ")}</td>
          <td>
            <button onClick={() => assignRole(user.id, 'ADMIN')}>Assign Admin</button>
            <button onClick={() => removeRole(user.id, 'ADMIN')}>Remove Admin</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
