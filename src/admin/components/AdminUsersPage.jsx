import { useCallback, useEffect, useMemo, useState } from 'react';
import useAdminUserActions from '../hooks/useAdminUserActions';
import useAdminUserProfile from '../hooks/useAdminUserProfile';
import { fetchAdminUsers } from '../services/adminUsersService';
import UserDetailsDrawer from './users/UserDetailsDrawer';
import UserFilters from './users/UserFilters';
import UserSearch from './users/UserSearch';
import UserStatsCards from './users/UserStatsCards';
import UserToast from './users/UserToast';
import UsersTable from './users/UsersTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerForm, setDrawerForm] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await fetchAdminUsers();
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setUsers(data || []);
  }, []);

  const { busyAction, toast, setToast, runAction } = useAdminUserActions({ onRefresh: loadUsers });
  const { editingUser, setEditingUser, saving, toast: profileToast, saveUser } = useAdminUserProfile({ onRefresh: loadUsers });

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedUser) {
      setDrawerForm({
        full_name: selectedUser.full_name || '',
        email: selectedUser.email || '',
        role: selectedUser.role || 'photographer',
        approval_status: selectedUser.approval_status || 'pending',
        selected_workspace: selectedUser.selected_workspace || '',
        subscription_plan: selectedUser.subscription_plan || '',
        subscription_start: selectedUser.subscription_start || '',
        subscription_end: selectedUser.subscription_end || ''
      });
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus = filter === 'all' ? true : user.approval_status === filter;
      const haystack = `${user.full_name || ''} ${user.email || ''}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [users, filter, search]);

  const summary = useMemo(() => ({
    total: users.length,
    pending: users.filter((user) => user.approval_status === 'pending').length,
    approved: users.filter((user) => user.approval_status === 'approved').length,
    suspended: users.filter((user) => user.approval_status === 'suspended').length
  }), [users]);

  function openUserDetails(user) {
    setSelectedUser(user);
    setEditingUser(user);
  }

  function updateDrawerField(key, value) {
    setDrawerForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveUser() {
    if (!selectedUser?.id) return;

    const updates = {
      ...drawerForm,
      subscription_start: drawerForm.subscription_start ? new Date(drawerForm.subscription_start).toISOString() : null,
      subscription_end: drawerForm.subscription_end ? new Date(drawerForm.subscription_end).toISOString() : null
    };

    const { error } = await saveUser(selectedUser.id, updates);
    if (!error) {
      setSelectedUser(null);
      setEditingUser(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMIN USERS</p>
          <h1>Users foundation</h1>
        </div>
        <UserSearch value={search} onChange={setSearch} />
      </div>

      <UserStatsCards summary={summary} />
      <UserFilters filter={filter} onChange={setFilter} />

      {toast && (
        <UserToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="admin-table-card">
        {loading && <div className="admin-empty-state">Loading users…</div>}
        {!loading && error && <div className="admin-empty-state">{error}</div>}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="admin-empty-state">No users match the current filters.</div>
        )}
        {!loading && !error && filteredUsers.length > 0 && (
          <UsersTable
            users={filteredUsers}
            loading={busyAction}
            onApprove={(user) => runAction(user, 'approve')}
            onSuspend={(user) => runAction(user, 'suspend')}
            onReactivate={(user) => runAction(user, 'reactivate')}
            onOpenDetails={openUserDetails}
          />
        )}
      </div>

      {selectedUser && (
        <UserDetailsDrawer
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          saving={saving}
          form={drawerForm}
          onChange={updateDrawerField}
          error={profileToast?.type === 'error' ? profileToast.message : ''}
          success={profileToast?.type === 'success' ? profileToast.message : ''}
        />
      )}
    </div>
  );
}
