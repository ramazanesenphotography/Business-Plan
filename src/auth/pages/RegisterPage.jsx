import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Brand from '../shared/Brand';
import { signUp } from '../services/authService';

export default function RegisterPage({ onSession, onVerificationSent }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', profileType: 'photographer' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setBusy(true);
    const { data, error } = await signUp(form.email, form.password, form.fullName, form.profileType);
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      onSession(data.session);
      return;
    }

    onVerificationSent(form.email);
    navigate('/waiting-approval');
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-card">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-tabs">
          <button type="button" onClick={() => navigate('/login')}>Sign In</button>
          <button type="button" className="active">Create Account</button>
        </div>
        <h2>Create your account</h2>
        <p className="auth-muted">Your email must be verified and your account approved by an administrator.</p>

        <form onSubmit={submit}>
          <label>
            Full name
            <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Your full name" />
          </label>

          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" />
          </label>

          <label>
            Profile type
            <select value={form.profileType} onChange={(event) => setForm({ ...form, profileType: event.target.value })}>
              <option value="photographer">Photographer</option>
              <option value="teacher">Teacher</option>
              <option value="creator">Creator</option>
              <option value="agency">Agency</option>
            </select>
          </label>

          <label>
            Password
            <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" />
          </label>

          <label>
            Confirm password
            <input required minLength={6} type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat password" />
          </label>

          {message && <div className="auth-alert">{message}</div>}

          <button className="auth-primary" disabled={busy}>
            {busy ? 'Please wait...' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
