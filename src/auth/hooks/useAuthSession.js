import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSession, onAuthStateChange, signOut as signOutService } from '../services/authService';
import { supabase } from '../../supabaseClient';

export default function useAuthSession() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [localDirectAccess, setLocalDirectAccess] = useState(() => localStorage.getItem('businessplan_local_direct_access') === 'true');

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    setProfileLoading(false);

    if (error) {
      setProfileError(error.message);
      return;
    }

    setProfile(data);
  }, []);

  useEffect(() => {
    getSession().then(({ data }) => {
      setSession(data.session || null);
      if (data.session?.user?.id) loadProfile(data.session.user.id);
    });

    const { data: listener } = onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }

      setSession(nextSession || null);

      if (nextSession?.user?.id && event !== 'PASSWORD_RECOVERY') {
        setTimeout(() => loadProfile(nextSession.user.id), 0);
      } else if (!nextSession) {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    localStorage.removeItem('businessplan_local_direct_access');
    setLocalDirectAccess(false);
    await signOutService();
    setSession(null);
    setProfile(null);
  }, []);

  const expired = useMemo(() => {
    if (!profile?.subscription_end) return false;
    return new Date(profile.subscription_end).getTime() < Date.now();
  }, [profile]);

  return {
    session,
    profile,
    profileLoading,
    profileError,
    passwordRecovery,
    localDirectAccess,
    setLocalDirectAccess,
    loadProfile,
    signOut,
    expired,
    setProfile,
    setPasswordRecovery,
    setSession
  };
}
