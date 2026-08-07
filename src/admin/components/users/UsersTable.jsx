import UserActionButtons from './UserActionButtons';

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

export default function UsersTable({ users, loading, onApprove, onSuspend, onReactivate, onOpenDetails }) {
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="admin-table-row" onClick={() => onOpenDetails?.(user)}>
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
              <td>
                <UserActionButtons
                  user={user}
                  loading={loading}
                  onApprove={() => onApprove(user)}
                  onSuspend={() => onSuspend(user)}
                  onReactivate={() => onReactivate(user)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
