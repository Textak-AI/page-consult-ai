import { supabase } from '@/integrations/supabase/client';

/**
 * Get authorization headers for edge function calls
 * @returns Headers with Authorization bearer token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in to continue.');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}
