import { NavLink, Outlet } from 'react-router-dom';
import Brand from '../../auth/shared/Brand';

export default function AdminLayout({ onSignOut }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-role">ADMIN CONTROL CENTER</div>
        <nav>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
            ▦ Users
          </NavLink>
          <NavLink to="/admin/subscriptions" className={({ isActive }) => (isActive ? 'active' : '')}>
            ◫ Subscriptions
          </NavLink>
          <NavLink to="/admin/workspaces" className={({ isActive }) => (isActive ? 'active' : '')}>
            ▥ Workspaces
          </NavLink>
        </nav>
        <button type="button" className="teacher-signout" onClick={onSignOut}>
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
