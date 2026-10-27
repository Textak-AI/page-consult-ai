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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return { ...result, error: 'Not authenticated' };
    const { data, error } = await supabase.functions.invoke('guest-session', {
      body: { operation: 'migrate', session_token: sessionToken },
    });
    if (error || !data?.success) return { ...result, error: 'Guest migration failed' };
    clearGuestSession();
    return data;

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
