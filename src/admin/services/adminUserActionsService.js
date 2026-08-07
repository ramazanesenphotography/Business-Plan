import { supabase } from '../../supabaseClient';

export async function updateUserApprovalStatus(userId, approvalStatus) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ approval_status: approvalStatus })
    .eq('id', userId)
    .select('*')
    .single();

  return { data, error };
}
