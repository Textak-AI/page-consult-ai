import type { SupabaseClient } from '@supabase/supabase-js';

export function passwordRecoveryRedirect(origin: string): string {
  return `${origin}/reset-password`;
}

export function hasRecoveryLink(url: string): boolean {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.slice(1));
  if (hash.has('error') || parsed.searchParams.has('error')) return false;
  return hash.get('type') === 'recovery' || parsed.searchParams.get('type') === 'recovery'
    || (parsed.pathname === '/reset-password' && parsed.searchParams.has('code'));
}

export function validateRecoveryPassword(password: string, confirmation: string): string | null {
  if (password.length < 6) return 'Please use at least 6 characters for your password.';
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}

// Intentionally return the same outcome for existing and unknown accounts,
// including provider errors that could otherwise reveal account existence.
export async function requestPasswordRecovery(
  auth: Pick<SupabaseClient['auth'], 'resetPasswordForEmail'>,
  email: string,
  origin: string,
): Promise<void> {
  try {
    await auth.resetPasswordForEmail(email.trim(), { redirectTo: passwordRecoveryRedirect(origin) });
  } catch {
    // The public confirmation must remain account-neutral.
  }
}