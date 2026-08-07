function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB');
  } catch {
    return '—';
  }
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-GB');
  } catch {
    return '—';
  }
}

export default function UsersTable({ users }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Workspace</th>
            <th>Plan</th>
            <th>Start</th>
            <th>End</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name || '—'}</td>
              <td>{user.email || '—'}</td>
              <td>{user.role || '—'}</td>
              <td>
                <span className={`admin-status-pill status-${user.approval_status || 'pending'}`}>
                  {user.approval_status || 'pending'}
                </span>
              </td>
              <td>{user.selected_workspace || '—'}</td>
              <td>{user.subscription_plan || '—'}</td>
              <td>{formatDate(user.subscription_start)}</td>
              <td>{formatDate(user.subscription_end)}</td>
              <td>{formatDateTime(user.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
