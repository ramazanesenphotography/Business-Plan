import AuthShell from './AuthShell';
import Brand from './Brand';

export default function AuthMessagePage({ title, text, action, secondaryAction }) {
  return (
    <AuthShell>
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
    </AuthShell>
  );
}
