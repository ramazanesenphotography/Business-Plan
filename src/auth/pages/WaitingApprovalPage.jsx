import { useNavigate } from 'react-router-dom';
import AuthMessagePage from '../shared/AuthMessagePage';

export default function WaitingApprovalPage({ email }) {
  const navigate = useNavigate();

  return (
    <AuthMessagePage
      title="Check your email"
      text={`We sent a verification link to ${email}. Open the email and confirm your address, then return here to sign in.`}
      action={
        <button className="auth-primary" onClick={() => navigate('/login')}>
          Back to Sign In
        </button>
      }
    />
  );
}
