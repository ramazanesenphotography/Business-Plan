import { useCallback, useMemo, useState } from 'react';
import { createWorkspace, deleteWorkspace, fetchUsersByWorkspace, fetchWorkspaces, updateWorkspace } from '../services/workspacesService';

export default function useAdminWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);

  const refreshWorkspaces = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await fetchWorkspaces();
    setLoading(false);

    if (error) {
      setError(error.message || 'Unable to load workspaces.');
      return;
    }

    setWorkspaces(data || []);
  }, []);

  const loadAssignedUsers = useCallback(async (slug) => {
    if (!slug) {
      setAssignedUsers([]);
      return;
    }

    const { data, error } = await fetchUsersByWorkspace(slug);
    if (error) {
      setAssignedUsers([]);
      return;
    }

    setAssignedUsers(data || []);
  }, []);

  const saveWorkspace = useCallback(async (payload, mode) => {
    setSaving(true);
    setError('');

    let result;
    if (mode === 'create') {
      result = await createWorkspace(payload);
    } else {
      result = await updateWorkspace(payload.id, payload);
    }

    setSaving(false);

    if (result.error) {
      const message = result.error.message || 'Unable to save workspace.';
      setToast({ type: 'error', message });
      return { error: result.error };
    }

    setToast({ type: 'success', message: mode === 'create' ? 'Workspace created.' : 'Workspace updated.' });
    await refreshWorkspaces();
    return { data: result.data };
  }, [refreshWorkspaces]);

  const toggleWorkspace = useCallback(async (workspace) => {
    const nextValue = !workspace.is_active;
    const { error } = await updateWorkspace(workspace.id, { is_active: nextValue, updated_at: new Date().toISOString() });
    if (error) {
      setToast({ type: 'error', message: error.message || 'Unable to change workspace status.' });
      return;
    }

    setToast({ type: 'success', message: nextValue ? 'Workspace activated.' : 'Workspace deactivated.' });
    await refreshWorkspaces();
  }, [refreshWorkspaces]);

  const removeWorkspace = useCallback(async (workspace) => {
    if (!workspace?.id) return;

    const { data: linkedUsers, error: usersError } = await fetchUsersByWorkspace(workspace.slug);
    if (usersError) {
      setToast({ type: 'error', message: usersError.message || 'Unable to verify workspace usage.' });
      return;
    }

    if ((linkedUsers || []).length > 0) {
      setToast({ type: 'error', message: 'Workspace cannot be deleted while users are assigned.' });
      return;
    }

    const { error } = await deleteWorkspace(workspace.id);
    if (error) {
      setToast({ type: 'error', message: error.message || 'Unable to delete workspace.' });
      return;
    }

    setToast({ type: 'success', message: 'Workspace deleted.' });
    await refreshWorkspaces();
  }, [refreshWorkspaces]);

  const summary = useMemo(() => ({
    total: workspaces.length,
    active: workspaces.filter((workspace) => workspace.is_active).length,
    inactive: workspaces.filter((workspace) => !workspace.is_active).length
  }), [workspaces]);

  return {
    workspaces,
    loading,
    error,
    toast,
    saving,
    setToast,
    summary,
    refreshWorkspaces,
    saveWorkspace,
    toggleWorkspace,
    removeWorkspace,
    selectedWorkspace,
    setSelectedWorkspace,
    assignedUsers,
    loadAssignedUsers
  };
}
