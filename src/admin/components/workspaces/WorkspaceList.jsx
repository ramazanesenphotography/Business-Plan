function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB');
  } catch {
    return '—';
  }
}

export default function WorkspaceList({ workspaces, onEdit, onToggle, onDelete, onViewUsers }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Assigned users</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workspaces.map((workspace) => (
            <tr key={workspace.id}>
              <td>{workspace.name || '—'}</td>
              <td>{workspace.slug || '—'}</td>
              <td>
                <span className={`admin-status-pill ${workspace.is_active ? 'status-approved' : 'status-suspended'}`}>
                  {workspace.is_active ? 'active' : 'inactive'}
                </span>
              </td>
              <td>{workspace.assigned_users || 0}</td>
              <td>{formatDate(workspace.created_at)}</td>
              <td>
                <div className="admin-actions-row">
                  <button type="button" className="admin-action-btn" onClick={() => onViewUsers(workspace)}>
                    View users
                  </button>
                  <button type="button" className="admin-action-btn" onClick={() => onEdit(workspace)}>
                    Edit
                  </button>
                  <button type="button" className="admin-action-btn" onClick={() => onToggle(workspace)}>
                    {workspace.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="admin-action-btn suspend" onClick={() => onDelete(workspace)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
