import { supabase } from '@/integrations/supabase/client';
import { updateGuestSession, getCurrentGuestSession } from './guestSession';

export async function captureEmail(
  email: string,
  consultationData: Record<string, any>,
  source: string = 'consultation_complete'
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentGuestSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // Update guest session with email
    await updateGuestSession({ email });

    // Create lead record
    const { error } = await supabase
      .from('leads')
      .insert({
        email,
        guest_session_id: session.id,
        source,
        consultation_snapshot: consultationData
      });

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error('Lead capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save'
    };
  }
}

// Check if email was already captured for this session
export async function hasEmailCaptured(): Promise<boolean> {
  const session = await getCurrentGuestSession();
  return session?.email !== null && session?.email !== undefined;
}
