import { NavLink, Outlet } from 'react-router-dom';
import Brand from '../../auth/shared/Brand';

export default function AdminLayout() {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-role">ADMIN CONTROL CENTER</div>
        <nav>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
            ▦ Users
          </NavLink>
          <button type="button" disabled>◫ Subscriptions</button>
          <button type="button" disabled>▥ Workspaces</button>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
