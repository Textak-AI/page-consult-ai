import { supabase } from '@/integrations/supabase/client';

const GUEST_SESSION_KEY = 'pageconsult_guest_session';

export interface GuestSession {
  id: string;
  sessionToken: string;
  email: string | null;
  consultationData: Record<string, any>;
  intelligenceState: Record<string, any>;
  generatedBriefId: string | null;
  generatedPageId: string | null;
  createdAt: string;
  expiresAt: string;
}

// Generate a secure random token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to map DB row to interface
function mapToGuestSession(row: any): GuestSession {
  return {
    id: row.id,
    sessionToken: row.session_token,
    email: row.email,
    consultationData: row.consultation_data || {},
    intelligenceState: row.intelligence_state || {},
    generatedBriefId: row.generated_brief_id,
    generatedPageId: row.generated_page_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at
  };
}

// Get or create guest session
export async function getOrCreateGuestSession(): Promise<GuestSession> {
  // Check localStorage for existing token
  const existingToken = localStorage.getItem(GUEST_SESSION_KEY);
  
  if (existingToken) {
    // Try to fetch existing session
    const { data, error } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('session_token', existingToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (data && !error) {
      return mapToGuestSession(data);
    }
    
    // Session expired or invalid, remove it
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
  
  // Create new session
  const newToken = generateSessionToken();
  
  const { data, error } = await supabase
    .from('guest_sessions')
    .insert({
      session_token: newToken
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Store token in localStorage
  localStorage.setItem(GUEST_SESSION_KEY, newToken);
  
  return mapToGuestSession(data);
}

// Update guest session data
export async function updateGuestSession(
  updates: Partial<{
    email: string;
    consultationData: Record<string, any>;
    intelligenceState: Record<string, any>;
    generatedBriefId: string;
    generatedPageId: string;
  }>
): Promise<void> {
  const token = localStorage.getItem(GUEST_SESSION_KEY);
  if (!token) throw new Error('No guest session');
  
  const updatePayload: Record<string, any> = {};
  
  if (updates.email !== undefined) updatePayload.email = updates.email;
  if (updates.consultationData !== undefined) updatePayload.consultation_data = updates.consultationData;
  if (updates.intelligenceState !== undefined) updatePayload.intelligence_state = updates.intelligenceState;
  if (updates.generatedBriefId !== undefined) updatePayload.generated_brief_id = updates.generatedBriefId;
  if (updates.generatedPageId !== undefined) updatePayload.generated_page_id = updates.generatedPageId;
  
  const { error } = await supabase
    .from('guest_sessions')
    .update(updatePayload)
    .eq('session_token', token);
  
  if (error) throw error;
}

// Get current guest session
export async function getCurrentGuestSession(): Promise<GuestSession | null> {
  const token = localStorage.getItem(GUEST_SESSION_KEY);
  if (!token) return null;
  
  const { data, error } = await supabase
    .from('guest_sessions')
    .select('*')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) return null;
  
  return mapToGuestSession(data);
}

// Get guest session token from localStorage
export function getGuestSessionToken(): string | null {
  return localStorage.getItem(GUEST_SESSION_KEY);
}

// Check if user is authenticated or has guest session
export async function getSessionContext(): Promise<{
  type: 'authenticated' | 'guest' | 'none';
  userId?: string;
  guestSessionId?: string;
  email?: string;
}> {
  // Check for authenticated user first
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return {
      type: 'authenticated',
      userId: user.id,
      email: user.email || undefined
    };
  }
  
  // Check for guest session
  const guestSession = await getCurrentGuestSession();
  
  if (guestSession) {
    return {
      type: 'guest',
      guestSessionId: guestSession.id,
      email: guestSession.email || undefined
    };
  }
  
  return { type: 'none' };
}

// Clear guest session (on logout or conversion)
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
}

// Calculate time remaining until expiration
export function getTimeRemaining(expiresAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalSeconds: number;
} {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true, totalSeconds: 0 };
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
    totalSeconds
  };
}

// Check if there's an active guest session
export function hasGuestSession(): boolean {
  return localStorage.getItem(GUEST_SESSION_KEY) !== null;
}
