import { formatDateForDisplay, toInputDateValue } from '../../utils/dateUtils';

function formatDateValue(value) {
  return formatDateForDisplay(value);
}

export default function UserDetailsDrawer({ user, onClose, onSave, saving, form, onChange, error, success }) {
  if (!user) return null;

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <div className="admin-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="admin-drawer-header">
          <div>
            <p className="admin-page-kicker">USER DETAILS</p>
            <h3>{user.full_name || user.email || 'User'}</h3>
          </div>
          <button type="button" className="admin-drawer-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="admin-toast error">{error}</div>}
        {success && <div className="admin-toast success">{success}</div>}

        <div className="admin-drawer-grid">
          <label>
            Full name
            <input value={form.full_name || ''} onChange={(event) => onChange('full_name', event.target.value)} />
          </label>
          <label>
            Email
            <input value={form.email || ''} onChange={(event) => onChange('email', event.target.value)} />
          </label>
          <label>
            Role
            <select value={form.role || ''} onChange={(event) => onChange('role', event.target.value)}>
              <option value="admin">admin</option>
              <option value="photographer">photographer</option>
              <option value="employee">employee</option>
            </select>
          </label>
          <label>
            Approval status
            <select value={form.approval_status || ''} onChange={(event) => onChange('approval_status', event.target.value)}>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="suspended">suspended</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label>
            Workspace
            <select value={form.selected_workspace || ''} onChange={(event) => onChange('selected_workspace', event.target.value)}>
              <option value="">Clear</option>
              <option value="photographer">photographer</option>
              <option value="studio">studio</option>
              <option value="agency">agency</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label>
            Subscription plan
            <select value={form.subscription_plan || ''} onChange={(event) => onChange('subscription_plan', event.target.value)}>
              <option value="">None</option>
              <option value="trial">trial</option>
              <option value="starter">starter</option>
              <option value="pro">pro</option>
              <option value="studio">studio</option>
              <option value="enterprise">enterprise</option>
            </select>
          </label>
          <label>
            Subscription start
            <input type="date" value={toInputDateValue(form.subscription_start)} onChange={(event) => onChange('subscription_start', event.target.value)} />
          </label>
          <label>
            Subscription end
            <input type="date" value={toInputDateValue(form.subscription_end)} onChange={(event) => onChange('subscription_end', event.target.value)} />
          </label>
        </div>

        <div className="admin-drawer-meta">
          <div><span>Created</span><strong>{formatDateValue(user.created_at)}</strong></div>
          <div><span>Role</span><strong>{user.role || '—'}</strong></div>
          <div><span>Status</span><strong>{user.approval_status || '—'}</strong></div>
        </div>

        <div className="admin-drawer-actions">
          <button type="button" className="admin-action-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="admin-action-btn approve" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
