import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Brand from '../shared/Brand';
import { resetPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (!email.trim()) {
      setMessage('Enter your email address first.');
      return;
    }

    setBusy(true);
    const { error } = await resetPassword(email);
    setBusy(false);
    setMessage(error ? error.message : 'Password reset email sent.');
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-card">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <h2>Reset your password</h2>
        <p className="auth-muted">Choose a new password for your Business Plan account.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>

          {message && <div className="auth-alert">{message}</div>}

          <button className="auth-primary" disabled={busy}>
            {busy ? 'Please wait...' : 'Send reset email'}
          </button>

          <button type="button" className="auth-link-button" onClick={() => navigate('/login')}>
            Back to Sign In
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
