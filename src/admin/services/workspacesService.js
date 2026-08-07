import { supabase } from '../../supabaseClient';

export async function fetchWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function createWorkspace(payload) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert(payload)
    .select('*')
    .single();

  return { data, error };
}

export async function updateWorkspace(id, payload) {
  const { data, error } = await supabase
    .from('workspaces')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  return { data, error };
}

export async function deleteWorkspace(id) {
  const { error } = await supabase.from('workspaces').delete().eq('id', id);
  return { error };
}

export async function fetchUsersByWorkspace(slug) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, selected_workspace')
    .eq('selected_workspace', slug);

  return { data: data || [], error };
}
