import { useCallback, useEffect, useMemo, useState } from 'react';
import useAdminUserProfile from '../hooks/useAdminUserProfile';
import { fetchAdminUsers } from '../services/adminUsersService';
import UserDetailsDrawer from '../components/users/UserDetailsDrawer';
import UserSearch from '../components/users/UserSearch';
import UserToast from '../components/users/UserToast';
import { formatDateForDisplay, toSupabaseDateValue } from '../utils/dateUtils';

const PLAN_OPTIONS = ['trial', 'starter', 'pro', 'studio', 'enterprise'];

function formatDateValue(value) {
  return formatDateForDisplay(value);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getStatus(user) {
  if (!user.subscription_end) return 'active';
  return new Date(user.subscription_end).getTime() < Date.now() ? 'expired' : 'active';
}

export default function SubscriptionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerForm, setDrawerForm] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await fetchAdminUsers();
    setLoading(false);

    if (error) {
      setError(error.message || 'Unable to load subscription data.');
      return;
    }

    setUsers(data || []);
  }, []);

  const { saving, toast: profileToast, setToast, saveUser } = useAdminUserProfile({ onRefresh: loadUsers });

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
        subscription_plan: selectedUser.subscription_plan || 'trial',
        subscription_start: selectedUser.subscription_start || '',
        subscription_end: selectedUser.subscription_end || ''
      });
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesPlan = planFilter === 'all' ? true : (user.subscription_plan || 'trial') === planFilter;
      const haystack = `${user.full_name || ''} ${user.email || ''}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesPlan && matchesSearch;
    });
  }, [planFilter, search, users]);

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => getStatus(user) === 'active').length,
    expired: users.filter((user) => getStatus(user) === 'expired').length,
    trial: users.filter((user) => (user.subscription_plan || 'trial') === 'trial').length,
    enterprise: users.filter((user) => (user.subscription_plan || 'trial') === 'enterprise').length
  }), [users]);

  async function updateSubscription(user, patch) {
    const { error } = await saveUser(user.id, patch);
    if (!error) {
      setSelectedUser(null);
    }
  }

  async function assignPlan(user, plan) {
    const start = new Date();
    const end = plan === 'enterprise' ? addMonths(start, 12) : addMonths(start, 1);
    await updateSubscription(user, {
      subscription_plan: plan,
      subscription_start: toSupabaseDateValue(start.toISOString()),
      subscription_end: toSupabaseDateValue(end.toISOString())
    });
  }

  async function extendSubscription(user, months = 1) {
    const currentEnd = user.subscription_end ? new Date(user.subscription_end) : new Date();
    const nextEnd = addMonths(currentEnd, months);
    await updateSubscription(user, {
      subscription_plan: user.subscription_plan || 'trial',
      subscription_end: toSupabaseDateValue(nextEnd.toISOString())
    });
  }

  async function expireSubscription(user) {
    await updateSubscription(user, {
      subscription_plan: user.subscription_plan || 'trial',
      subscription_end: toSupabaseDateValue(new Date().toISOString())
    });
  }

  async function openEditor(user) {
    setSelectedUser(user);
  }

  async function handleSaveUser() {
    if (!selectedUser?.id) return;

    const updates = {
      ...drawerForm,
      subscription_start: toSupabaseDateValue(drawerForm.subscription_start),
      subscription_end: toSupabaseDateValue(drawerForm.subscription_end)
    };

    const { error } = await saveUser(selectedUser.id, updates);
    if (!error) {
      setSelectedUser(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMIN SUBSCRIPTIONS</p>
          <h1>Subscription management</h1>
        </div>
        <UserSearch value={search} onChange={setSearch} />
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card"><span>Total users</span><strong>{summary.total}</strong></div>
        <div className="admin-summary-card"><span>Active</span><strong>{summary.active}</strong></div>
        <div className="admin-summary-card"><span>Expired</span><strong>{summary.expired}</strong></div>
        <div className="admin-summary-card"><span>Trial / Enterprise</span><strong>{summary.trial} / {summary.enterprise}</strong></div>
      </div>

      <div className="admin-filter-row">
        <button type="button" className={planFilter === 'all' ? 'active' : ''} onClick={() => setPlanFilter('all')}>All</button>
        {PLAN_OPTIONS.map((plan) => (
          <button key={plan} type="button" className={planFilter === plan ? 'active' : ''} onClick={() => setPlanFilter(plan)}>{plan}</button>
        ))}
      </div>

      {profileToast && <UserToast message={profileToast.message || ''} type={profileToast.type || 'success'} onClose={() => setToast(null)} />}

      <div className="admin-table-card">
        {loading && <div className="admin-empty-state">Loading subscriptions…</div>}
        {!loading && error && <div className="admin-empty-state">{error}</div>}
        {!loading && !error && filteredUsers.length === 0 && <div className="admin-empty-state">No subscription records match the current filters.</div>}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = getStatus(user);
                  return (
                    <tr key={user.id}>
                      <td><b>{user.full_name || 'Unnamed'}</b><span>{user.email}</span></td>
                      <td>{user.subscription_plan || 'trial'}</td>
                      <td><span className={`admin-status-pill ${status === 'expired' ? 'status-suspended' : 'status-approved'}`}>{status}</span></td>
                      <td>{formatDateValue(user.subscription_start)}</td>
                      <td>{formatDateValue(user.subscription_end)}</td>
                      <td>
                        <div className="admin-actions-row">
                          {PLAN_OPTIONS.map((plan) => (
                            <button key={plan} type="button" className="admin-action-btn" onClick={() => assignPlan(user, plan)}>{plan}</button>
                          ))}
                          <button type="button" className="admin-action-btn" onClick={() => extendSubscription(user, 1)}>Extend</button>
                          <button type="button" className="admin-action-btn" onClick={() => expireSubscription(user)}>Expire</button>
                          <button type="button" className="admin-action-btn approve" onClick={() => openEditor(user)}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailsDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
          saving={saving}
          form={drawerForm}
          onChange={(key, value) => setDrawerForm((current) => ({ ...current, [key]: value }))}
          error={profileToast?.type === 'error' ? profileToast.message : ''}
          success={profileToast?.type === 'success' ? profileToast.message : ''}
        />
      )}
    </div>
  );
}
