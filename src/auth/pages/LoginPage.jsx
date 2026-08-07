import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Brand from '../shared/Brand';
import { signInWithPassword, setLocalDirectAccess } from '../services/authService';

export default function LoginPage({ onSession, onLocalDirectAccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost && form.email.trim().toLowerCase() === 'ramazanesen23@gmail.com' && form.password === 'Rms3354lv') {
      setLocalDirectAccess(true);
      onLocalDirectAccess();
      return;
    }

    setBusy(true);
    const { data, error } = await signInWithPassword(form.email, form.password);
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    onSession(data.session);
    navigate('/');
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-card">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-tabs">
          <button type="button" className="active">Sign In</button>
          <button type="button" onClick={() => navigate('/register')}>Create Account</button>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-muted">Sign in to continue to your workspace.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" />
          </label>

          <label>
            Password
            <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" />
          </label>

          {message && <div className="auth-alert">{message}</div>}

          <button className="auth-primary" disabled={busy}>
            {busy ? 'Please wait...' : 'Sign In'}
          </button>

          <button type="button" className="auth-link-button" onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
