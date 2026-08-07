import { supabase } from '../../supabaseClient';

function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase();
  return ['admin', 'photographer', 'teacher', 'creator', 'agency'].includes(value) ? value : 'photographer';
}

function normalizeWorkspace(role) {
  const value = normalizeRole(role);
  return ['admin', 'photographer', 'teacher', 'creator', 'agency'].includes(value) ? value : 'photographer';
}

function toSupabaseDateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultSubscriptionDates(plan = 'trial') {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (plan === 'starter') {
    end.setMonth(end.getMonth() + 3);
  } else if (plan === 'pro') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setDate(end.getDate() + 14);
  }

  return {
    subscription_start: toSupabaseDateValue(start),
    subscription_end: toSupabaseDateValue(end)
  };
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUp(email, password, fullName, profileType = 'photographer') {
  const role = normalizeRole(profileType);
  const workspace = normalizeWorkspace(profileType);
  const dates = getDefaultSubscriptionDates('trial');

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName.trim(),
        role,
        selected_workspace: workspace,
        subscription_plan: 'trial',
        subscription_start: dates.subscription_start,
        subscription_end: dates.subscription_end,
        approval_status: 'pending',
        onboarding_completed: true
      }
    }
  });

  if (error || !data?.user?.id) {
    return { data, error };
  }

  const existingProfile = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!existingProfile.error && !existingProfile.data) {
    await supabase.from('profiles').insert([{
      id: data.user.id,
      email: email.trim(),
      full_name: fullName.trim(),
      role,
      selected_workspace: workspace,
      approval_status: 'pending',
      onboarding_completed: true,
      subscription_plan: 'trial',
      subscription_start: dates.subscription_start,
      subscription_end: dates.subscription_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);
  }

  return { data, error: null };
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function chooseWorkspace(requestedWorkspace) {
  return supabase.rpc('choose_workspace', { requested_workspace: requestedWorkspace });
}
