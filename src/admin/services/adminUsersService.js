import { supabase } from '../../supabaseClient';

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}
