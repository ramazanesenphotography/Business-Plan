import { useState } from 'react';
import { updateUserApprovalStatus } from '../services/adminUserActionsService';

export default function useAdminUserActions({ onRefresh }) {
  const [busyAction, setBusyAction] = useState('');
  const [toast, setToast] = useState(null);

  async function runAction(user, action) {
    if (!user?.id || busyAction) return;

    const actionLabel = action === 'approve' ? 'approve' : action === 'suspend' ? 'suspend' : 'reactivate';
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} this user?`);
    if (!confirmed) return;

    setBusyAction(action);

    const { error } = await updateUserApprovalStatus(user.id, action === 'approve' ? 'approved' : action === 'suspend' ? 'suspended' : 'approved');
    setBusyAction('');

    if (error) {
      setToast({ type: 'error', message: error.message || 'Unable to update user status.' });
      return;
    }

    setToast({ type: 'success', message: `User ${actionLabel}d successfully.` });
    if (onRefresh) await onRefresh();
  }

  return { busyAction, toast, setToast, runAction };
}
