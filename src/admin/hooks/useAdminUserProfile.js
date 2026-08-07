import { useCallback, useState } from 'react';
import { updateUserProfile } from '../services/adminUserProfileService';

export default function useAdminUserProfile({ onRefresh }) {
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const saveUser = useCallback(async (userId, updates) => {
    if (!userId) return;

    setSaving(true);
    const { data, error } = await updateUserProfile(userId, updates);
    setSaving(false);

    if (error) {
      setToast({ type: 'error', message: error.message || 'Unable to save changes.' });
      return { data: null, error };
    }

    setToast({ type: 'success', message: 'User updated successfully.' });
    setEditingUser(data);
    if (onRefresh) await onRefresh();
    return { data, error: null };
  }, [onRefresh]);

  return { editingUser, setEditingUser, saving, toast, setToast, saveUser };
}
