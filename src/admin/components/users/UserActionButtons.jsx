export default function UserActionButtons({ user, loading, onApprove, onSuspend, onReactivate }) {
  const isBusy = Boolean(loading);

  return (
    <div className="admin-actions-row">
      {user.approval_status !== 'approved' && (
        <button
          className="admin-action-btn approve"
          disabled={isBusy}
          onClick={onApprove}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>
      )}

      {user.approval_status !== 'suspended' && (
        <button
          className="admin-action-btn suspend"
          disabled={isBusy}
          onClick={onSuspend}
        >
          {loading === 'suspend' ? 'Suspending…' : 'Suspend'}
        </button>
      )}

      {user.approval_status === 'suspended' && (
        <button
          className="admin-action-btn reactivate"
          disabled={isBusy}
          onClick={onReactivate}
        >
          {loading === 'reactivate' ? 'Reactivating…' : 'Reactivate'}
        </button>
      )}
    </div>
  );
}
