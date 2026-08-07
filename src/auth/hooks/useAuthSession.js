import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSession, onAuthStateChange, signOut as signOutService } from '../services/authService';
import { supabase } from '../../supabaseClient';

export default function useAuthSession() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const listenerRef = useRef(null);

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
    let isMounted = true;

    getSession().then(({ data }) => {
      if (!isMounted) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      if (nextSession?.user?.id) {
        loadProfile(nextSession.user.id);
      }
    });

    if (!listenerRef.current) {
      const { data: listener } = onAuthStateChange((event, nextSession) => {
        if (!isMounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
        } else {
          setPasswordRecovery(false);
        }

        setSession(nextSession || null);

        if (nextSession?.user?.id && event !== 'PASSWORD_RECOVERY') {
          loadProfile(nextSession.user.id);
        } else if (!nextSession) {
          setProfile(null);
          setProfileError('');
        }
      });

      listenerRef.current = listener.subscription;
    }

    return () => {
      isMounted = false;
      if (listenerRef.current) {
        listenerRef.current.unsubscribe();
        listenerRef.current = null;
      }
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await signOutService();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSession(null);
      setProfile(null);
      setProfileError('');
      setPasswordRecovery(false);
    }
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
    loadProfile,
    signOut,
    expired,
    setProfile,
    setPasswordRecovery,
    setSession
  };
}
