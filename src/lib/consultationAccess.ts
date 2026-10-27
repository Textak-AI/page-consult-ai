import { supabase } from '@/integrations/supabase/client';
import { getGuestSessionToken } from './guestSession';

// Preserve the original authenticated query; guest access is restricted to an
// explicit consultation ID validated against the guest token on the server.
export function consultationAccess() {
  let query: any = supabase.from('consultations');
  let consultationId: string | undefined;
  let updates: Record<string, unknown> | undefined;
  let supported = true;
  const builder: any = {};
  for (const method of ['select', 'update', 'eq', 'single', 'maybeSingle', 'order', 'limit', 'insert', 'upsert', 'is', 'in', 'delete']) {
    builder[method] = (...args: any[]) => {
      if (method === 'eq' && args[0] === 'id') consultationId = args[1];
      if (method === 'update') updates = args[0];
      if (['insert', 'upsert', 'delete', 'in'].includes(method)) supported = false;
      query = query[method](...args);
      return builder;
    };
  }
  builder.then = (resolve: (value: any) => unknown, reject: (error: unknown) => unknown) => (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return await query;
    const token = getGuestSessionToken();
    if (!supported || !token || !consultationId) return { data: null, error: { message: 'Authenticated user or valid guest consultation required' } };
    const { data, error } = await supabase.functions.invoke('guest-session', {
      body: { operation: updates ? 'update-consultation' : 'read-consultation', session_token: token, consultation_id: consultationId, consultation_updates: updates },
    });
    return { data: data?.consultation ?? null, error };
  })().then(resolve, reject);
  return builder;
}