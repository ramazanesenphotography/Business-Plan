import { useEffect, useMemo, useState } from 'react';
import useAdminWorkspaces from '../hooks/useAdminWorkspaces';
import WorkspaceForm from '../components/workspaces/WorkspaceForm';
import WorkspaceList from '../components/workspaces/WorkspaceList';
import UserToast from '../components/users/UserToast';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  is_active: true
};

export default function WorkspacesPage() {
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState('create');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const {
    workspaces,
    loading,
    error,
    toast,
    saving,
    setToast,
    summary,
    refreshWorkspaces,
    saveWorkspace,
    toggleWorkspace,
    removeWorkspace,
    selectedWorkspace: activeWorkspace,
    setSelectedWorkspace: setActiveWorkspace,
    assignedUsers,
    loadAssignedUsers
  } = useAdminWorkspaces();

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  useEffect(() => {
    if (selectedWorkspace) {
      setForm({
        id: selectedWorkspace.id,
        name: selectedWorkspace.name || '',
        slug: selectedWorkspace.slug || '',
        description: selectedWorkspace.description || '',
        is_active: Boolean(selectedWorkspace.is_active)
      });
      setMode('edit');
    } else {
      setForm(emptyForm);
      setMode('create');
    }
  }, [selectedWorkspace]);

  const listItems = useMemo(() => workspaces.map((workspace) => ({
    ...workspace,
    assigned_users: workspace.assigned_users ?? 0
  })), [workspaces]);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      is_active: Boolean(form.is_active),
      updated_at: new Date().toISOString()
    };

    if (mode === 'edit' && selectedWorkspace?.id) {
      const result = await saveWorkspace({ id: selectedWorkspace.id, ...payload }, 'edit');
      if (!result?.error) {
        setSelectedWorkspace(null);
      }
      return;
    }

    const result = await saveWorkspace(payload, 'create');
    if (!result?.error) {
      setForm(emptyForm);
    }
  }

  function handleEdit(workspace) {
    setSelectedWorkspace(workspace);
  }

  async function handleToggle(workspace) {
    await toggleWorkspace(workspace);
  }

  async function handleDelete(workspace) {
    await removeWorkspace(workspace);
  }

  async function handleViewUsers(workspace) {
    setActiveWorkspace(workspace);
    setShowUsers(true);
    await loadAssignedUsers(workspace.slug);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMIN WORKSPACES</p>
          <h1>Workspace management</h1>
        </div>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <span>Total workspaces</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="admin-summary-card">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="admin-summary-card">
          <span>Inactive</span>
          <strong>{summary.inactive}</strong>
        </div>
      </div>

      {toast && <UserToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-table-card">
        <div className="admin-workspace-panel">
          <div>
            <h2>{mode === 'edit' ? 'Edit workspace' : 'Create workspace'}</h2>
            <p className="auth-muted">Create and manage workspace types used by the admin and user profiles.</p>
          </div>
          <WorkspaceForm form={form} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onSubmit={handleSubmit} saving={saving} mode={mode} />
        </div>
      </div>

      <div className="admin-table-card">
        {loading && <div className="admin-empty-state">Loading workspaces…</div>}
        {!loading && error && <div className="admin-empty-state">{error}</div>}
        {!loading && !error && listItems.length === 0 && <div className="admin-empty-state">No workspaces yet.</div>}
        {!loading && !error && listItems.length > 0 && (
          <WorkspaceList
            workspaces={listItems}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onViewUsers={handleViewUsers}
          />
        )}
      </div>

      {showUsers && activeWorkspace && (
        <div className="admin-drawer-backdrop" onClick={() => setShowUsers(false)}>
          <div className="admin-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <p className="admin-page-kicker">ASSIGNED USERS</p>
                <h3>{activeWorkspace.name}</h3>
              </div>
              <button type="button" className="admin-drawer-close" onClick={() => setShowUsers(false)}>×</button>
            </div>
            {assignedUsers.length === 0 && <div className="admin-empty-state">No users assigned yet.</div>}
            {assignedUsers.length > 0 && (
              <div className="admin-users-stack">
                {assignedUsers.map((user) => (
                  <div key={user.id} className="admin-user-chip">
                    <strong>{user.full_name || user.email}</strong>
                    <span>{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
