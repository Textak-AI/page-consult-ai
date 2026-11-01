// Share/preview links: one helper for the Share dialog and the Preview button.
// The /preview/:token route resolves a token server-side (get-preview-link);
// a page slug is NOT a token, which is why Preview used to land on "Preview not found".
import { supabase } from '@/integrations/supabase/client';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** 12 characters (preview_links.token is VARCHAR(12)) from a cryptographic source: the token is a capability, so Math.random won't do. */
export function generatePreviewToken(length = 12): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function createPreviewLink(landingPageId: string): Promise<{ token: string; expires_at: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const token = generatePreviewToken();
  const expires_at = new Date(Date.now() + WEEK_MS).toISOString();
  const { error } = await supabase.from('preview_links').insert({ landing_page_id: landingPageId, token, expires_at, created_by: user.id });
  if (error) {
    console.error('🔴 [previewLink] create failed:', error.message);
    return null;
  }
  return { token, expires_at };
}

export async function getOrCreatePreviewLink(landingPageId: string): Promise<{ token: string; expires_at: string } | null> {
  const { data: existing } = await supabase
    .from('preview_links')
    .select('token, expires_at')
    .eq('landing_page_id', landingPageId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return existing ?? createPreviewLink(landingPageId);
}
