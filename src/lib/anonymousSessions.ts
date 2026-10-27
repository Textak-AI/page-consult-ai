import { supabase } from '@/integrations/supabase/client';

// Session IDs in demo URLs are bearer capabilities, not enumerable record IDs.
export async function demoSessionAccess(sessionToken: string, operation: 'read' | 'create' | 'update' | 'claim', updates?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('demo-update-session', {
    body: { sessionId: sessionToken, operation, updates },
  });
  return { data: data?.session ?? null, error };
}
export const readDemoSession = (token: string) => demoSessionAccess(token, 'read');
export const updateDemoSession = (token: string, updates: Record<string, unknown>) => demoSessionAccess(token, 'update', updates);
export const createDemoSession = (token: string, updates: Record<string, unknown> = {}) => demoSessionAccess(token, 'create', updates);
export const claimDemoSession = (token: string) => demoSessionAccess(token, 'claim');