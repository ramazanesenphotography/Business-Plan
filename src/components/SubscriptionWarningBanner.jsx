export default function SubscriptionWarningBanner({ isExpired, plan, message }) {
  if (!isExpired) return null;

  return (
    <div style={{
      marginBottom: 14,
      padding: '12px 14px',
      borderRadius: 14,
      border: '1px solid rgba(248, 113, 113, 0.3)',
      background: 'rgba(248, 113, 113, 0.12)',
      color: '#fecaca',
      fontSize: 13,
      lineHeight: 1.5
    }}>
      <strong style={{ display: 'block', marginBottom: 3 }}>Read-only mode</strong>
      <span>
        {message || `Your ${plan || 'current'} subscription has expired, so creating and editing records is temporarily disabled.`}
      </span>
    </div>
  );
}
