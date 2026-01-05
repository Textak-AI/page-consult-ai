import { supabase } from '@/integrations/supabase/client';
import { clearGuestSession, getGuestSessionToken } from './guestSession';

interface MigrationResult {
  success: boolean;
  migratedItems: {
    consultation: boolean;
    brief: boolean;
    page: boolean;
    lead: boolean;
  };
  error?: string;
}

export async function convertGuestToUser(
  sessionToken: string,
  userId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedItems: {
      consultation: false,
      brief: false,
      page: false,
      lead: false
    }
  };

  try {
    // 1. Get the guest session
    const { data: session, error: sessionError } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      result.error = 'Guest session not found';
      return result;
    }

    // 2. Update guest session with conversion info
    await supabase
      .from('guest_sessions')
      .update({
        converted_to_user_id: userId,
        converted_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // 3. Migrate consultation(s)
    const { error: consultationError } = await supabase
      .from('consultations')
      .update({ user_id: userId })
      .eq('guest_session_id', session.id);

    if (!consultationError) {
      result.migratedItems.consultation = true;
    }

    // 4. Migrate generated brief(s) - if strategy_briefs table exists
    if (session.generated_brief_id) {
      // Try to update - table might not exist
      try {
        const { error: briefError } = await supabase
          .from('landing_pages')
          .update({ user_id: userId })
          .eq('id', session.generated_brief_id);

        if (!briefError) {
          result.migratedItems.brief = true;
        }
      } catch (e) {
        console.log('Brief migration skipped:', e);
      }
    }

    // 5. Migrate generated page(s)
    if (session.generated_page_id) {
      const { error: pageError } = await supabase
        .from('landing_pages')
        .update({ user_id: userId })
        .eq('id', session.generated_page_id);

      if (!pageError) {
        result.migratedItems.page = true;
      }
    }

    // 6. Update leads record
    const { error: leadError } = await supabase
      .from('leads')
      .update({
        converted_to_user_id: userId,
        converted_at: new Date().toISOString()
      })
      .eq('guest_session_id', session.id);

    if (!leadError) {
      result.migratedItems.lead = true;
    }

    // 7. Clear localStorage token
    clearGuestSession();

    result.success = true;
    return result;

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Migration failed';
    return result;
  }
}

// Call this after successful signup/login
export async function handlePostAuthMigration(userId: string): Promise<MigrationResult | null> {
  const token = getGuestSessionToken();
  
  if (token) {
    const result = await convertGuestToUser(token, userId);
    
    if (result.success) {
      console.log('✅ Guest session migrated:', result.migratedItems);
    } else {
      console.error('❌ Migration failed:', result.error);
    }
    
    return result;
  }
  
  return null;
}
