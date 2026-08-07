import { useState } from 'react';
import { formatDateForDisplay } from '../../utils/dateUtils';

function formatDate(value) {
  return formatDateForDisplay(value);
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-GB');
  } catch {
    return '—';
  }
}

export default function UsersTable({ users, loading, onApplyAction, onOpenDetails }) {
  const [actionSelection, setActionSelection] = useState({});

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
                <div className="admin-actions-row">
                  <select
                    value={actionSelection[user.id] || ''}
                    onChange={(event) => setActionSelection((current) => ({ ...current, [user.id]: event.target.value }))}
                    style={{ minWidth: 120 }}
                  >
                    <option value="">Select action</option>
                    <option value="trial">Trial</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="extend">Extend</option>
                    <option value="expire">Expire</option>
                  </select>
                  <button type="button" className="admin-action-btn" disabled={loading || !actionSelection[user.id]} onClick={() => onApplyAction?.(user, actionSelection[user.id])}>Apply</button>
                  <button type="button" className="admin-action-btn approve" onClick={() => onOpenDetails?.(user)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
