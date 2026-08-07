import { supabase } from '../../supabaseClient';

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUp(email, password, fullName) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { full_name: fullName.trim() }
    }
  });
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export function getLocalDirectAccess() {
  return localStorage.getItem('businessplan_local_direct_access') === 'true';
}

export function setLocalDirectAccess(value) {
  if (value) {
    localStorage.setItem('businessplan_local_direct_access', 'true');
  } else {
    localStorage.removeItem('businessplan_local_direct_access');
  }
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
