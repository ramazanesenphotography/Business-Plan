import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Brand from '../shared/Brand';
import { signInWithPassword } from '../services/authService';

export default function LoginPage({ onSession }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setBusy(true);

    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error) {
        setMessage(error.message || 'Unable to sign in.');
        return;
      }

      if (!data?.session) {
        setMessage('Sign in succeeded, but no session was returned.');
        return;
      }

      onSession(data.session);
      navigate('/');
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
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

          <button type="submit" className="auth-primary" disabled={busy}>
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
