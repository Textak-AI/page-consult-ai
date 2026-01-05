import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  GuestSession, 
  getOrCreateGuestSession, 
  getCurrentGuestSession, 
  updateGuestSession, 
  clearGuestSession,
  getSessionContext,
  hasGuestSession
} from '@/lib/guestSession';

interface UseGuestSessionResult {
  session: GuestSession | null;
  isLoading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  initSession: () => Promise<GuestSession>;
  updateSession: (updates: Partial<{
    email: string;
    consultationData: Record<string, any>;
    intelligenceState: Record<string, any>;
    generatedBriefId: string;
    generatedPageId: string;
  }>) => Promise<void>;
  clearSession: () => void;
  refresh: () => Promise<void>;
}

export function useGuestSession(): UseGuestSessionResult {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const context = await getSessionContext();
      
      if (context.type === 'authenticated') {
        setIsAuthenticated(true);
        setUserId(context.userId || null);
        setSession(null);
      } else if (context.type === 'guest') {
        setIsAuthenticated(false);
        setUserId(null);
        const guestSession = await getCurrentGuestSession();
        setSession(guestSession);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to refresh session context:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (event === 'SIGNED_IN' && authSession?.user) {
        setIsAuthenticated(true);
        setUserId(authSession.user.id);
        setSession(null);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserId(null);
        refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const initSession = useCallback(async (): Promise<GuestSession> => {
    const newSession = await getOrCreateGuestSession();
    setSession(newSession);
    return newSession;
  }, []);

  const updateSessionData = useCallback(async (updates: Partial<{
    email: string;
    consultationData: Record<string, any>;
    intelligenceState: Record<string, any>;
    generatedBriefId: string;
    generatedPageId: string;
  }>) => {
    await updateGuestSession(updates);
    // Refresh to get updated data
    const updated = await getCurrentGuestSession();
    setSession(updated);
  }, []);

  const clearSessionData = useCallback(() => {
    clearGuestSession();
    setSession(null);
  }, []);

  return {
    session,
    isLoading,
    isGuest: !isAuthenticated && session !== null,
    isAuthenticated,
    userId,
    email: session?.email || null,
    initSession,
    updateSession: updateSessionData,
    clearSession: clearSessionData,
    refresh
  };
}

export default useGuestSession;
