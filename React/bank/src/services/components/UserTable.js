const UserTable = ({ users }) => (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.username}</td>
          <td>{user.email}</td>
          <td>
            <button onClick={() => lockUser(user.id)}>Lock</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
