import AuthShell from '../shared/AuthShell';
import Brand from '../shared/Brand';

export default function AuthLayout({ children }) {
  return (
    <AuthShell>
      <div className="auth-layout">
        <section className="auth-showcase">
          <Brand />
          <div className="auth-showcase-copy">
            <span className="auth-kicker">ONE PLATFORM · MULTIPLE PROFESSIONS</span>
            <h1>Run your business from one clean workspace.</h1>
            <p>
              Start with Photographer or Teacher. More professional workspaces can be added later without changing the account system.
            </p>
          </div>
          <div className="auth-mini-grid">
            <div>
              <b>📷</b>
              <span>Photographer</span>
            </div>
            <div>
              <b>🎓</b>
              <span>Teacher</span>
            </div>
            <div className="auth-coming">
              <b>＋</b>
              <span>More soon</span>
            </div>
          </div>
        </section>

        <section className="auth-form-side">{children}</section>
      </div>
    </AuthShell>
  );
}
