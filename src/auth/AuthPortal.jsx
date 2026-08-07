import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PhotographerApp from '../PhotographerApp';
import TeacherApp from '../teacher/TeacherApp';
import AdminLayout from '../admin/components/AdminLayout';
import AdminUsersPage from '../admin/components/AdminUsersPage';
import WorkspacesPage from '../admin/pages/WorkspacesPage';
import SubscriptionsPage from '../admin/pages/SubscriptionsPage';
import '../admin/admin.css';
import useAuthSession from './hooks/useAuthSession';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WaitingApprovalPage from './pages/WaitingApprovalPage';
import AuthShell from './shared/AuthShell';
import Brand from './shared/Brand';

const WORKSPACES = [
  {
    key: 'photographer',
    title: 'Photographer',
    description: 'Clients, shoots, payments, files and reports.',
    icon: '📷'
  },
  {
    key: 'teacher',
    title: 'Teacher',
    description: 'Students, lessons, attendance, payments and files.',
    icon: '🎓'
  },
  {
    key: 'creator',
    title: 'Creator',
    description: 'A future-ready workspace for content and brand operations.',
    icon: '✨'
  },
  {
    key: 'agency',
    title: 'Agency',
    description: 'A future-ready workspace for multi-client delivery.',
    icon: '🏢'
  }
];

function Shell({ children }) {
  return (
    <AuthShell>
      <style>{styles}</style>
      {children}
    </AuthShell>
  );
}

function FullScreenMessage({ title, text, action, secondaryAction }) {
  return (
    <Shell>
      <div className="auth-center">
        <div className="auth-card auth-message-card">
          <Brand />
          <div className="auth-message-icon">✓</div>
          <h1>{title}</h1>
          <p>{text}</p>
          {action}
          {secondaryAction}
        </div>
      </div>
    </Shell>
  );
}

function WorkspaceSelection({ profile, onSelected }) {
  const [busy, setBusy] = useState('');

  async function choose(key) {
    setBusy(key);
    const { data, error } = await supabase.rpc('choose_workspace', {
      requested_workspace: key
    });
    setBusy('');

    if (error) {
      alert(error.message);
      return;
    }

    onSelected(Array.isArray(data) ? data[0] : data);
  }

  return (
    <Shell>
      <div className="auth-center">
        <div className="workspace-card">
          <Brand />
          <span className="auth-kicker">WELCOME {profile.full_name || profile.email}</span>
          <h1>Choose your workspace</h1>
          <p className="auth-muted">
            Select the professional workspace you want to use. An administrator can change it later.
          </p>

          <div className="workspace-grid">
            {WORKSPACES.map((workspace) => (
              <button
                key={workspace.key}
                className="workspace-option"
                disabled={Boolean(busy)}
                onClick={() => choose(workspace.key)}
              >
                <b>{workspace.icon}</b>
                <strong>{workspace.title}</strong>
                <span>{workspace.description}</span>
                <i>{busy === workspace.key ? 'Activating...' : 'Select workspace →'}</i>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function TeacherWorkspace({ profile, onSignOut }) {
  return (
    <Shell>
      <TeacherApp profile={profile} onSignOut={onSignOut} />
    </Shell>
  );
}

function CreatorWorkspace({ profile, onSignOut }) {
  return (
    <Shell>
      <div className="auth-center">
        <div className="auth-card auth-message-card">
          <Brand />
          <div className="auth-message-icon">✨</div>
          <h1>Creator workspace</h1>
          <p>This workspace is prepared for future creator operations. The core photographer and teacher experiences remain available in their existing modules.</p>
          <button className="auth-primary" onClick={onSignOut}>Sign Out</button>
        </div>
      </div>
    </Shell>
  );
}

function AgencyWorkspace({ profile, onSignOut }) {
  return (
    <Shell>
      <div className="auth-center">
        <div className="auth-card auth-message-card">
          <Brand />
          <div className="auth-message-icon">🏢</div>
          <h1>Agency workspace</h1>
          <p>This workspace is prepared for future agency operations. Existing admin, photographer, and teacher workspaces continue to work as before.</p>
          <button className="auth-primary" onClick={onSignOut}>Sign Out</button>
        </div>
      </div>
    </Shell>
  );
}

function AdminDashboard({ profile, onSignOut }) {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState('');
  const [filter, setFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setUsers(data || []);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function updateUser(userId, patch) {
    setBusy(userId);
    const { error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId);
    setBusy('');
    if (error) {
      alert(error.message);
      return;
    }
    await loadUsers();
  }

  function subscriptionDates(months) {
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return {
      subscription_start: start.toISOString(),
      subscription_end: end.toISOString()
    };
  }

  const visibleUsers = users.filter((user) =>
    filter === 'all' ? true : user.approval_status === filter
  );

  return (
    <Shell>
      <div className="admin-app">
        <aside className="admin-sidebar">
          <Brand />
          <div className="admin-role">ADMIN CONTROL CENTER</div>
          <nav>
            <button className="active">▦ Users</button>
            <button>◫ Subscriptions</button>
            <button>▥ Workspaces</button>
          </nav>
          <button className="teacher-signout" onClick={onSignOut}>Sign Out</button>
        </aside>

        <main className="admin-main">
          <header className="teacher-header">
            <div><small>SYSTEM ADMINISTRATOR</small><h1>User Management</h1></div>
            <div className="teacher-user">
              <div>A</div>
              <span><b>{profile.full_name || 'Administrator'}</b><small>{profile.email}</small></span>
            </div>
          </header>

          <div className="admin-stats">
            {[
              ['All Users', users.length],
              ['Pending', users.filter((u) => u.approval_status === 'pending').length],
              ['Approved', users.filter((u) => u.approval_status === 'approved').length],
              ['Suspended', users.filter((u) => u.approval_status === 'suspended').length]
            ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Accounts</h2>
              <div className="admin-filters">
                {['all', 'pending', 'approved', 'suspended'].map((item) => (
                  <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Role</th><th>Status</th><th>Workspace</th>
                    <th>Plan</th><th>Expiry</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td><b>{user.full_name || 'Unnamed'}</b><span>{user.email}</span></td>
                      <td>{user.role}</td>
                      <td><i className={`status-${user.approval_status}`}>{user.approval_status}</i></td>
                      <td>
                        <select value={user.selected_workspace || ''} onChange={(event) =>
                          updateUser(user.id, {
                            selected_workspace: event.target.value || null,
                            onboarding_completed: Boolean(event.target.value)
                          })
                        }>
                          <option value="">Not selected</option>
                          <option value="photographer">Photographer</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </td>
                      <td>{user.subscription_plan || 'trial'}</td>
                      <td>{user.subscription_end
                        ? new Date(user.subscription_end).toLocaleDateString('en-GB')
                        : '—'}</td>
                      <td>
                        <div className="admin-actions">
                          {user.approval_status !== 'approved' && (
                            <button disabled={busy === user.id} className="approve" onClick={() =>
                              updateUser(user.id, {
                                approval_status: 'approved',
                                approved_at: new Date().toISOString(),
                                approved_by: profile.id,
                                subscription_plan: '1 Year',
                                ...subscriptionDates(12)
                              })
                            }>Approve 1Y</button>
                          )}
                          <button disabled={busy === user.id} onClick={() =>
                            updateUser(user.id, {
                              subscription_plan: '1 Year',
                              ...subscriptionDates(12)
                            })
                          }>Extend 1Y</button>
                          <button disabled={busy === user.id} className="suspend" onClick={() =>
                            updateUser(user.id, { approval_status: 'suspended' })
                          }>Suspend</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </Shell>
  );
}

function PhotographerWorkspace({ onSignOut, profile }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PhotographerApp profile={profile} />
      <button className="floating-signout" onClick={onSignOut}>Sign Out</button>
      <style>{styles}</style>
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Password updated successfully.');
    setTimeout(() => onDone(), 900);
  }

  return (
    <Shell>
      <div className="auth-center">
        <form className="auth-card auth-form-card" onSubmit={submit}>
          <Brand />
          <h2 style={{ marginTop: 24 }}>Create a new password</h2>
          <p className="auth-muted">
            Choose a new password for your Business Plan account.
          </p>

          <label>
            New password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          <label>
            Confirm new password
            <input
              required
              minLength={6}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat new password"
            />
          </label>

          {message && <div className="auth-alert">{message}</div>}

          <button className="auth-primary" disabled={busy}>
            {busy ? 'Updating...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </Shell>
  );
}

export default function AuthPortal() {
  const {
    session,
    profile,
    profileLoading,
    profileError,
    passwordRecovery,
    loadProfile,
    signOut,
    setProfile,
    setSession
  } = useAuthSession();
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();

  const handleSession = (nextSession) => {
    setSession(nextSession);
    if (nextSession?.user?.id) {
      loadProfile(nextSession.user.id);
    }
  };

  const localAdminProfile = {
    id: 'local-admin',
    email: 'ramazanesen23@gmail.com',
    full_name: 'Ramazan Esen',
    role: 'admin',
    approval_status: 'approved',
    subscription_plan: 'Lifetime',
    selected_workspace: null
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const authenticatedView = () => {
    if (passwordRecovery) {
      return (
        <ResetPasswordScreen
          onDone={async () => {
            await supabase.auth.signOut();
            setSession(null);
            setProfile(null);
            navigate('/login');
          }}
        />
      );
    }

    if (session === undefined || (session && profileLoading && !profile)) {
      return (
        <Shell>
          <div className="auth-center"><div className="auth-loader">Loading Business Plan...</div></div>
        </Shell>
      );
    }

    if (!session) {
      return <Navigate to="/login" replace />;
    }

    if (profileError) {
      return (
        <FullScreenMessage
          title="Profile could not be loaded"
          text={profileError}
          action={<button className="auth-primary" onClick={() => loadProfile(session.user.id)}>Try Again</button>}
          secondaryAction={<button className="auth-link-button" onClick={handleSignOut}>Sign Out</button>}
        />
      );
    }

    if (!profile) {
      return (
        <FullScreenMessage
          title="Preparing your account"
          text="Your profile record is not ready yet. Try again in a moment."
          action={<button className="auth-primary" onClick={() => loadProfile(session.user.id)}>Refresh</button>}
          secondaryAction={<button className="auth-link-button" onClick={handleSignOut}>Sign Out</button>}
        />
      );
    }

    if (profile.role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    }

    if (profile.approval_status === 'pending') {
      return (
        <FullScreenMessage
          title="Waiting for administrator approval"
          text="Your email is verified. Your account is now waiting for an administrator to assign access and a subscription."
          action={<button className="auth-primary" onClick={() => loadProfile(session.user.id)}>Check Again</button>}
          secondaryAction={<button className="auth-link-button" onClick={handleSignOut}>Sign Out</button>}
        />
      );
    }

    if (profile.approval_status === 'rejected' || profile.approval_status === 'suspended') {
      return (
        <FullScreenMessage
          title={profile.approval_status === 'suspended' ? 'Account suspended' : 'Account not approved'}
          text="Contact the system administrator for more information."
          action={<button className="auth-primary" onClick={handleSignOut}>Return to Sign In</button>}
        />
      );
    }

    if (!profile.selected_workspace || !profile.onboarding_completed) {
      return <WorkspaceSelection profile={profile} onSelected={setProfile} />;
    }

    if (profile.selected_workspace === 'teacher' || profile.role === 'teacher') {
      return <TeacherWorkspace profile={profile} onSignOut={handleSignOut} />;
    }

    if (profile.selected_workspace === 'creator' || profile.role === 'creator') {
      return <CreatorWorkspace profile={profile} onSignOut={handleSignOut} />;
    }

    if (profile.selected_workspace === 'agency' || profile.role === 'agency') {
      return <AgencyWorkspace profile={profile} onSignOut={handleSignOut} />;
    }

    return <PhotographerWorkspace onSignOut={handleSignOut} profile={profile} />;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onSession={handleSession} />} />
      <Route path="/register" element={<RegisterPage onSession={handleSession} onVerificationSent={setVerificationEmail} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/waiting-approval" element={<WaitingApprovalPage email={verificationEmail || 'your email'} />} />
      <Route path="/admin" element={<AdminLayout onSignOut={handleSignOut} />}>
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route index element={<Navigate to="/admin/users" replace />} />
      </Route>
      <Route path="/" element={authenticatedView()} />
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  );
}

const styles = `
  :root { color-scheme: dark; }
  .auth-shell, .auth-shell * { box-sizing:border-box; }
  .auth-shell {
    min-height:100vh;
    background:#050B15;
    color:#F8FAFC;
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  }
  .auth-center { min-height:100vh; display:grid; place-items:center; padding:24px; }
  .auth-layout { min-height:100vh; display:grid; grid-template-columns:minmax(420px,1.05fr) minmax(420px,.95fr); }
  .auth-showcase { padding:44px clamp(34px,6vw,90px); display:flex; flex-direction:column; justify-content:space-between;
    background:radial-gradient(circle at 20% 25%,rgba(37,99,235,.24),transparent 35%),linear-gradient(150deg,#071121,#050B15); border-right:1px solid #1E293B; }
  .auth-brand { display:flex; align-items:center; gap:12px; }
  .auth-logo { width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#0F2342;border:1px solid #2563EB;color:#60A5FA;font-size:22px; }
  .auth-brand strong,.auth-brand span { display:block; }
  .auth-brand strong { color:#FACC15; letter-spacing:.6px; font-size:18px; }
  .auth-brand span { color:#8EA4C2; font-size:10px; margin-top:2px; }
  .auth-showcase-copy { max-width:650px; }
  .auth-kicker { color:#60A5FA; font-size:11px; font-weight:800; letter-spacing:1.3px; }
  .auth-showcase h1,.workspace-card h1 { font-size:clamp(38px,5vw,68px); line-height:1.02; letter-spacing:-2px; margin:17px 0; }
  .auth-showcase p { color:#9FB0C8; font-size:16px; line-height:1.7; max-width:570px; }
  .auth-mini-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .auth-mini-grid div { min-height:94px;padding:16px;border-radius:16px;background:rgba(15,23,42,.72);border:1px solid #23324A;display:flex;flex-direction:column;gap:9px; }
  .auth-mini-grid b { font-size:24px; }.auth-mini-grid span{font-size:12px;font-weight:700}.auth-coming{opacity:.55}
  .auth-form-side { display:grid; place-items:center; padding:28px; }
  .auth-card { width:min(460px,100%); background:#0D1726; border:1px solid #243349; border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.35); }
  .auth-form-card { padding:28px; }.auth-mobile-brand{display:none}
  .auth-tabs { display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;background:#07101D;border:1px solid #1F2E43;border-radius:12px;margin-bottom:24px; }
  .auth-tabs button { border:0;background:transparent;color:#8FA3BE;padding:10px;border-radius:9px;font-weight:800;cursor:pointer; }
  .auth-tabs button.active { background:#2563EB;color:white; }
  .auth-form-card h2 { margin:0;font-size:27px; }.auth-muted{color:#91A4BE;font-size:12px;line-height:1.6;margin:7px 0 20px}
  .auth-form-card label { display:flex;flex-direction:column;gap:7px;color:#B8C6D9;font-size:11px;font-weight:700;margin-top:14px; }
  .auth-form-card input,.admin-table select { width:100%;border:1px solid #25364E;background:#060D18;color:#F8FAFC;border-radius:11px;padding:12px 13px;outline:none; }
  .auth-form-card input:focus { border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .auth-primary { width:100%;border:0;border-radius:11px;background:linear-gradient(135deg,#2563EB,#3B82F6);color:white;padding:13px 16px;font-weight:850;cursor:pointer;margin-top:18px; }
  .auth-primary:disabled{opacity:.55}.auth-link-button{border:0;background:transparent;color:#60A5FA;cursor:pointer;width:100%;margin-top:13px;font-weight:700}
  .auth-alert{margin-top:14px;padding:10px;border-radius:9px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.1);color:#FCA5A5;font-size:11px}
  .auth-message-card{padding:34px;text-align:center}.auth-message-card .auth-brand{justify-content:center;margin-bottom:28px}
  .auth-message-card h1{font-size:29px;margin:12px 0}.auth-message-card p{color:#91A4BE;line-height:1.7;font-size:13px}
  .auth-message-icon{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;margin:auto;background:rgba(16,185,129,.13);border:1px solid rgba(16,185,129,.3);color:#34D399;font-size:28px}
  .auth-loader{color:#91A4BE;font-weight:700}
  .workspace-card{width:min(1020px,100%);padding:34px;border-radius:24px;border:1px solid #243349;background:#0B1524}
  .workspace-card>.auth-brand{margin-bottom:48px}.workspace-card h1{font-size:42px}.workspace-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:28px}
  .workspace-option{text-align:left;border:1px solid #273A54;background:#07101D;color:white;border-radius:18px;padding:24px;cursor:pointer;transition:.2s}
  .workspace-option:hover{transform:translateY(-3px);border-color:#3B82F6}.workspace-option b{display:block;font-size:34px;margin-bottom:16px}
  .workspace-option strong,.workspace-option span,.workspace-option i{display:block}.workspace-option strong{font-size:20px}.workspace-option span{color:#91A4BE;font-size:12px;line-height:1.55;margin:8px 0 20px}
  .workspace-option i{font-style:normal;color:#60A5FA;font-size:11px;font-weight:800}
  .teacher-app,.admin-app{min-height:100vh;display:grid;grid-template-columns:240px minmax(0,1fr);background:#050B15}
  .teacher-sidebar,.admin-sidebar{border-right:1px solid #1E293B;padding:22px 15px;display:flex;flex-direction:column;gap:30px;position:sticky;top:0;height:100vh}
  .teacher-sidebar nav,.admin-sidebar nav{display:flex;flex-direction:column;gap:7px}.teacher-sidebar nav button,.admin-sidebar nav button{border:0;background:transparent;color:#9BAEC7;padding:12px;border-radius:11px;text-align:left;font-weight:700;cursor:pointer}
  .teacher-sidebar nav button.active,.admin-sidebar nav button.active{background:#17243A;color:#60A5FA}.teacher-sidebar nav span{margin-right:10px}
  .teacher-signout{margin-top:auto;border:1px solid #263750;background:#0A1320;color:#CBD5E1;padding:11px;border-radius:10px;cursor:pointer}
  .teacher-main,.admin-main{padding:22px 30px;min-width:0}.teacher-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}
  .teacher-header small{color:#60A5FA;font-size:9px;font-weight:850;letter-spacing:1px}.teacher-header h1{margin:5px 0 0;font-size:26px}
  .teacher-user{display:flex;align-items:center;gap:10px}.teacher-user>div{width:40px;height:40px;border-radius:12px;background:#2563EB;display:grid;place-items:center;font-weight:900}
  .teacher-user span,.teacher-user b,.teacher-user small{display:block}.teacher-user small{color:#91A4BE;margin-top:2px}
  .teacher-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px;margin-bottom:16px}.teacher-stat,.admin-stats>div{padding:18px;border:1px solid #243349;background:#0D1726;border-radius:15px}
  .teacher-stat span,.teacher-stat strong{display:block}.teacher-stat span{color:#91A4BE;font-size:10px}.teacher-stat strong{font-size:19px;margin-top:9px}
  .teacher-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,.7fr);gap:16px}.teacher-panel,.admin-panel{background:#0D1726;border:1px solid #243349;border-radius:18px;padding:18px}
  .teacher-panel h2,.admin-panel h2{font-size:17px;margin:0 0 15px}.teacher-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px;border:1px solid #1F3047;background:#07101D;border-radius:12px;margin-top:8px}
  .teacher-avatar{width:36px;height:36px;border-radius:11px;background:#1D4ED8;display:grid;place-items:center;font-weight:900}.teacher-row b,.teacher-row span{display:block}.teacher-row span{color:#91A4BE;font-size:10px;margin-top:3px}.teacher-row>strong{font-size:10px;color:#AFC0D6}
  .teacher-action{width:100%;border:1px solid #29405D;background:#07101D;color:#DCE7F5;padding:12px;border-radius:11px;text-align:left;margin-top:8px;cursor:pointer}
  .teacher-placeholder{min-height:300px;display:grid;place-content:center;text-align:center}.teacher-placeholder p{color:#91A4BE}
  .admin-role{font-size:9px;color:#FACC15;font-weight:900;letter-spacing:1px}.admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px}
  .admin-stats span,.admin-stats strong{display:block}.admin-stats span{color:#91A4BE;font-size:10px}.admin-stats strong{font-size:25px;margin-top:6px}
  .admin-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.admin-filters{display:flex;gap:6px}.admin-filters button{border:1px solid #263750;background:#07101D;color:#91A4BE;border-radius:8px;padding:7px 10px;cursor:pointer}
  .admin-filters button.active{background:#2563EB;color:white}.admin-table-wrap{overflow:auto}.admin-table{width:100%;min-width:1050px;border-collapse:collapse;font-size:10px}
  .admin-table th,.admin-table td{padding:12px 9px;border-bottom:1px solid #213047;text-align:left}.admin-table th{color:#91A4BE}.admin-table td>b,.admin-table td>span{display:block}.admin-table td>span{color:#91A4BE;margin-top:3px}
  .admin-table select{padding:8px}.admin-table i{display:inline-block;font-style:normal;padding:5px 8px;border-radius:99px}.status-approved{color:#34D399;background:rgba(16,185,129,.12)}.status-pending{color:#FBBF24;background:rgba(245,158,11,.12)}.status-suspended,.status-rejected{color:#F87171;background:rgba(248,113,113,.12)}
  .admin-actions{display:flex;gap:5px}.admin-actions button{border:1px solid #2B3F5B;background:#0A1320;color:#CBD5E1;border-radius:7px;padding:6px 8px;cursor:pointer;white-space:nowrap}.admin-actions .approve{color:#34D399;border-color:rgba(16,185,129,.35)}.admin-actions .suspend{color:#F87171;border-color:rgba(248,113,113,.35)}
  .floating-signout{position:fixed;right:18px;bottom:18px;z-index:10000;border:1px solid #334155;background:#0B1524;color:white;border-radius:11px;padding:10px 14px;font-weight:800;cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.35)}
  @media(max-width:1000px){.auth-layout{grid-template-columns:1fr}.auth-showcase{display:none}.auth-mobile-brand{display:block;margin-bottom:24px}.teacher-stats{grid-template-columns:repeat(3,1fr)}.teacher-grid{grid-template-columns:1fr}}
  @media(max-width:760px){.teacher-app,.admin-app{grid-template-columns:1fr}.teacher-sidebar,.admin-sidebar{position:static;height:auto}.teacher-sidebar nav,.admin-sidebar nav{display:grid;grid-template-columns:repeat(4,1fr)}.teacher-main,.admin-main{padding:16px}.teacher-stats,.admin-stats{grid-template-columns:repeat(2,1fr)}.workspace-grid{grid-template-columns:1fr}.teacher-header{align-items:flex-start}.teacher-user{display:none}}
`;
